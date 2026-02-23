"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SenderType, OrderStatus } from "@prisma/client";
import {
  notifyNewMessageToUser,
  notifyPaymentLinkSent,
  notifyOrderStatusChange,
  notifyOrderProcessing,
  notifyTrackingAdded,
} from "@/lib/notifications";

const CARRIER_TRACKING_URLS: Record<string, (num: string) => string> = {
  USPS: (n) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`,
  UPS: (n) => `https://www.ups.com/track?tracknum=${n}`,
  FedEx: (n) => `https://www.fedex.com/fedextrack/?trknbr=${n}`,
  DHL: (n) => `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${n}`,
};

export async function replyToOrder(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!orderId || !body) return;

  // Get order details for notification
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      listing: true,
    },
  });

  if (!order) return;

  await prisma.orderMessage.create({
    data: {
      orderId,
      senderType: SenderType.SELLER,
      body,
    },
  });

  // Send notification to user
  await notifyNewMessageToUser({
    userId: order.userId,
    orderId,
    listingTitle: order.listing.title,
    message: body,
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function updateOrderStatus(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const status = String(formData.get("status"));
  if (!orderId || !status) return;

  const valid = ["PENDING", "CONFIRMED", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
  if (!valid.includes(status)) return;

  // Get order details for notification
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      listing: true,
    },
  });

  if (!order) return;

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as "PENDING" | "CONFIRMED" | "PAID" | "SHIPPED" | "CANCELLED" },
  });

  // Send notification to user about status change
  await notifyOrderStatusChange({
    userId: order.userId,
    orderId,
    listingTitle: order.listing.title,
    newStatus: status,
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
    // Get order details for notification
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        listing: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

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

    // Send notification to user with payment link
    await notifyPaymentLinkSent({
      userId: order.userId,
      orderId,
      listingTitle: order.listing.title,
      quantity,
      pricePerPair,
      totalAmount,
      paymentLink: url,
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    
    redirect(`/admin/orders/${orderId}`);
  } catch (error) {
    console.error("Error creating custom payment link:", error);
    throw error;
  }
}

export async function forwardToSupplier(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const supplierOrderId = String(formData.get("supplierOrderId") ?? "").trim();
  if (!orderId) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, listing: true },
  });
  if (!order) return;

  const supplierCost = order.listing.costPerPair
    ? Number(order.listing.costPerPair) * order.totalPairs
    : null;

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PROCESSING,
        supplierOrderId: supplierOrderId || null,
        fulfilledAt: new Date(),
        supplierCost: supplierCost,
      },
    }),
    prisma.orderActivity.create({
      data: {
        orderId,
        type: "supplier_forwarded",
        description: supplierOrderId
          ? `Order forwarded to supplier (Ref: ${supplierOrderId})`
          : "Order forwarded to supplier",
        metadata: { supplierOrderId, supplierCost },
      },
    }),
  ]);

  await notifyOrderProcessing({
    userId: order.userId,
    orderId,
    listingTitle: order.listing.title,
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function addTracking(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const trackingCarrier = String(formData.get("trackingCarrier") ?? "").trim();
  const estimatedDelivery = formData.get("estimatedDelivery")
    ? new Date(String(formData.get("estimatedDelivery")))
    : null;

  if (!orderId || !trackingNumber || !trackingCarrier) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, listing: true },
  });
  if (!order) return;

  const trackingUrl =
    CARRIER_TRACKING_URLS[trackingCarrier]?.(trackingNumber) ?? null;

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.SHIPPED,
        trackingNumber,
        trackingCarrier,
        trackingUrl,
        estimatedDelivery,
      },
    }),
    prisma.orderActivity.create({
      data: {
        orderId,
        type: "tracking_added",
        description: `Tracking added: ${trackingCarrier} ${trackingNumber}`,
        metadata: { trackingNumber, trackingCarrier, trackingUrl },
      },
    }),
  ]);

  await notifyTrackingAdded({
    userId: order.userId,
    orderId,
    listingTitle: order.listing.title,
    trackingNumber,
    trackingCarrier,
    trackingUrl: trackingUrl ?? undefined,
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function markDelivered(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  if (!orderId) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, listing: true },
  });
  if (!order) return;

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date(),
      },
    }),
    prisma.orderActivity.create({
      data: {
        orderId,
        type: "status_change",
        description: "Order marked as delivered",
      },
    }),
  ]);

  await notifyOrderStatusChange({
    userId: order.userId,
    orderId,
    listingTitle: order.listing.title,
    newStatus: "DELIVERED",
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function addOrderNote(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const note = String(formData.get("note") ?? "").trim();
  if (!orderId || !note) return;

  await prisma.orderActivity.create({
    data: {
      orderId,
      type: "note_added",
      description: note,
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateSupplierCost(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const supplierCost = Number(formData.get("supplierCost"));
  if (!orderId || isNaN(supplierCost)) return;

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { supplierCost },
    }),
    prisma.orderActivity.create({
      data: {
        orderId,
        type: "cost_updated",
        description: `Supplier cost updated to $${supplierCost.toFixed(2)}`,
        metadata: { supplierCost },
      },
    }),
  ]);

  revalidatePath(`/admin/orders/${orderId}`);
}
