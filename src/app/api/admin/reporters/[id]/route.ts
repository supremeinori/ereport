import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { Role } from "@prisma/client";
import { parseDateUtc } from "@/lib/date-utils";

// GET /api/admin/reporters/[id]
// Mengambil detail profil akun entitas PBOT secara lengkap
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // SEC-05, SEC-08: Otorisasi wajib admin
    await requireRole(Role.admin);

    const { id } = await context.params;

    const reporter = await prisma.user.findUnique({
      where: { id },
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
          select: { reports: true, questions: true },
        },
      },
    });

    if (!reporter || reporter.role !== Role.reporter) {
      return NextResponse.json(
        { message: "Akun reporter tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ reporter });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("GET /api/admin/reporters/[id] error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/reporters/[id]
// Memperbarui detail profil akun entitas PBOT oleh admin
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // SEC-05, SEC-08: Otorisasi wajib admin
    await requireRole(Role.admin);

    const { id } = await context.params;

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing || existing.role !== Role.reporter) {
      return NextResponse.json(
        { message: "Akun reporter tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Payload permintaan tidak valid." },
        { status: 400 }
      );
    }

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
      is_active,
    } = body;

    const updateData: {
      identifier?: string;
      name?: string;
      email?: string | null;
      password_hash?: string;
      address?: string | null;
      license_number?: string | null;
      license_date?: Date | null;
      pic_name?: string | null;
      pic_phone?: string | null;
      description?: string | null;
      is_active?: boolean;
    } = {};

    // Validasi Identifier jika diubah
    if (typeof identifier === "string") {
      const cleanIdentifier = identifier.trim();
      if (cleanIdentifier.length < 2) {
        return NextResponse.json(
          { message: "Kode identifier minimal 2 karakter." },
          { status: 400 }
        );
      }

      if (cleanIdentifier.toLowerCase() !== existing.identifier.toLowerCase()) {
        const conflict = await prisma.user.findFirst({
          where: {
            identifier: { equals: cleanIdentifier, mode: "insensitive" as const },
            id: { not: id },
          },
        });
        if (conflict) {
          return NextResponse.json(
            { message: `Kode identifier '${cleanIdentifier}' sudah digunakan oleh akun lain.` },
            { status: 409 }
          );
        }
      }
      updateData.identifier = cleanIdentifier;
    }

    // Validasi Nama
    if (typeof name === "string") {
      const cleanName = name.trim();
      if (cleanName.length < 2) {
        return NextResponse.json(
          { message: "Nama entitas PBOT minimal 2 karakter." },
          { status: 400 }
        );
      }
      updateData.name = cleanName;
    }

    // Validasi Email jika disertakan
    if (email !== undefined) {
      if (email === null || (typeof email === "string" && !email.trim())) {
        updateData.email = null;
      } else if (typeof email === "string") {
        const cleanEmail = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          return NextResponse.json(
            { message: "Alamat email tidak valid." },
            { status: 400 }
          );
        }
        if (cleanEmail !== existing.email?.toLowerCase()) {
          const conflict = await prisma.user.findFirst({
            where: {
              email: { equals: cleanEmail, mode: "insensitive" as const },
              id: { not: id },
            },
          });
          if (conflict) {
            return NextResponse.json(
              { message: `Alamat email '${cleanEmail}' sudah digunakan oleh akun lain.` },
              { status: 409 }
            );
          }
        }
        updateData.email = cleanEmail;
      }
    }

    // Alamat
    if (address !== undefined) {
      updateData.address = typeof address === "string" && address.trim() ? address.trim() : null;
    }

    // Nomor Izin
    if (license_number !== undefined) {
      updateData.license_number =
        typeof license_number === "string" && license_number.trim()
          ? license_number.trim()
          : null;
    }

    // Tanggal Izin (tanpa timezone shift)
    if (license_date !== undefined) {
      updateData.license_date = parseDateUtc(license_date);
    }

    // PIC Name
    if (pic_name !== undefined) {
      updateData.pic_name =
        typeof pic_name === "string" && pic_name.trim() ? pic_name.trim() : null;
    }

    // PIC Phone
    if (pic_phone !== undefined) {
      updateData.pic_phone =
        typeof pic_phone === "string" && pic_phone.trim() ? pic_phone.trim() : null;
    }

    // Keterangan / Deskripsi
    if (description !== undefined) {
      updateData.description =
        typeof description === "string" && description.trim() ? description.trim() : null;
    }

    // Status Aktif
    if (typeof is_active === "boolean") {
      updateData.is_active = is_active;
    }

    // Kata Sandi (opsional, hanya jika admin mengisi password baru)
    if (typeof password === "string" && password.trim().length > 0) {
      if (password.length < 8) {
        return NextResponse.json(
          { message: "Kata sandi baru minimal 8 karakter." },
          { status: 400 }
        );
      }
      updateData.password_hash = await bcrypt.hash(password, 12);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      message: `Data akun ${updated.identifier} (${updated.name}) berhasil diperbarui.`,
      reporter: updated,
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("PATCH /api/admin/reporters/[id] error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
