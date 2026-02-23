"use client";

interface OrderItem {
  id: number;
  sizeLabel: string | null;
  quantity: number;
  pricePerPair: number;
}

interface OrderItemsTableProps {
  items: OrderItem[];
  totalPairs: number;
  totalAmount: number;
  shippingCost: number | null;
  shippingLabel: string | null;
}

export function OrderItemsTable({
  items,
  totalPairs,
  totalAmount,
  shippingCost,
  shippingLabel,
}: OrderItemsTableProps) {
  const subtotal = items.reduce((sum, i) => sum + i.pricePerPair * i.quantity, 0);

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Order Items
      </p>
      <div className="overflow-hidden rounded-lg border border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">Size</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2 text-right">Price/Pair</th>
              <th className="px-3 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-2 font-medium text-slate-700">
                  {item.sizeLabel ?? "Mixed"}
                </td>
                <td className="px-3 py-2 text-right text-slate-600">{item.quantity}</td>
                <td className="px-3 py-2 text-right text-slate-600">
                  ${item.pricePerPair.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right font-medium text-slate-900">
                  ${(item.pricePerPair * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-1 border-t border-slate-100 pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal ({totalPairs} pairs)</span>
          <span className="text-slate-700">${subtotal.toFixed(2)}</span>
        </div>
        {shippingCost != null && shippingCost > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-500">Shipping {shippingLabel && `(${shippingLabel})`}</span>
            <span className="text-slate-700">${shippingCost.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-100 pt-2">
          <span className="font-bold text-slate-900">Total</span>
          <span className="font-bold text-slate-900">${totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
