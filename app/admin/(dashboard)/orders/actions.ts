"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SenderType } from "@prisma/client";

export async function replyToOrder(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!orderId || !body) return;

  await prisma.orderMessage.create({
    data: {
      orderId,
      senderType: SenderType.SELLER,
      body,
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function sendInvoice(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  if (!orderId) return;

  await prisma.orderMessage.create({
    data: {
      orderId,
      senderType: SenderType.SELLER,
      body: "Invoice sent to buyer.",
      invoiceSentAt: new Date(),
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function updateOrderStatus(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const status = String(formData.get("status"));
  if (!orderId || !status) return;

  const valid = ["PENDING", "CONFIRMED", "PAID", "SHIPPED", "CANCELLED"];
  if (!valid.includes(status)) return;

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as "PENDING" | "CONFIRMED" | "PAID" | "SHIPPED" | "CANCELLED" },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}
