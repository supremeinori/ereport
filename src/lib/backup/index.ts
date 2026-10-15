import { prisma } from "../prisma";
import { getStorageProvider } from "../storage";
import { BackupStatus } from "@prisma/client";

export interface BackupExecutionResult {
  success: boolean;
  driveFileId?: string;
  errorMessage?: string;
  isConfigured: boolean;
}

/**
 * Memeriksa apakah kredensial Google Drive Service Account telah dikonfigurasi di environment.
 */
export function isGoogleDriveConfigured(): boolean {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  return Boolean(email && email.trim() && key && key.trim() && folderId && folderId.trim());
}

/**
 * Menjalankan proses backup untuk satu record backup tertentu.
 * TST-10: Kegagalan proses backup DILARANG merusak atau mengubah record laporan utama.
 */
export async function executeBackup(backupId: string): Promise<BackupExecutionResult> {
  const backup = await prisma.backup.findUnique({
    where: { id: backupId },
    include: {
      report: true,
    },
  });

  if (!backup) {
    throw new Error(`Record backup dengan ID ${backupId} tidak ditemukan.`);
  }

  const isConfigured = isGoogleDriveConfigured();

  // BKP-04: Jika kredensial belum tersedia, catat status gagal/belum dikonfigurasi secara aman
  if (!isConfigured) {
    const errorMsg = "Layanan Google Drive belum dikonfigurasi di environment server.";
    await prisma.backup.update({
      where: { id: backupId },
      data: {
        backup_status: BackupStatus.failed,
        error_message: errorMsg,
      },
    });

    return {
      success: false,
      errorMessage: errorMsg,
      isConfigured: false,
    };
  }

  try {
    const storage = getStorageProvider();
    // Ambil berkas dari storage utama
    const fileBuffer = await storage.downloadFile(backup.report.file_path);

    // Kirim ke Google Drive API
    const driveFileId = await uploadToGoogleDrive({
      fileName: `BACKUP_${backup.report.period_year}_S${backup.report.period_semester}_${backup.report.original_filename}`,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: fileBuffer,
    });

    // Update record backup ke success
    await prisma.backup.update({
      where: { id: backupId },
      data: {
        backup_status: BackupStatus.success,
        drive_file_id: driveFileId,
        backed_up_at: new Date(),
        error_message: null,
      },
    });

    return {
      success: true,
      driveFileId,
      isConfigured: true,
    };
  } catch (err: unknown) {
    const safeError = err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah ke Google Drive.";
    
    // TST-10: Update hanya record backup ke failed, laporan utama tetap aman
    await prisma.backup.update({
      where: { id: backupId },
      data: {
        backup_status: BackupStatus.failed,
        error_message: safeError.slice(0, 500),
      },
    });

    return {
      success: false,
      errorMessage: safeError,
      isConfigured: true,
    };
  }
}

/**
 * Helper pengunggahan ke Google Drive via REST API v3
 */
async function uploadToGoogleDrive({
  fileName,
  mimeType,
  buffer,
}: {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY!;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;

  // Format private key (replace escaped newlines if needed)
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  // Dapatkan Google OAuth2 access token menggunakan JWT Service Account
  const token = await getGoogleOAuthToken(email, privateKey);

  // Buat boundary multipart
  const boundary = `-------EreportBackupBoundary${Date.now()}`;
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType,
  };

  const multipartRequestBody = Buffer.concat([
    Buffer.from(
      delimiter +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        `Content-Type: ${mimeType}\r\n\r\n`
    ),
    buffer,
    Buffer.from(closeDelimiter),
  ]);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive API error (${res.status}): ${errText}`);
  }

  const json = await res.json();
  return json.id as string;
}

/**
 * Menghasilkan Google OAuth Access Token dari Service Account JWT
 */
async function getGoogleOAuthToken(clientEmail: string, privateKey: string): Promise<string> {
  const crypto = await import("crypto");

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedClaim = Buffer.from(JSON.stringify(claimSet)).toString("base64url");
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signatureInput);
  signer.end();

  const signature = signer.sign(privateKey, "base64url");
  const jwt = `${signatureInput}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Google OAuth error (${tokenRes.status}): ${errText}`);
  }

  const tokenJson = await tokenRes.json();
  return tokenJson.access_token as string;
}
