import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import ReporterShell from "@/components/ReporterShell";
import ReporterProfileClient from "./ReporterProfileClient";

export default async function ReporterProfilePage() {
  let user;
  try {
    user = await requireRole(Role.reporter);
  } catch {
    redirect("/login");
  }

  return (
    <ReporterShell user={user}>
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
    </ReporterShell>
  );
}
