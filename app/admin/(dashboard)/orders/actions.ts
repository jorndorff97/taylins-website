"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function createCustomPaymentLink(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const quantity = Number(formData.get("quantity"));
  const pricingMode = String(formData.get("pricingMode"));
  const pricePerPairRaw = formData.get("pricePerPair");
  const totalPriceRaw = formData.get("totalPrice");
  const message = String(formData.get("message") ?? "").trim();

  if (!orderId || !quantity) {
    throw new Error("Missing required fields");
  }

  // Calculate pricePerPair based on selected mode
  let pricePerPair: number;
  let totalAmount: number;

  if (pricingMode === "total") {
    totalAmount = Number(totalPriceRaw);
    pricePerPair = totalAmount / quantity;
  } else {
    pricePerPair = Number(pricePerPairRaw);
    totalAmount = quantity * pricePerPair;
  }

  if (!pricePerPair || pricePerPair <= 0) {
    throw new Error("Invalid price");
  }

  try {
    // Create a checkout session via the API with custom price
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        orderId,
        customQuantity: quantity,
        customPricePerPair: pricePerPair,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create checkout session");
    }

    const { url } = await response.json();

    // Create a message with the payment link and optional note
    const messageBody = message 
      ? `${message}\n\nPayment link (${quantity} pairs @ $${pricePerPair.toFixed(2)}/pair = $${totalAmount.toFixed(2)}): ${url}`
      : `Payment link for ${quantity} pairs @ $${pricePerPair.toFixed(2)}/pair (Total: $${totalAmount.toFixed(2)}): ${url}`;

    await prisma.orderMessage.create({
      data: {
        orderId,
        senderType: SenderType.SELLER,
        body: messageBody,
      },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    
    redirect(`/admin/orders/${orderId}`);
  } catch (error) {
    console.error("Error creating custom payment link:", error);
    throw error;
  }
}
