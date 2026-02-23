import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const adminUserId = await getAdminSession();
  if (!adminUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const passkeys = await prisma.adminPasskey.findMany({
    where: { adminUserId },
    select: {
      id: true,
      deviceName: true,
      createdAt: true,
      lastUsedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ passkeys });
}

export async function DELETE(request: Request) {
  const adminUserId = await getAdminSession();
  if (!adminUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Missing passkey ID" }, { status: 400 });
  }

  const passkey = await prisma.adminPasskey.findFirst({
    where: { id, adminUserId },
  });

  if (!passkey) {
    return NextResponse.json({ error: "Passkey not found" }, { status: 404 });
  }

  await prisma.adminPasskey.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
