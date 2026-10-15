import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/auth";
import { Role } from "@prisma/client";
import { getStorageProvider } from "@/lib/storage";

const TEMPLATE_STORAGE_KEY = "templates/template_laporan_pboba.xlsx";

// GET /api/template/download — reporter & admin mengunduh template
export async function GET() {
  try {
    await requireAuth();

    const storage = getStorageProvider();
    // Signed URL 5 menit untuk template
    const signedUrl = await storage.getSignedDownloadUrl(TEMPLATE_STORAGE_KEY, 300);

    return NextResponse.json({
      url: signedUrl,
      filename: "Template_Laporan_Distribusi_PBOBA.xlsx",
      expires_in_seconds: 300,
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("GET /api/template/download error:", err);
    return NextResponse.json(
      { message: "Template belum tersedia atau terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// PUT /api/template/download — admin mengupload template baru
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== Role.admin) {
      return NextResponse.json(
        { message: "Hanya administrator yang dapat mengelola template resmi." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "Berkas template wajib disertakan." },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return NextResponse.json(
        { message: "Template harus berformat .xlsx." },
        { status: 400 }
      );
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Ukuran template tidak boleh melebihi 20 MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validasi magic bytes ZIP
    if (
      buffer.length < 4 ||
      buffer[0] !== 0x50 ||
      buffer[1] !== 0x4b ||
      (buffer[2] !== 0x03 && buffer[2] !== 0x05 && buffer[2] !== 0x07)
    ) {
      return NextResponse.json(
        { message: "Berkas template tidak valid (bukan format .xlsx yang sebenarnya)." },
        { status: 400 }
      );
    }

    const storage = getStorageProvider();

    // Hapus template lama jika ada, lalu upload yang baru (upsert)
    try {
      await storage.deleteFile(TEMPLATE_STORAGE_KEY);
    } catch {
      // Abaikan jika template belum ada
    }

    await storage.uploadFile(
      TEMPLATE_STORAGE_KEY,
      buffer,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return NextResponse.json({
      success: true,
      message: "Template laporan resmi berhasil diperbarui.",
      filename: file.name,
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("PUT /api/template/download error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memperbarui template." },
      { status: 500 }
    );
  }
}
