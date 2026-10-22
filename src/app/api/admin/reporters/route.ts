import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { Role } from "@prisma/client";
import { parseDateUtc } from "@/lib/date-utils";

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
                { license_number: { contains: query, mode: "insensitive" } },
                { pic_name: { contains: query, mode: "insensitive" } },
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
        is_active: true,
        address: true,
        license_number: true,
        license_date: true,
        pic_name: true,
        pic_phone: true,
        description: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: { reports: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ reporters });
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
    const {
      identifier,
      name,
      email,
      password,
      address,
      license_number,
      license_date,
      pic_name,
      pic_phone,
      description,
    } = body;

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
    if (typeof email === "string" && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
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

    const cleanIdentifier = identifier.trim();
    // Email opsional (kolom users.email nullable)
    const cleanEmail =
      typeof email === "string" && email.trim() ? email.trim().toLowerCase() : null;
    const cleanName = name.trim();
    const cleanAddress =
      typeof address === "string" && address.trim() ? address.trim() : null;
    const cleanLicenseNumber =
      typeof license_number === "string" && license_number.trim()
        ? license_number.trim()
        : null;
    const cleanLicenseDate = parseDateUtc(license_date);
    const cleanPicName =
      typeof pic_name === "string" && pic_name.trim() ? pic_name.trim() : null;
    const cleanPicPhone =
      typeof pic_phone === "string" && pic_phone.trim() ? pic_phone.trim() : null;
    const cleanDescription =
      typeof description === "string" && description.trim() ? description.trim() : null;

    // Periksa keunikan identifier dan email (email null tidak ikut dicocokkan)
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { identifier: { equals: cleanIdentifier, mode: "insensitive" as const } },
          ...(cleanEmail ? [{ email: { equals: cleanEmail, mode: "insensitive" as const } }] : []),
        ],
      },
    });

    if (existing) {
      if (existing.identifier.toLowerCase() === cleanIdentifier.toLowerCase()) {
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
        role: Role.reporter,
        is_active: true,
        address: cleanAddress,
        license_number: cleanLicenseNumber,
        license_date: cleanLicenseDate,
        pic_name: cleanPicName,
        pic_phone: cleanPicPhone,
        description: cleanDescription,
      },
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
