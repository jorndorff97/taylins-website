import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: npx tsx prisma/create-admin.ts <email> <password>");
    process.exit(1);
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.error(`Admin with email "${email}" already exists (id: ${existing.id}).`);
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.create({
    data: { email: email.toLowerCase().trim(), password: hashed },
  });

  console.log(`Admin created: ${admin.email} (id: ${admin.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
