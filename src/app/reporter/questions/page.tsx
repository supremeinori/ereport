import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import ReporterShell from "@/components/ReporterShell";
import QuestionsReporterClient from "./QuestionsReporterClient";

export default async function ReporterQuestionsPage() {
  let user;
  try {
    user = await requireRole(Role.reporter);
  } catch {
    redirect("/login");
  }

  return (
    <ReporterShell user={user}>
      <QuestionsReporterClient />
    </ReporterShell>
  );
}
