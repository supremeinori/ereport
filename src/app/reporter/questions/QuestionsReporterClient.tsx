"use client";

import { useState, useEffect, useCallback, useId } from "react";

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
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Layanan Bantuan &amp; Tanya Jawab
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Konsultasikan kendala teknis atau pertanyaan regulasi pelaporan distribusi obat tradisional langsung ke Administrator.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-none text-sm font-medium flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:no-underline ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Grid: Form Kirim Pertanyaan & Riwayat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Form Ajukan Pertanyaan */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-none border border-slate-200 p-6 shadow-sm sticky top-24">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Ajukan Pertanyaan Baru
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor={subjectId}
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Subjek Pertanyaan <span className="text-rose-500">*</span>
                </label>
                <input
                  id={subjectId}
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Mis. Format pelaporan sediaan kapsul"
                  maxLength={150}
                  className="w-full px-3 py-2 text-sm rounded-none border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1 text-right">
                  {subject.length}/150
                </p>
              </div>

              <div>
                <label
                  htmlFor={questionId}
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Isi Pertanyaan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id={questionId}
                  required
                  rows={5}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Jelaskan pertanyaan atau kendala yang dihadapi secara rinci (minimal 10 karakter)..."
                  maxLength={2000}
                  className="w-full px-3 py-2 text-sm rounded-none border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 resize-none"
                />
                <p className="text-[11px] text-slate-400 mt-1 text-right">
                  {questionText.length}/2.000
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || subject.trim().length < 3 || questionText.trim().length < 10}
                className="w-full py-2.5 px-4 rounded-none text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {submitting ? "Mengirim..." : "Kirimkan Pertanyaan"}
              </button>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Riwayat Pertanyaan & Jawaban */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Riwayat Pertanyaan Anda
            </h2>
            <span className="text-xs text-slate-500">
              Total: {questions.length} pertanyaan
            </span>
          </div>

          {loading ? (
            <div className="bg-white rounded-none border border-slate-200 p-8 text-center text-slate-400 text-sm">
              Memuat riwayat pertanyaan...
            </div>
          ) : error ? (
            <div className="bg-white rounded-none border border-rose-200 p-8 text-center text-rose-500 text-sm">
              {error}
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-white rounded-none border border-slate-200 p-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                Belum ada pertanyaan yang diajukan.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Gunakan formulir di samping untuk menyampaikan pertanyaan seputar pelaporan.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white rounded-none border border-slate-200 p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {q.subject}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Diajukan pada {formatWib(q.created_at)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-none text-xs font-semibold ${
                        q.status === "answered"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {q.status === "answered" ? "Sudah Dijawab" : "Menunggu Tanggapan"}
                    </span>
                  </div>

                  {/* Isi Pertanyaan */}
                  <div className="bg-slate-50 rounded-none p-3.5 text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">
                    {q.question}
                  </div>

                  {/* Jawaban Admin (Jika Ada) */}
                  {q.status === "answered" && q.answer ? (
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-none p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
                        <span>Tanggapan Administrator:</span>
                        {q.answered_at && (
                          <span className="text-[11px] font-normal text-emerald-700">
                            {formatWib(q.answered_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-emerald-950 whitespace-pre-wrap">
                        {q.answer}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Pertanyaan sedang ditinjau oleh staf pengawas farmasi. Anda akan melihat jawaban di sini setelah ditanggapi.
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
