import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import AdminShell from "@/components/AdminShell";
import QuestionsAdminClient from "./QuestionsAdminClient";

export default async function AdminQuestionsPage() {
  let user;
  try {
    user = await requireRole(Role.admin);
  } catch {
    redirect("/login");
  }

  return (
    <AdminShell user={user}>
      <QuestionsAdminClient />
    </AdminShell>
  );
}
