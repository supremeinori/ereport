import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const identifier = process.env.ADMIN_IDENTIFIER;
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!identifier || !name || !email || !password) {
    console.error(
      "Error: Pastikan ADMIN_IDENTIFIER, ADMIN_NAME, ADMIN_EMAIL, dan ADMIN_PASSWORD terisi di environment variable."
    );
    process.exit(1);
  }

  console.log(`Memeriksa akun admin dengan identifier: ${identifier}...`);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ identifier }, { email }],
    },
  });

  if (existingUser) {
    console.log(
      `Akun admin dengan email (${existingUser.email}) atau identifier (${existingUser.identifier}) sudah ada. Melewati pembuatan.`
    );
    return;
  }

  console.log("Melakukan hashing password admin...");
  const password_hash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      identifier,
      name,
      email,
      password_hash,
      role: Role.admin,
      is_active: true,
    },
    select: {
      id: true,
      identifier: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
    },
  });

  console.log("Akun admin awal berhasil dibuat:", admin);
}

main()
  .catch((e) => {
    console.error("Terjadi kesalahan saat bootstrap admin:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
