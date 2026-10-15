import { NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth";
import { Role } from "@prisma/client";

// GET /api/reporter/profile
export async function GET() {
  try {
    const user = await requireRole(Role.reporter);

    return NextResponse.json({
      reporter: {
        id: user.id,
        identifier: user.identifier,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
      },
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("GET /api/reporter/profile error:", err);
    return NextResponse.json({ message: "Terjadi kesalahan internal pada server." }, { status: 500 });
  }
}
