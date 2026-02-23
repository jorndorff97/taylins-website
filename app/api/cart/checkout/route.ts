import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getUserId } from "@/lib/auth-config";
import { calculateOrderTotal } from "@/lib/pricing";
import { OrderStatus, InventoryMode } from "@prisma/client";
import type Stripe from "stripe";

interface CartItemSize {
  sizeId: number;
  sizeLabel: string;
  quantity: number;
}

interface CartShippingOption {
  id: number;
  label: string;
  price: number;
}

interface CartItem {
  listingId: number;
  title: string;
  imageUrl: string | null;
  pricePerPair: number;
  totalPairs: number;
  productTotal: number;
  inventoryMode: "SIZE_RUN" | "MIXED_BATCH";
  items: CartItemSize[];
  shippingOption: CartShippingOption | null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { items: cartItems } = body as { items: CartItem[] };

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const listingIds = cartItems.map((c) => c.listingId);
    const listings = await prisma.listing.findMany({
      where: { id: { in: listingIds } },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        sizes: true,
        tierPrices: { orderBy: { minQty: "asc" } },
        shippingOptions: true,
      },
    });

    const listingMap = new Map(listings.map((l) => [l.id, l]));
    const createdOrders: number[] = [];
    const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const cartItem of cartItems) {
      const listing = listingMap.get(cartItem.listingId);
      if (!listing) {
        return NextResponse.json(
          { error: `Listing "${cartItem.title}" is no longer available` },
          { status: 400 }
        );
      }

      if (!listing.instantBuy) {
        return NextResponse.json(
          { error: `"${listing.title}" is not available for direct purchase` },
          { status: 400 }
        );
      }

      let totalPairs = 0;
      let orderItems: { sizeLabel: string | null; quantity: number; pricePerPair: number }[] = [];

      if (listing.inventoryMode === InventoryMode.SIZE_RUN) {
        if (!cartItem.items || cartItem.items.length === 0) {
          return NextResponse.json(
            { error: `No sizes selected for "${listing.title}"` },
            { status: 400 }
          );
        }

        for (const item of cartItem.items) {
          const size = listing.sizes.find((s) => s.id === item.sizeId);
          if (!size) {
            return NextResponse.json({ error: `Invalid size for "${listing.title}"` }, { status: 400 });
          }
          if (size.soldOut || size.quantity === 0) {
            return NextResponse.json(
              { error: `Size ${size.sizeLabel} for "${listing.title}" is sold out` },
              { status: 400 }
            );
          }
          if (item.quantity > size.quantity) {
            return NextResponse.json(
              { error: `Only ${size.quantity} left for size ${size.sizeLabel} in "${listing.title}"` },
              { status: 400 }
            );
          }
          totalPairs += item.quantity;
        }
      } else {
        totalPairs = cartItem.totalPairs;
        if (totalPairs > (listing.totalPairs ?? 0)) {
          return NextResponse.json(
            { error: `Only ${listing.totalPairs} pairs available for "${listing.title}"` },
            { status: 400 }
          );
        }
      }

      if (totalPairs < listing.moq) {
        return NextResponse.json(
          { error: `Minimum order for "${listing.title}" is ${listing.moq} pairs` },
          { status: 400 }
        );
      }

      const orderTotal = calculateOrderTotal({
        listing,
        tiers: listing.tierPrices,
        totalPairs,
      });

      if (listing.inventoryMode === InventoryMode.SIZE_RUN) {
        orderItems = cartItem.items.map((item) => ({
          sizeLabel: item.sizeLabel,
          quantity: item.quantity,
          pricePerPair: orderTotal.pricePerPair,
        }));
      } else {
        orderItems = [{ sizeLabel: null, quantity: totalPairs, pricePerPair: orderTotal.pricePerPair }];
      }

      // Resolve shipping
      let shippingCost = 0;
      let shippingLabel: string | null = null;
      const enabledShipping = listing.shippingOptions.filter((o) => o.enabled);

      if (enabledShipping.length > 0 && cartItem.shippingOption) {
        const selected = enabledShipping.find((o) => o.id === cartItem.shippingOption!.id);
        if (!selected) {
          return NextResponse.json(
            { error: `Invalid shipping option for "${listing.title}"` },
            { status: 400 }
          );
        }
        shippingCost = Number(selected.price);
        shippingLabel = selected.label;
      } else if (enabledShipping.length > 0) {
        return NextResponse.json(
          { error: `Shipping option required for "${listing.title}"` },
          { status: 400 }
        );
      }

      const finalTotal = orderTotal.totalAmount + shippingCost;

      const order = await prisma.order.create({
        data: {
          userId,
          listingId: listing.id,
          status: OrderStatus.CONFIRMED,
          totalPairs: orderTotal.totalPairs,
          totalAmount: finalTotal,
          shippingCost: shippingCost > 0 ? shippingCost : null,
          shippingLabel,
          items: { create: orderItems },
        },
      });

      createdOrders.push(order.id);

      // Build Stripe line items for this listing's products
      stripeLineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: listing.title,
            images: listing.images[0]?.url ? [listing.images[0].url] : [],
            description: `${totalPairs} pairs @ $${orderTotal.pricePerPair}/pair`,
          },
          unit_amount: Math.round(orderTotal.pricePerPair * 100),
        },
        quantity: totalPairs,
      });

      // Add shipping as a separate line item if applicable
      if (shippingCost > 0 && shippingLabel) {
        stripeLineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `Shipping: ${shippingLabel}`,
              description: `${listing.title} - ${shippingLabel} delivery`,
            },
            unit_amount: Math.round(shippingCost * 100),
          },
          quantity: 1,
        });
      }
    }

    // Create a single Stripe checkout session for all items
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || req.headers.get("origin") || "http://localhost:3000";

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: stripeLineItems,
      mode: "payment",
      success_url: `${baseUrl}/orders?payment=success`,
      cancel_url: `${baseUrl}/cart?payment=cancelled`,
      customer_email: user?.email ?? undefined,
      metadata: {
        orderIds: createdOrders.join(","),
      },
      payment_intent_data: {
        metadata: {
          orderIds: createdOrders.join(","),
        },
      },
    });

    // Save checkout session ID to all orders
    await prisma.order.updateMany({
      where: { id: { in: createdOrders } },
      data: { stripeCheckoutSessionId: session.id },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Cart checkout error:", error);
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}
