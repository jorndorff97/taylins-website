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

export async function sendPaymentLink(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  if (!orderId) return;

  try {
    // Create a checkout session via the API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create checkout session");
    }

    const { url } = await response.json();

    // Create a message with the payment link
    await prisma.orderMessage.create({
      data: {
        orderId,
        senderType: SenderType.SELLER,
        body: `Payment link sent: ${url}`,
      },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
  } catch (error) {
    console.error("Error sending payment link:", error);
    // Error is logged but we don't return it since this is a form action
  }
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
