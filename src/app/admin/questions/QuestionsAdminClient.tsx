"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { badge, btnPrimary, btnSecondary, label, panel, textarea } from "@/components/ui";

interface QuestionItem {
  id: string;
  subject: string;
  question: string;
  answer: string | null;
  status: "open" | "answered";
  created_at: string;
  answered_at: string | null;
  author: {
    id: string;
    name: string;
    identifier: string;
    email: string;
  };
  answerer?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const filters = [
  { key: "all", label: "Semua" },
  { key: "open", label: "Menunggu jawaban" },
  { key: "answered", label: "Sudah dijawab" },
] as const;

export default function QuestionsAdminClient() {
  const answerId = useId();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "answered">("all");

  // Answering modal state
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [answerText, setAnswerText] = useState<string>("");
  const [savingAnswer, setSavingAnswer] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        filterStatus === "all"
          ? "/api/questions"
          : `/api/questions?status=${filterStatus}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Gagal mengambil data pertanyaan.");
      }
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const openAnswerModal = (q: QuestionItem) => {
    setSelectedQuestion(q);
    setAnswerText(q.answer || "");
  };

  const handleSendAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion) return;

    setSavingAnswer(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/questions/${selectedQuestion.id}/answer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answerText.trim() }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message || "Gagal menyimpan tanggapan.");
      }

      setFeedback({
        text: `Tanggapan berhasil dikirimkan ke entitas ${selectedQuestion.author.name}.`,
        type: "success",
      });
      setSelectedQuestion(null);
      setAnswerText("");
      await fetchQuestions();
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Terjadi kesalahan.",
        type: "error",
      });
    } finally {
      setSavingAnswer(false);
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

  const openCount = questions.filter((q) => q.status === "open").length;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Layanan tanya jawab PBOT</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Beri tanggapan atas pertanyaan kendala teknis atau regulasi pelaporan distribusi
            dari entitas PBOT.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-md border border-line bg-canvas p-1">
          {filters.map((filter) => {
            const isActive = filterStatus === filter.key;
            const count = filter.key === "open" ? openCount : null;
            return (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key)}
                aria-pressed={isActive}
                className={[
                  "inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm transition-colors duration-150",
                  isActive
                    ? "bg-surface font-semibold text-ink shadow-panel"
                    : "text-ink-soft hover:text-ink",
                ].join(" ")}
              >
                {filter.label}
                {count !== null && count > 0 && (
                  <span className="tabular rounded-sm bg-amber-100 px-1.5 py-0.5 text-2xs font-semibold text-amber-800">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between gap-4 rounded-md border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="shrink-0 text-xs font-semibold underline underline-offset-2 hover:no-underline"
          >
            Tutup
          </button>
        </div>
      )}

      {loading ? (
        <div className={`${panel} px-6 py-16 text-center`}>
          <svg className="mx-auto h-6 w-6 animate-spin text-purple-700" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="mt-3 text-sm text-ink-soft">Memuat pertanyaan masuk...</p>
        </div>
      ) : error ? (
        <div className={`${panel} px-6 py-12 text-center`} role="alert">
          <p className="text-sm font-semibold text-rose-700">{error}</p>
          <p className="mt-1 text-xs text-ink-soft">
            Data tidak dapat dimuat. Periksa koneksi, lalu muat ulang halaman ini.
          </p>
        </div>
      ) : questions.length === 0 ? (
        <div className={`${panel} px-6 py-14 text-center`}>
          <p className="text-sm font-semibold text-ink">Tidak ada pertanyaan pada kategori ini.</p>
          <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-ink-soft">
            {filterStatus === "all"
              ? "Belum ada entitas pelapor yang mengajukan pertanyaan. Tiket baru akan tampil di sini setelah dikirim."
              : "Ganti filter untuk melihat pertanyaan pada kategori lain."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <article key={q.id} className={`${panel} p-6`}>
              <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{q.author.name}</span>
                    <span className="rounded-sm border border-line bg-canvas px-1.5 py-0.5 font-mono text-2xs text-ink-soft">
                      {q.author.identifier}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">
                    {q.author.email} · {formatWib(q.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {q.status === "answered" ? (
                    <span className={`${badge} border-emerald-200 bg-emerald-50 text-emerald-800`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                      Sudah dijawab
                    </span>
                  ) : (
                    <span className={`${badge} border-amber-200 bg-amber-50 text-amber-800`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-600" aria-hidden="true" />
                      Menunggu tanggapan
                    </span>
                  )}
                  <button
                    onClick={() => openAnswerModal(q)}
                    className={btnSecondary}
                  >
                    {q.status === "answered" ? "Edit tanggapan" : "Beri tanggapan"}
                  </button>
                </div>
              </div>

              <h2 className="mt-4 text-sm font-semibold text-ink">{q.subject}</h2>
              <p className="mt-2 whitespace-pre-wrap rounded-md border border-line bg-canvas px-4 py-3 text-sm leading-relaxed text-ink">
                {q.question}
              </p>

              {q.status === "answered" && q.answer && (
                <div className="mt-4 rounded-md border border-purple-200 bg-purple-50/70 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-purple-900">
                      Tanggapan oleh {q.answerer?.name || "Administrator"}
                    </p>
                    {q.answered_at && (
                      <p className="text-2xs text-purple-700">{formatWib(q.answered_at)}</p>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-purple-950">
                    {q.answer}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Modal Jawab Pertanyaan */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="answer-dialog-title"
            className="w-full max-w-xl rounded-lg border border-line bg-surface shadow-modal"
          >
            <div className="border-b border-line px-6 py-4">
              <h3 id="answer-dialog-title" className="text-base font-bold text-ink">
                Tanggapi pertanyaan
              </h3>
              <p className="mt-0.5 text-xs text-ink-soft">
                Dari {selectedQuestion.author.name} ({selectedQuestion.author.identifier})
              </p>
            </div>

            <div className="px-6 py-5">
              <div className="max-h-40 overflow-y-auto rounded-md border border-line bg-canvas px-4 py-3">
                <p className="text-sm font-semibold text-ink">{selectedQuestion.subject}</p>
                <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-ink-soft">
                  {selectedQuestion.question}
                </p>
              </div>

              <form onSubmit={handleSendAnswer} className="mt-5 space-y-4">
                <div>
                  <label className={label} htmlFor={answerId}>
                    Isi tanggapan
                    <span className="text-rose-600"> *</span>
                  </label>
                  <textarea
                    id={answerId}
                    required
                    rows={6}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Tuliskan jawaban yang jelas dan solusif."
                    maxLength={4000}
                    className={textarea}
                  />
                  <p className="tabular mt-1 text-right text-2xs text-ink-soft">
                    {answerText.length}/4.000
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedQuestion(null)}
                    disabled={savingAnswer}
                    className={btnSecondary}
                  >
                    Batal
                  </button>
                  <button type="submit" disabled={savingAnswer || answerText.trim().length < 2} className={btnPrimary}>
                    {savingAnswer ? "Mengirim" : "Kirim tanggapan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
