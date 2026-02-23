import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { OrderStatus } from "@prisma/client";
import { notifyPaymentSuccess } from "@/lib/notifications";

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

        // Support both single orderId and comma-separated orderIds (cart checkout)
        const orderIdsRaw = session.metadata?.orderIds ?? session.metadata?.orderId;
        if (!orderIdsRaw) {
          console.error("No orderId(s) in session metadata");
          break;
        }

        const orderIds = orderIdsRaw.split(",").map(Number).filter(Boolean);

        for (const oid of orderIds) {
          const order = await prisma.order.findUnique({
            where: { id: oid },
            include: { user: true, listing: true },
          });

          if (!order) {
            console.error(`Order ${oid} not found`);
            continue;
          }

          await prisma.order.update({
            where: { id: oid },
            data: {
              status: OrderStatus.PAID,
              stripePaymentIntentId: session.payment_intent as string,
              paidAt: new Date(),
            },
          });

          await notifyPaymentSuccess({
            userId: order.userId,
            orderId: order.id,
            listingTitle: order.listing.title,
            totalAmount: Number(order.totalAmount),
          });

          console.log(`Order ${oid} marked as PAID`);
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderIdsRaw = paymentIntent.metadata?.orderIds ?? paymentIntent.metadata?.orderId;

        if (!orderIdsRaw) {
          console.error("No orderId(s) in payment intent metadata");
          break;
        }

        const piOrderIds = orderIdsRaw.split(",").map(Number).filter(Boolean);
        for (const oid of piOrderIds) {
          const order = await prisma.order.findUnique({ where: { id: oid } });
          if (order && order.status !== OrderStatus.PAID) {
            await prisma.order.update({
              where: { id: oid },
              data: {
                status: OrderStatus.PAID,
                stripePaymentIntentId: paymentIntent.id,
                paidAt: new Date(),
              },
            });
            console.log(`Order ${oid} marked as PAID via payment_intent.succeeded`);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const failedIds = paymentIntent.metadata?.orderIds ?? paymentIntent.metadata?.orderId;
        console.log(`Payment failed for order(s) ${failedIds}`);
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
