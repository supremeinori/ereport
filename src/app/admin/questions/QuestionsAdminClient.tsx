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
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Layanan Tanya Jawab PBOT
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Beri asistensi dan tanggapan atas pertanyaan kendala teknis atau regulasi pelaporan distribusi dari entitas PBOT.
          </p>
        </div>

        {/* Filter Tab */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              filterStatus === "all"
                ? "bg-white text-purple-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterStatus("open")}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              filterStatus === "open"
                ? "bg-white text-amber-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Menunggu Jawaban</span>
            {openCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                {openCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterStatus("answered")}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              filterStatus === "answered"
                ? "bg-white text-purple-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sudah Dijawab
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-xs ${
            feedback.type === "success"
              ? "bg-purple-50 text-purple-900 border border-purple-200"
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

      {/* Daftar Pertanyaan */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center text-slate-400 text-sm shadow-sm">
          <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent mx-auto mb-2 rounded-full"></div>
          Memuat pertanyaan masuk...
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-12 text-center text-rose-500 text-sm shadow-sm">
          {error}
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <p className="text-base font-semibold text-slate-700">
            Tidak ada pertanyaan dalam kategori ini.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Pertanyaan dari entitas pelapor akan tampil di sini saat diajukan.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {q.author.name}
                    </span>
                    <span className="font-mono text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
                      {q.author.identifier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {q.author.email} • {formatWib(q.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      q.status === "answered"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {q.status === "answered" ? "Sudah Dijawab" : "Menunggu Tanggapan"}
                  </span>
                  <button
                    onClick={() => openAnswerModal(q)}
                    className="px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all shadow-sm shadow-purple-500/20"
                  >
                    {q.status === "answered" ? "Edit Tanggapan" : "Beri Tanggapan"}
                  </button>
                </div>
              </div>

              {/* Subjek & Isi Pertanyaan */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-2">
                  {q.subject}
                </h2>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap border border-slate-200/70 leading-relaxed">
                  {q.question}
                </div>
              </div>

              {/* Jawaban Jika Sudah Ada */}
              {q.status === "answered" && q.answer && (
                <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-purple-800 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                      Tanggapan oleh {q.answerer?.name || "Administrator"}
                    </span>
                    {q.answered_at && (
                      <span className="text-[11px] font-medium text-purple-600">
                        {formatWib(q.answered_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-purple-950 whitespace-pre-wrap leading-relaxed">
                    {q.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Jawab Pertanyaan */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-purple-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Tanggapi Pertanyaan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dari: <strong className="text-slate-800">{selectedQuestion.author.name}</strong> ({selectedQuestion.author.identifier})
            </p>

            <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-700 border border-slate-200 mb-4 max-h-40 overflow-y-auto">
              <p className="font-bold text-slate-900 mb-1">
                {selectedQuestion.subject}
              </p>
              <p className="whitespace-pre-wrap text-slate-600">{selectedQuestion.question}</p>
            </div>

            <form onSubmit={handleSendAnswer} className="space-y-4">
              <div>
                <label
                  htmlFor={answerId}
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Isi Tanggapan / Jawaban Resmi <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id={answerId}
                  required
                  rows={6}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Tuliskan jawaban yang jelas dan solutif..."
                  maxLength={4000}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-slate-900 resize-none bg-slate-50 focus:bg-white transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1 text-right">
                  {answerText.length}/4.000
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuestion(null)}
                  disabled={savingAnswer}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingAnswer || answerText.trim().length < 2}
                  className="px-5 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/25 transition-all disabled:opacity-50"
                >
                  {savingAnswer ? "Mengirim..." : "Kirimkan Tanggapan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

}
