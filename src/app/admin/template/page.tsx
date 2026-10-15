import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import AdminNavbar from "@/components/AdminNavbar";
import Link from "next/link";
import TemplateManagerClient from "./TemplateManagerClient";

export default async function AdminTemplatePage() {
  let user;
  try {
    user = await requireRole(Role.admin);
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminNavbar user={user} currentPath="/admin/template" />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 w-full">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-800">Kelola Template Excel</span>
        </div>
        <TemplateManagerClient />
      </main>
    </div>
  );
}
