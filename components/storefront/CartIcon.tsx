"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export function CartIcon() {
  const { cart } = useCart();
  const itemCount = cart.length;

  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center text-slate-700 transition-colors hover:text-slate-900"
      aria-label={`Cart with ${itemCount} items`}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 text-[10px] font-bold text-slate-900">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}
