import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import AdminNavbar from "@/components/AdminNavbar";
import ReportersClient from "./ReportersClient";

export default async function AdminReportersPage() {
  let user;
  try {
    user = await requireRole(Role.admin);
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminNavbar user={user} currentPath="/admin/reporters" />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 w-full">
        <ReportersClient />
      </main>
    </div>
  );
}
