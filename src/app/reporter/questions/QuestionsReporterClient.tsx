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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
          Layanan Bantuan &amp; Konsultasi
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Layanan Bantuan &amp; Tanya Jawab
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Konsultasikan kendala teknis atau pertanyaan regulasi pelaporan distribusi obat tradisional langsung ke Administrator.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-sm animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
              : "bg-rose-50 text-rose-800 border border-rose-200/80"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold px-2 py-1 rounded-lg hover:bg-black/5 transition-colors ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Grid: Form Kirim Pertanyaan & Riwayat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Form Ajukan Pertanyaan */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm sticky top-24">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Ajukan Pertanyaan Baru
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor={subjectId}
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
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
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-slate-900 transition-all shadow-2xs"
                />
                <p className="text-[11px] text-slate-400 mt-1 text-right">
                  {subject.length}/150
                </p>
              </div>

              <div>
                <label
                  htmlFor={questionId}
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
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
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-slate-900 resize-none transition-all shadow-2xs"
                />
                <p className="text-[11px] text-slate-400 mt-1 text-right">
                  {questionText.length}/2.000
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || subject.trim().length < 3 || questionText.trim().length < 10}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Mengirim Pertanyaan...</span>
                  </>
                ) : (
                  "Kirimkan Pertanyaan"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Riwayat Pertanyaan & Jawaban */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Riwayat Pertanyaan Anda
            </h2>
            <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Total {questions.length} Pertanyaan
            </span>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 text-sm shadow-sm">
              <svg className="animate-spin h-6 w-6 text-purple-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Memuat riwayat pertanyaan...
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-rose-200/80 p-8 text-center text-rose-600 text-sm shadow-sm">
              {error}
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Belum ada pertanyaan yang diajukan.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan formulir di samping untuk menyampaikan pertanyaan seputar pelaporan.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 hover:border-purple-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {q.subject}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Diajukan pada {formatWib(q.created_at)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs ${
                        q.status === "answered"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          q.status === "answered" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                        }`}
                      ></span>
                      {q.status === "answered" ? "Sudah Dijawab" : "Menunggu Tanggapan"}
                    </span>
                  </div>

                  {/* Isi Pertanyaan */}
                  <div className="bg-slate-50/80 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">
                    {q.question}
                  </div>

                  {/* Jawaban Admin (Jika Ada) */}
                  {q.status === "answered" && q.answer ? (
                    <div className="bg-gradient-to-r from-purple-50/90 via-indigo-50/50 to-purple-50/90 border border-purple-200/80 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-purple-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Tanggapan Administrator E-Report:
                        </span>
                        {q.answered_at && (
                          <span className="text-[11px] font-medium text-purple-700">
                            {formatWib(q.answered_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-purple-950 whitespace-pre-wrap pl-5">
                        {q.answer}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
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
