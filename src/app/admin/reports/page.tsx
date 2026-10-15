import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import AdminNavbar from "@/components/AdminNavbar";
import ReportsAdminClient from "./ReportsAdminClient";

export default async function AdminReportsPage() {
  let user;
  try {
    user = await requireRole(Role.admin);
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminNavbar user={user} currentPath="/admin/reports" />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 w-full">
        <ReportsAdminClient />
      </main>
    </div>
  );
}
