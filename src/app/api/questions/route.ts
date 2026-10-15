import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth";
import { Role, QuestionStatus } from "@prisma/client";

// GET /api/questions
// - Jika role reporter: hanya kembalikan pertanyaan miliknya sendiri (SEC-07, FR-REP-10)
// - Jika role admin: kembalikan semua pertanyaan dengan identitas pengirim (FR-ADM-13)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role === Role.admin) {
      const { searchParams } = new URL(request.url);
      const statusFilter = searchParams.get("status"); // "all", "open", "answered"

      const whereClause: { status?: QuestionStatus } = {};
      if (statusFilter === "open") {
        whereClause.status = QuestionStatus.open;
      } else if (statusFilter === "answered") {
        whereClause.status = QuestionStatus.answered;
      }

      const questions = await prisma.question.findMany({
        where: whereClause,
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
        orderBy: {
          created_at: "desc",
        },
      });

      return NextResponse.json({ questions });
    }

    // Role reporter: HANYA miliknya sendiri
    const questions = await prisma.question.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        answerer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ questions });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("GET /api/questions error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}

// POST /api/questions
// Khusus reporter untuk mengirim pertanyaan baru (FR-REP-09, NFR-06)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role !== Role.reporter) {
      return NextResponse.json(
        { message: "Hanya akun reporter yang dapat mengajukan pertanyaan." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Data permintaan tidak valid." },
        { status: 400 }
      );
    }

    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const questionText = typeof body.question === "string" ? body.question.trim() : "";

    // Validasi panjang (NFR-06)
    if (subject.length < 3 || subject.length > 150) {
      return NextResponse.json(
        { message: "Subjek pertanyaan harus memiliki panjang antara 3 dan 150 karakter." },
        { status: 400 }
      );
    }

    if (questionText.length < 10 || questionText.length > 2000) {
      return NextResponse.json(
        { message: "Isi pertanyaan harus memiliki panjang antara 10 dan 2.000 karakter." },
        { status: 400 }
      );
    }

    // WAJIB: user_id diambil dari sesi, bukan input body!
    const newQuestion = await prisma.question.create({
      data: {
        user_id: user.id,
        subject,
        question: questionText,
        status: QuestionStatus.open,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pertanyaan Anda berhasil dikirim ke Administrator.",
        question: newQuestion,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    console.error("POST /api/questions error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
