import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

export const SESSION_COOKIE_NAME = "ereport_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 jam

function getSecretKey(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET wajib dikonfigurasi di environment variables (minimal 32 karakter)."
    );
  }
  return secret;
}

export interface SessionPayload {
  userId: string;
  role: Role;
  exp: number;
}

export interface AuthenticatedUser {
  id: string;
  identifier: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
}

/**
 * Membuat token sesi bertanda tangan HMAC SHA-256
 */
export function signSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecretKey())
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Memverifikasi integritas dan kedaluwarsa token sesi
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", getSecretKey())
      .update(payloadB64)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    );

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Kedaluwarsa
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Mengambil data pengguna sesi aktif.
 * SEC-05, SEC-09: Selalu memvalidasi ke database untuk memastikan akun masih aktif.
 */
export async function getSessionUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = verifySessionToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      identifier: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
      // PERINGATAN: password_hash TIDAK PERNAH di-select (SEC-14, TST-12)
    },
  });

  if (!user) return null;
  // SEC-09: Akun nonaktif langsung ditolak meski token sesi masih valid
  if (!user.is_active) return null;

  // Email nullable di DB; diseragamkan jadi string kosong untuk konsumen session
  return { ...user, email: user.email ?? "" };
}

/**
 * Memastikan pengguna sudah terautentikasi dan akun aktif.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new AuthError("Tidak terautentikasi atau akun nonaktif", 401);
  }
  return user;
}

/**
 * Memastikan pengguna memiliki peran (role) tertentu.
 */
export async function requireRole(allowedRole: Role): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  if (user.role !== allowedRole) {
    throw new AuthError("Akses ditolak: Anda tidak memiliki izin untuk tindakan ini", 403);
  }
  return user;
}

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}
