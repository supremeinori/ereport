import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { Role } from "@prisma/client";

// GET /api/reporter/reports
export async function GET() {
  try {
    // SEC-05, SEC-07: Hanya reporter dan hanya data miliknya sendiri
    const user = await requireRole(Role.reporter);

    const reports = await prisma.report.findMany({
      where: {
        user_id: user.id,
      },
      select: {
        id: true,
        period_year: true,
        period_semester: true,
        original_filename: true,
        uploaded_at: true,
        status: true,
        reviewed_at: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: [
        { period_year: "desc" },
        { period_semester: "desc" },
      ],
    });

    return NextResponse.json({ reports });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("GET /api/reporter/reports error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
