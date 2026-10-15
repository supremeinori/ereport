import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth";
import { Role } from "@prisma/client";
import { getStorageProvider } from "@/lib/storage";

// GET /api/reports/[id]/download
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    const report = await prisma.report.findUnique({
      where: { id },
      select: {
        id: true,
        user_id: true,
        period_year: true,
        period_semester: true,
        file_path: true,
        original_filename: true,
        status: true,
      },
    });

    // FILE-07, TST-03: Jangan beri tahu keberadaan laporan kepada pihak yang tidak berhak
    if (!report) {
      return NextResponse.json({ message: "Laporan tidak ditemukan." }, { status: 404 });
    }

    // SEC-07, SEC-08: Admin boleh unduh semua; reporter hanya miliknya sendiri
    if (user.role === Role.reporter && report.user_id !== user.id) {
      // Kembalikan 404 bukan 403 agar keberadaan laporan tidak bocor (TST-03)
      return NextResponse.json({ message: "Laporan tidak ditemukan." }, { status: 404 });
    }

    const storage = getStorageProvider();
    // Signed URL berumur 60 detik (FILE-07)
    const signedUrl = await storage.getSignedDownloadUrl(report.file_path, 60);

    // Sanitasi nama file untuk Content-Disposition
    const safeFilename = report.original_filename.replace(/[^\w\s.-]/g, "_");

    return NextResponse.json({
      url: signedUrl,
      filename: safeFilename,
      expires_in_seconds: 60,
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("GET /api/reports/:id/download error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
