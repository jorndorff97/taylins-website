import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { OrderStatus } from "@prisma/client";

// Disable body parsing to get raw body for signature verification
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          console.error("No orderId in session metadata");
          break;
        }

        // Update order status to PAID
        await prisma.order.update({
          where: { id: Number(orderId) },
          data: {
            status: OrderStatus.PAID,
            stripePaymentIntentId: session.payment_intent as string,
            paidAt: new Date(),
          },
        });

        console.log(`Order ${orderId} marked as PAID`);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (!orderId) {
          console.error("No orderId in payment intent metadata");
          break;
        }

        // Double-check that order is marked as paid
        const order = await prisma.order.findUnique({
          where: { id: Number(orderId) },
        });

        if (order && order.status !== OrderStatus.PAID) {
          await prisma.order.update({
            where: { id: Number(orderId) },
            data: {
              status: OrderStatus.PAID,
              stripePaymentIntentId: paymentIntent.id,
              paidAt: new Date(),
            },
          });
          console.log(`Order ${orderId} marked as PAID via payment_intent.succeeded`);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (!orderId) {
          console.error("No orderId in payment intent metadata");
          break;
        }

        console.log(`Payment failed for order ${orderId}`);
        // Optionally update order status or notify admin
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
