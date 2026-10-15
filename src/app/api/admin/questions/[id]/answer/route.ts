import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { Role, QuestionStatus } from "@prisma/client";

// PATCH /api/admin/questions/[id]/answer
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireRole(Role.admin);
    const { id } = await context.params;

    const existing = await prisma.question.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Pertanyaan tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Data permintaan tidak valid." },
        { status: 400 }
      );
    }

    const answer = typeof body.answer === "string" ? body.answer.trim() : "";

    // Validasi panjang (NFR-06)
    if (answer.length < 2 || answer.length > 4000) {
      return NextResponse.json(
        { message: "Teks jawaban harus memiliki panjang antara 2 dan 4.000 karakter." },
        { status: 400 }
      );
    }

    const updated = await prisma.question.update({
      where: { id },
      data: {
        answer,
        answered_by: adminUser.id,
        status: QuestionStatus.answered,
        answered_at: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            identifier: true,
            email: true,
          },
        },
        answerer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Jawaban berhasil dikirim ke pelapor.",
      question: updated,
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("PATCH /api/admin/questions/:id/answer error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
