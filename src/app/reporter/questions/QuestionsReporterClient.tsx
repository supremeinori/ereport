"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { badge, btnPrimary, input, label, pageSubtitle, pageTitle, panel, textarea } from "@/components/ui";

interface QuestionItem {
  id: string;
  subject: string;
  question: string;
  answer: string | null;
  status: "open" | "answered";
  created_at: string;
  answered_at: string | null;
  answerer?: {
    name: string;
  } | null;
}

export default function QuestionsReporterClient() {
  const subjectId = useId();
  const questionId = useId();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [subject, setSubject] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/questions");
      if (!res.ok) {
        throw new Error("Gagal mengambil daftar pertanyaan.");
      }
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          question: questionText.trim(),
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message || "Gagal mengirim pertanyaan.");
      }

      setFeedback({
        text: "Pertanyaan Anda berhasil dikirim ke Administrator E-Report PBOBA.",
        type: "success",
      });
      setSubject("");
      setQuestionText("");
      await fetchQuestions();
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Terjadi kesalahan.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatWib = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date) + " WIB";
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={pageTitle}>Layanan Bantuan &amp; Tanya Jawab</h1>
        <p className={pageSubtitle}>
          Konsultasikan kendala teknis atau pertanyaan regulasi pelaporan distribusi obat tradisional langsung ke Administrator.
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between rounded-lg border p-4 text-sm font-medium ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <svg className="h-5 w-5 shrink-0 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 shrink-0 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="ml-4 rounded-md px-2 py-1 text-xs font-semibold transition-colors hover:bg-black/5"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Form Kirim Pertanyaan & Riwayat */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Kolom Kiri: Form Ajukan Pertanyaan */}
        <div className="lg:col-span-1">
          <div className={`${panel} sticky top-[72px] p-6`}>
            <h2 className="border-b border-line pb-3 text-base font-bold text-ink">
              Ajukan Pertanyaan Baru
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor={subjectId} className={label}>
                  Subjek pertanyaan <span className="text-rose-600">*</span>
                </label>
                <input
                  id={subjectId}
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Format pelaporan sediaan kapsul"
                  maxLength={150}
                  className={input}
                />
                <p className="tabular mt-1 text-right text-2xs text-ink-soft">
                  {subject.length}/150
                </p>
              </div>

              <div>
                <label htmlFor={questionId} className={label}>
                  Isi pertanyaan <span className="text-rose-600">*</span>
                </label>
                <textarea
                  id={questionId}
                  required
                  rows={5}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Jelaskan pertanyaan atau kendala yang dihadapi secara rinci (minimal 10 karakter)"
                  maxLength={2000}
                  className={textarea}
                />
                <p className="tabular mt-1 text-right text-2xs text-ink-soft">
                  {questionText.length}/2.000
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || subject.trim().length < 3 || questionText.trim().length < 10}
                className={`${btnPrimary} w-full`}
              >
                {submitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Mengirim pertanyaan...</span>
                  </>
                ) : (
                  "Kirimkan pertanyaan"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Riwayat Pertanyaan & Jawaban */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-base font-bold text-ink">Riwayat Pertanyaan Anda</h2>
            <span className="tabular text-xs text-ink-soft">{questions.length} pertanyaan</span>
          </div>

          {loading ? (
            <div className={`${panel} flex items-center justify-center gap-3 p-12 text-sm text-ink-soft`}>
              <svg className="h-6 w-6 animate-spin text-purple-700" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Memuat riwayat pertanyaan...
            </div>
          ) : error ? (
            <div className={`${panel} border-rose-200 p-8 text-center text-sm font-semibold text-rose-700`}>
              {error}
            </div>
          ) : questions.length === 0 ? (
            <div className={`${panel} p-12 text-center`}>
              <p className="text-sm font-semibold text-ink">
                Belum ada pertanyaan yang diajukan.
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                Gunakan formulir di samping untuk menyampaikan pertanyaan seputar pelaporan.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.id} className={`${panel} space-y-4 p-6`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-ink">{q.subject}</h3>
                      <p className="mt-0.5 text-xs text-ink-soft">Diajukan pada {formatWib(q.created_at)}</p>
                    </div>

                    <span
                      className={`${badge} ${
                        q.status === "answered"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                      }`}
                    >
                      {q.status === "answered" ? "Sudah dijawab" : "Menunggu tanggapan"}
                    </span>
                  </div>

                  {/* Isi Pertanyaan */}
                  <div className="whitespace-pre-wrap rounded-md border border-line bg-canvas p-4 text-sm text-ink">
                    {q.question}
                  </div>

                  {/* Jawaban Admin (Jika Ada) */}
                  {q.status === "answered" && q.answer ? (
                    <div className="rounded-md border border-purple-200 bg-purple-50 p-4">
                      <div className="flex items-center justify-between gap-3 border-b border-purple-200 pb-2">
                        <span className="text-xs font-semibold text-purple-950">
                          Tanggapan Administrator E-Report
                        </span>
                        {q.answered_at && (
                          <span className="text-2xs text-purple-800">{formatWib(q.answered_at)}</span>
                        )}
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-purple-950">{q.answer}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-ink-soft">
                      Pertanyaan sedang ditinjau oleh staf pengawas farmasi. Jawaban akan tampil di sini setelah ditanggapi.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}