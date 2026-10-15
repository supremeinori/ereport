import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import AdminShell from "@/components/AdminShell";
import ReportersClient from "./ReportersClient";

export default async function AdminReportersPage() {
  let user;
  try {
    user = await requireRole(Role.admin);
  } catch {
    redirect("/login");
  }

  return (
    <AdminShell user={user}>
      <ReportersClient />
    </AdminShell>
  );
}
