import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { checkLoginRateLimit, recordFailedLogin, resetLoginRateLimit } from "@/lib/rate-limiter";
import { Role } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    // Mendukung input 'username' (utama) maupun 'email' (fallback)
    const loginCredential = typeof body.username === "string" ? body.username : (typeof body.email === "string" ? body.email : "");
    const password = typeof body.password === "string" ? body.password : "";

    if (!loginCredential.trim() || !password) {
      return NextResponse.json(
        { message: "Username dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const cleanInput = loginCredential.trim();
    // Gunakan kombinasi IP dan identifier input sebagai key rate limit
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const rateLimitKey = `${ip}:${cleanInput.toLowerCase()}`;

    const rateLimit = checkLoginRateLimit(rateLimitKey);
    if (rateLimit.isBlocked) {
      return NextResponse.json(
        {
          message: `Terlalu banyak percobaan gagal. Silakan coba lagi dalam ${rateLimit.retryAfterSeconds} detik.`,
        },
        { status: 429 }
      );
    }

    // Cari user berdasarkan identifier (username), email, atau alias 'admin'
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { identifier: { equals: cleanInput, mode: "insensitive" } },
          { email: { equals: cleanInput.toLowerCase(), mode: "insensitive" } },
        ],
      },
    });

    // Jika input adalah kata "admin", cocokkan dengan admin aktif
    if (!user && cleanInput.toLowerCase() === "admin") {
      user = await prisma.user.findFirst({
        where: {
          role: Role.admin,
        },
      });
    }

    if (!user) {
      recordFailedLogin(rateLimitKey);
      return NextResponse.json(
        { message: "Username atau kata sandi tidak valid." },
        { status: 401 }
      );
    }

    // Cek password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      recordFailedLogin(rateLimitKey);
      return NextResponse.json(
        { message: "Username atau kata sandi tidak valid." },
        { status: 401 }
      );
    }

    // SEC-09: Akun nonaktif tidak bisa login
    if (!user.is_active) {
      return NextResponse.json(
        { message: "Akun Anda telah dinonaktifkan. Silakan hubungi administrator." },
        { status: 403 }
      );
    }

    // Login sukses: reset rate limit
    resetLoginRateLimit(rateLimitKey);

    // Buat token sesi bertanda tangan HMAC
    const sessionToken = signSessionToken({
      userId: user.id,
      role: user.role,
    });

    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        identifier: user.identifier,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Pasang HttpOnly cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 jam
    });

    return response;
  } catch (err: unknown) {
    const error = err as Error;
    // SEC-11: Jangan bocorkan stack trace ke klien
    console.error("Login API error:", error?.message);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
