"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/orders", label: "Orders" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-slate-200 bg-card/80">
      <div className="flex h-16 items-center px-5">
        <span className="text-sm font-semibold tracking-tight">
          Taylin Admin
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4 text-sm">
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-2 rounded-full px-3 py-2 transition-colors",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100",
              )}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 px-2 py-4">
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="w-full rounded-full px-3 py-2 text-left text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

