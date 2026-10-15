import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { Role, ReportStatus } from "@prisma/client";

// PATCH /api/admin/reports/[id]/review
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(Role.admin);
    const { id } = await context.params;

    const existingReport = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            identifier: true,
            email: true,
          },
        },
      },
    });

    if (!existingReport) {
      return NextResponse.json(
        { message: "Laporan tidak ditemukan." },
        { status: 404 }
      );
    }

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status: ReportStatus.reviewed,
        reviewed_at: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            identifier: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Laporan berhasil ditandai sebagai telah diperiksa (reviewed).",
      report: updated,
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("PATCH /api/admin/reports/:id/review error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
