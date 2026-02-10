import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Fetch the order with related data
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        buyer: true,
        listing: {
          include: {
            images: { orderBy: { sortOrder: "asc" } },
          },
        },
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if checkout session already exists
    if (order.stripeCheckoutSessionId) {
      const existingSession = await stripe.checkout.sessions.retrieve(
        order.stripeCheckoutSessionId
      );
      
      // If the session is still open, return the existing URL
      if (existingSession.status === "open") {
        return NextResponse.json({ url: existingSession.url });
      }
    }

    // Create line items from order items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: `${order.listing.title}${item.sizeLabel ? ` - Size ${item.sizeLabel}` : ""}`,
          images: order.listing.images[0]?.url ? [order.listing.images[0].url] : [],
          description: `${item.quantity} pairs`,
        },
        unit_amount: Math.round(Number(item.pricePerPair) * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Get the base URL for success/cancel redirects
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get("origin") || "http://localhost:3000";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/order/${orderId}?payment=success`,
      cancel_url: `${baseUrl}/order/${orderId}?payment=cancelled`,
      customer_email: order.buyer.email,
      metadata: {
        orderId: order.id.toString(),
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id.toString(),
        },
      },
    });

    // Save the checkout session ID to the order
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
