import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { Role } from "@prisma/client";

// GET /api/reporter/profile
export async function GET() {
  try {
    const user = await requireRole(Role.reporter);

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        identifier: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        address: true,
        license_number: true,
        license_date: true,
        pic_name: true,
        pic_phone: true,
        description: true,
      },
    });

    if (!fullUser) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      reporter: fullUser,
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("GET /api/reporter/profile error:", err);
    return NextResponse.json({ message: "Terjadi kesalahan internal pada server." }, { status: 500 });
  }
}

// PATCH /api/reporter/profile
// Memungkinkan reporter memperbarui alamat email untuk feedback & korespondensi resmi
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole(Role.reporter);

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Data permintaan tidak valid." },
        { status: 400 }
      );
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    // Validasi format email dasar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Format alamat email tidak valid." },
        { status: 400 }
      );
    }

    // Cek apakah email sudah dipakai oleh pengguna lain
    const existing = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" as const },
        id: { not: user.id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Alamat email ini sudah terdaftar oleh pengguna lain." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { email },
      select: {
        id: true,
        identifier: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        address: true,
        license_number: true,
        license_date: true,
        pic_name: true,
        pic_phone: true,
        description: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Alamat email feedback & korespondensi berhasil diperbarui.",
      reporter: updated,
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("PATCH /api/reporter/profile error:", err);
    return NextResponse.json({ message: "Terjadi kesalahan internal pada server." }, { status: 500 });
  }
}
