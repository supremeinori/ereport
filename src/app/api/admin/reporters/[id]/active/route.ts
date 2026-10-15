import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { Role } from "@prisma/client";

// PATCH /api/admin/reporters/[id]/active
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // SEC-05, SEC-08: Otorisasi wajib admin
    await requireRole(Role.admin);

    const { id } = await context.params;
    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== "boolean") {
      return NextResponse.json(
        { message: "Field 'is_active' bertipe boolean wajib disertakan." },
        { status: 400 }
      );
    }

    const reporter = await prisma.user.findUnique({
      where: { id },
    });

    if (!reporter) {
      return NextResponse.json(
        { message: "Akun reporter tidak ditemukan." },
        { status: 404 }
      );
    }

    if (reporter.role !== Role.reporter) {
      return NextResponse.json(
        { message: "Hanya akun dengan role reporter yang dapat diubah statusnya lewat endpoint ini." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { is_active },
      select: {
        id: true,
        identifier: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Status akun ${updated.identifier} berhasil diubah menjadi ${
        is_active ? "Aktif" : "Nonaktif"
      }.`,
      reporter: updated,
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("PATCH /api/admin/reporters/:id/active error:", err);
    return NextResponse.json({ message: "Terjadi kesalahan internal pada server." }, { status: 500 });
  }
}
