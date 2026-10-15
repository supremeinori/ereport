import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import ReporterNavbar from "@/components/ReporterNavbar";
import QuestionsReporterClient from "./QuestionsReporterClient";

export default async function ReporterQuestionsPage() {
  let user;
  try {
    user = await requireRole(Role.reporter);
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ReporterNavbar user={user} currentPath="/reporter/questions" />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 w-full">
        <QuestionsReporterClient />
      </main>
    </div>
  );
}
