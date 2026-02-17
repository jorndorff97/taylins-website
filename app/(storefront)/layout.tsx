import Link from "next/link";
import type { ReactNode } from "react";
import { StorefrontNav } from "@/components/storefront/StorefrontNav";
import { Footer } from "@/components/storefront/Footer";
import { BackgroundColorProvider } from "@/context/BackgroundColorContext";
import { AuthProvider } from "@/components/providers/AuthProvider";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <BackgroundColorProvider>
        <div className="flex min-h-screen flex-col bg-transparent">
          <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
              <Link href="/" className="text-xl font-semibold tracking-tight text-slate-900">
                eForwarder
              </Link>
              <StorefrontNav />
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </BackgroundColorProvider>
    </AuthProvider>
  );
}
