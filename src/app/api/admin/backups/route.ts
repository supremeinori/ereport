import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { Role, BackupStatus } from "@prisma/client";
import { isGoogleDriveConfigured } from "@/lib/backup";

// GET /api/admin/backups?status=all|pending|success|failed
export async function GET(request: NextRequest) {
  try {
    await requireRole(Role.admin);

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");

    const whereClause: { backup_status?: BackupStatus } = {};
    if (statusParam === "pending") {
      whereClause.backup_status = BackupStatus.pending;
    } else if (statusParam === "success") {
      whereClause.backup_status = BackupStatus.success;
    } else if (statusParam === "failed") {
      whereClause.backup_status = BackupStatus.failed;
    }

    const backups = await prisma.backup.findMany({
      where: whereClause,
      include: {
        report: {
          select: {
            id: true,
            period_year: true,
            period_semester: true,
            original_filename: true,
            uploaded_at: true,
            user: {
              select: {
                id: true,
                name: true,
                identifier: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Hitung ringkasan status
    const allCounts = await prisma.backup.groupBy({
      by: ["backup_status"],
      _count: {
        id: true,
      },
    });

    let pendingCount = 0;
    let successCount = 0;
    let failedCount = 0;

    for (const item of allCounts) {
      if (item.backup_status === BackupStatus.pending) pendingCount = item._count.id;
      if (item.backup_status === BackupStatus.success) successCount = item._count.id;
      if (item.backup_status === BackupStatus.failed) failedCount = item._count.id;
    }

    const totalCount = pendingCount + successCount + failedCount;

    return NextResponse.json({
      is_configured: isGoogleDriveConfigured(),
      summary: {
        total: totalCount,
        pending: pendingCount,
        success: successCount,
        failed: failedCount,
      },
      backups,
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("GET /api/admin/backups error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
