import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import AdminShell from "@/components/AdminShell";
import ReportsAdminClient from "./ReportsAdminClient";

export default async function AdminReportsPage() {
  let user;
  try {
    user = await requireRole(Role.admin);
  } catch {
    redirect("/login");
  }

  return (
    <AdminShell user={user}>
      <ReportsAdminClient />
    </AdminShell>
  );
}
