import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { Role } from "@prisma/client";

// GET /api/admin/reporters?q=
export async function GET(request: NextRequest) {
  try {
    // SEC-05, SEC-08: Otorisasi wajib admin
    await requireRole(Role.admin);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    const reporters = await prisma.user.findMany({
      where: {
        role: Role.reporter,
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { identifier: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        identifier: true,
        name: true,
        email: true,
        role: true,
        initial_password: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: { reports: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const mappedReporters = reporters.map((r) => ({
      ...r,
      initial_password: r.initial_password || "12345678",
    }));

    return NextResponse.json({ reporters: mappedReporters });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("GET /api/admin/reporters error:", err);
    return NextResponse.json({ message: "Terjadi kesalahan internal pada server." }, { status: 500 });
  }
}

// POST /api/admin/reporters
export async function POST(request: NextRequest) {
  try {
    // SEC-05, SEC-08: Otorisasi wajib admin
    await requireRole(Role.admin);

    const body = await request.json();
    const { identifier, name, email, password } = body;

    // NFR-06: Validasi input server-side
    if (!identifier || typeof identifier !== "string" || identifier.trim().length < 2) {
      return NextResponse.json(
        { message: "Kode identifier entitas wajib diisi (minimal 2 karakter)." },
        { status: 400 }
      );
    }
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { message: "Nama entitas PBOT wajib diisi (minimal 2 karakter)." },
        { status: 400 }
      );
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { message: "Alamat email tidak valid." },
        { status: 400 }
      );
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { message: "Kata sandi awal wajib diisi (minimal 8 karakter)." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Periksa keunikan identifier dan email
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ identifier: cleanIdentifier }, { email: cleanEmail }],
      },
    });

    if (existing) {
      if (existing.identifier === cleanIdentifier) {
        return NextResponse.json(
          { message: `Kode identifier '${cleanIdentifier}' sudah terdaftar.` },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { message: `Alamat email '${cleanEmail}' sudah terdaftar.` },
        { status: 409 }
      );
    }

    // Hash kata sandi
    const password_hash = await bcrypt.hash(password, 12);

    // Kunci role selalu menjadi 'reporter' (tidak bisa di-inject klien)
    const reporter = await prisma.user.create({
      data: {
        identifier: cleanIdentifier,
        name: cleanName,
        email: cleanEmail,
        password_hash,
        initial_password: password,
        role: Role.reporter,
        is_active: true,
      },
      select: {
        id: true,
        identifier: true,
        name: true,
        email: true,
        role: true,
        initial_password: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Akun entitas pelapor berhasil dibuat.",
        reporter,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("POST /api/admin/reporters error:", err);
    return NextResponse.json({ message: "Terjadi kesalahan internal pada server." }, { status: 500 });
  }
}
