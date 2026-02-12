import Link from "next/link";
import type { ReactNode } from "react";
import { getBuyerId } from "@/lib/buyer-auth";
import { StorefrontNav } from "@/components/storefront/StorefrontNav";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const buyerId = await getBuyerId();

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl font-semibold tracking-tight text-slate-900">
            Taylin
          </Link>
          <StorefrontNav buyerId={buyerId} />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
