import Link from "next/link";
import type { ReactNode } from "react";
import { getBuyerId } from "@/lib/buyer-auth";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const buyerId = await getBuyerId();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl font-semibold tracking-tight text-slate-900">
            Taylin
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/browse" className="text-sm text-slate-600 hover:text-slate-900">
              Browse
            </Link>
            {buyerId ? (
              <>
                <Link href="/account" className="text-sm text-slate-600 hover:text-slate-900">
                  Account
                </Link>
                <form action="/api/buyer/logout" method="post">
                  <button type="submit" className="text-sm text-slate-600 hover:text-slate-900">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Register
                </Link>
              </>
            )}
            <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-700">
              Admin
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
