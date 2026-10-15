import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import ReporterNavbar from "@/components/ReporterNavbar";
import ReporterProfileClient from "./ReporterProfileClient";

export default async function ReporterProfilePage() {
  let user;
  try {
    user = await requireRole(Role.reporter);
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ReporterNavbar user={user} currentPath="/reporter/profile" />

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 w-full">
        <ReporterProfileClient
          initialUser={{
            id: user.id,
            identifier: user.identifier,
            name: user.name,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
          }}
        />
      </main>
    </div>
  );
}
