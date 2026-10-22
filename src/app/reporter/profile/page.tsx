import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ReporterShell from "@/components/ReporterShell";
import ReporterProfileClient from "./ReporterProfileClient";

export default async function ReporterProfilePage() {
  let sessionUser;
  try {
    sessionUser = await requireRole(Role.reporter);
  } catch {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      identifier: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
      address: true,
      license_number: true,
      license_date: true,
      pic_name: true,
      pic_phone: true,
      description: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <ReporterShell user={sessionUser}>
      <ReporterProfileClient
        initialUser={{
          id: user.id,
          identifier: user.identifier,
          name: user.name,
          email: user.email || "",
          role: user.role,
          is_active: user.is_active,
          address: user.address,
          license_number: user.license_number,
          license_date: user.license_date ? user.license_date.toISOString() : null,
          pic_name: user.pic_name,
          pic_phone: user.pic_phone,
          description: user.description,
        }}
      />
    </ReporterShell>
  );
}
