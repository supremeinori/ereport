import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import ReporterShell from "@/components/ReporterShell";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  let user;
  try {
    user = await requireRole(Role.reporter);
  } catch {
    redirect("/login");
  }

  return (
    <ReporterShell user={user}>
      <ReportsClient />
    </ReporterShell>
  );
}
