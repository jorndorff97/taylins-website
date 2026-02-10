import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBuyerId } from "@/lib/buyer-auth";
import { SenderType } from "@prisma/client";

export async function POST(request: Request) {
  const buyerId = await getBuyerId();
  if (!buyerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const orderId = Number(body.orderId);
  const messageBody = String(body.body ?? "").trim();

  if (!orderId || !messageBody) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order || order.buyerId !== buyerId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const message = await prisma.orderMessage.create({
    data: {
      orderId,
      senderType: SenderType.BUYER,
      body: messageBody,
    },
  });

  return NextResponse.json({
    message: {
      id: message.id,
      senderType: message.senderType,
      body: message.body,
      createdAt: message.createdAt,
    },
  });
}
