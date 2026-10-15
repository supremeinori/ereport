import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import AdminShell from "@/components/AdminShell";
import BackupsAdminClient from "./BackupsAdminClient";

export default async function AdminBackupsPage() {
  let user;
  try {
    user = await requireRole(Role.admin);
  } catch {
    redirect("/login");
  }

  return (
    <AdminShell user={user}>
      <BackupsAdminClient />
    </AdminShell>
  );
}
