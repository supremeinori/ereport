import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { message: "Tidak terautentikasi atau sesi telah berakhir." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        identifier: user.identifier,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Auth Me API error:", error?.message);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
