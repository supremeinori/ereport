import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { Role } from "@prisma/client";

// GET /api/admin/reports?year=YYYY&semester=S
export async function GET(request: NextRequest) {
  try {
    await requireRole(Role.admin);

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const defaultYear = now.getFullYear();
    const defaultSemester = now.getMonth() < 6 ? 1 : 2;

    const yearParam = searchParams.get("year");
    const semesterParam = searchParams.get("semester");

    const year = yearParam ? parseInt(yearParam, 10) : defaultYear;
    const semester = semesterParam ? parseInt(semesterParam, 10) : defaultSemester;

    if (isNaN(year) || year < 2020 || year > 2100) {
      return NextResponse.json(
        { message: "Parameter tahun tidak valid (harus antara 2020 dan 2100)." },
        { status: 400 }
      );
    }

    if (isNaN(semester) || (semester !== 1 && semester !== 2)) {
      return NextResponse.json(
        { message: "Parameter semester tidak valid (harus 1 atau 2)." },
        { status: 400 }
      );
    }

    // 1. Ambil seluruh entitas reporter yang aktif
    const activeReporters = await prisma.user.findMany({
      where: {
        role: Role.reporter,
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        identifier: true,
        email: true,
        is_active: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // 2. Ambil laporan pada periode tahun & semester terpilih
    const reports = await prisma.report.findMany({
      where: {
        period_year: year,
        period_semester: semester,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            identifier: true,
            email: true,
            is_active: true,
          },
        },
      },
      orderBy: {
        uploaded_at: "desc",
      },
    });

    // Set of reporter IDs that have submitted
    const submittedUserIds = new Set(reports.map((r) => r.user_id));

    // Daftar reporter aktif yang belum mengirim laporan untuk periode ini
    const unsubmittedReporters = activeReporters.filter(
      (rep) => !submittedUserIds.has(rep.id)
    );

    const totalReporters = activeReporters.length;
    const submittedCount = reports.length;
    const reviewedCount = reports.filter((r) => r.status === "reviewed").length;
    const pendingReviewCount = reports.filter(
      (r) => r.status === "pending_review"
    ).length;
    const unsubmittedCount = unsubmittedReporters.length;

    return NextResponse.json({
      period: {
        year,
        semester,
      },
      summary: {
        total_reporters: totalReporters,
        submitted_count: submittedCount,
        reviewed_count: reviewedCount,
        pending_review_count: pendingReviewCount,
        unsubmitted_count: unsubmittedCount,
      },
      reports,
      unsubmitted_reporters: unsubmittedReporters,
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("GET /api/admin/reports error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
