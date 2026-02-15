import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createCustomPaymentLink } from "../../actions";

export const dynamic = "force-dynamic";

export default async function SendPaymentLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!orderId) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: true,
      listing: true,
      items: true,
    },
  });

  if (!order) notFound();

  // If already paid, redirect back
  if (order.paidAt) {
    redirect(`/admin/orders/${orderId}`);
  }

  // Calculate defaults from the order
  const defaultQuantity = order.totalPairs;
  const defaultPricePerPair = Number(order.totalAmount) / order.totalPairs;

  return (
    <>
      <AdminHeader
        title="Send Payment Link"
        actions={
          <Link href={`/admin/orders/${orderId}`}>
            <Button variant="secondary">Cancel</Button>
          </Link>
        }
      />
      <main className="flex-1 bg-background px-6 pb-10 pt-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Order Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order #{order.id}</h2>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Buyer:</span>
                <span className="font-medium text-slate-900">{order.buyer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Listing:</span>
                <span className="font-medium text-slate-900">{order.listing.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Original Request:</span>
                <span className="font-medium text-slate-900">
                  {order.totalPairs} pairs @ ${defaultPricePerPair.toFixed(2)}/pair
                </span>
              </div>
            </div>
          </Card>

          {/* Payment Link Form */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Create Custom Payment Link
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Set your negotiated price and quantity. A Stripe checkout link will be generated and sent to the buyer.
            </p>

            <form action={createCustomPaymentLink} className="space-y-6">
              <input type="hidden" name="orderId" value={order.id} />

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-slate-900 mb-2">
                  Quantity (pairs)
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  defaultValue={defaultQuantity}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Number of pairs for this payment
                </p>
              </div>

              {/* Pricing Mode Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Pricing Method
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pricingMode"
                      value="perPair"
                      defaultChecked
                      className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-sm text-slate-700">Price per pair</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pricingMode"
                      value="total"
                      className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-sm text-slate-700">Total price</span>
                  </label>
                </div>
              </div>

              {/* Price Per Pair */}
              <div id="pricePerPairSection">
                <label htmlFor="pricePerPair" className="block text-sm font-medium text-slate-900 mb-2">
                  Price per pair ($)
                </label>
                <input
                  type="number"
                  id="pricePerPair"
                  name="pricePerPair"
                  min="0.01"
                  step="0.01"
                  defaultValue={defaultPricePerPair.toFixed(2)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Your negotiated price per pair
                </p>
              </div>

              {/* Total Price */}
              <div id="totalPriceSection" style={{ display: 'none' }}>
                <label htmlFor="totalPrice" className="block text-sm font-medium text-slate-900 mb-2">
                  Total price ($)
                </label>
                <input
                  type="number"
                  id="totalPrice"
                  name="totalPrice"
                  min="0.01"
                  step="0.01"
                  defaultValue={(defaultQuantity * defaultPricePerPair).toFixed(2)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  The total amount for all pairs
                </p>
              </div>

              {/* Message (optional) */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-900 mb-2">
                  Message to buyer (optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  placeholder="e.g., Here's the payment link for our agreed price of..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  This message will be added to the order conversation
                </p>
              </div>

              {/* Total Preview */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm font-medium text-slate-700">Total Amount:</span>
                  <span className="text-2xl font-bold text-slate-900" id="totalPreview">
                    ${(defaultQuantity * defaultPricePerPair).toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  <span id="priceBreakdown">
                    {defaultQuantity} pairs × ${defaultPricePerPair.toFixed(2)}/pair
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-300">
                  This is the amount the buyer will be charged via Stripe
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <Link href={`/admin/orders/${orderId}`} className="flex-1">
                  <Button type="button" variant="secondary" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="flex-1">
                  Generate & Send Payment Link
                </Button>
              </div>
            </form>
          </Card>

          {/* Info Card */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">How it works</p>
                <ul className="text-blue-800 space-y-1 text-xs">
                  <li>• A Stripe checkout session will be created with your custom terms</li>
                  <li>• The payment link will be added to the order messages</li>
                  <li>• The buyer can click the link to complete payment</li>
                  <li>• The order will automatically update to PAID when payment succeeds</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              const quantityInput = document.getElementById('quantity');
              const pricePerPairInput = document.getElementById('pricePerPair');
              const totalPriceInput = document.getElementById('totalPrice');
              const totalPreview = document.getElementById('totalPreview');
              const priceBreakdown = document.getElementById('priceBreakdown');
              const pricePerPairSection = document.getElementById('pricePerPairSection');
              const totalPriceSection = document.getElementById('totalPriceSection');
              const pricingModeRadios = document.querySelectorAll('input[name="pricingMode"]');
              
              let currentMode = 'perPair';
              
              // Toggle between pricing modes
              pricingModeRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                  currentMode = this.value;
                  if (currentMode === 'perPair') {
                    pricePerPairSection.style.display = 'block';
                    totalPriceSection.style.display = 'none';
                    pricePerPairInput.required = true;
                    totalPriceInput.required = false;
                    // Sync total price from per pair
                    const quantity = parseFloat(quantityInput.value) || 0;
                    const pricePerPair = parseFloat(pricePerPairInput.value) || 0;
                    totalPriceInput.value = (quantity * pricePerPair).toFixed(2);
                  } else {
                    pricePerPairSection.style.display = 'none';
                    totalPriceSection.style.display = 'block';
                    pricePerPairInput.required = false;
                    totalPriceInput.required = true;
                    // Sync per pair from total
                    const quantity = parseFloat(quantityInput.value) || 1;
                    const total = parseFloat(totalPriceInput.value) || 0;
                    pricePerPairInput.value = (total / quantity).toFixed(2);
                  }
                  updateTotal();
                });
              });
              
              function updateTotal() {
                const quantity = parseFloat(quantityInput.value) || 0;
                let total = 0;
                let pricePerPair = 0;
                
                if (currentMode === 'perPair') {
                  pricePerPair = parseFloat(pricePerPairInput.value) || 0;
                  total = quantity * pricePerPair;
                  // Update total price input to stay in sync
                  totalPriceInput.value = total.toFixed(2);
                } else {
                  total = parseFloat(totalPriceInput.value) || 0;
                  pricePerPair = quantity > 0 ? total / quantity : 0;
                  // Update price per pair input to stay in sync
                  pricePerPairInput.value = pricePerPair.toFixed(2);
                }
                
                totalPreview.textContent = '$' + total.toFixed(2);
                priceBreakdown.textContent = quantity + ' pairs × $' + pricePerPair.toFixed(2) + '/pair';
              }
              
              quantityInput.addEventListener('input', updateTotal);
              pricePerPairInput.addEventListener('input', updateTotal);
              totalPriceInput.addEventListener('input', updateTotal);
            });
          `,
        }}
      />
    </>
  );
}
