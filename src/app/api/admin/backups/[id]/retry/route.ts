import { NextRequest, NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth";
import { Role } from "@prisma/client";
import { executeBackup } from "@/lib/backup";

// POST /api/admin/backups/[id]/retry
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(Role.admin);
    const { id } = await context.params;

    const result = await executeBackup(id);

    if (!result.isConfigured) {
      return NextResponse.json(
        {
          success: false,
          is_configured: false,
          message:
            "Integrasi Google Drive belum dikonfigurasi di environment server. Konfigurasikan variabel GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, dan GOOGLE_DRIVE_FOLDER_ID terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          is_configured: true,
          message: `Proses backup gagal: ${result.errorMessage}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      is_configured: true,
      message: "Proses backup ke Google Drive berhasil diselesaikan.",
      drive_file_id: result.driveFileId,
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("POST /api/admin/backups/:id/retry error:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
