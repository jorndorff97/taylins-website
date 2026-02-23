"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { useAdminLayout } from "./AdminLayoutClient";

const navItems = [
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { mobileMenuOpen, setMobileMenuOpen } = useAdminLayout();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const res = await fetch("/api/admin/messages/unread-count");
        const data = await res.json();
        setUnreadMessages(data.count || 0);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    }

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Desktop Sidebar - Always visible on md+ screens */}
      <aside className="hidden md:flex h-full w-56 flex-col border-r border-slate-200 bg-card/80">
        <div className="flex h-16 items-center px-5">
          <span className="text-sm font-semibold tracking-tight">
            eForwarder Admin
          </span>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4 text-sm">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            const showBadge = item.label === "Messages" && unreadMessages > 0;
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
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <span className={clsx(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                    active 
                      ? "bg-white text-slate-900" 
                      : "bg-red-500 text-white"
                  )}>
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
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

      {/* Mobile Sidebar - Slide in from left */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <span className="text-sm font-semibold tracking-tight">
            eForwarder Admin
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4 text-sm">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            const showBadge = item.label === "Messages" && unreadMessages > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  "flex items-center gap-2 rounded-full px-3 py-2 transition-colors",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100",
                )}
              >
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <span className={clsx(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                    active 
                      ? "bg-white text-slate-900" 
                      : "bg-red-500 text-white"
                  )}>
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
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
    </>
  );
}

