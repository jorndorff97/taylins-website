"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useAdminLayout } from "./AdminLayoutClient";
import { AdminNotificationBell } from "./AdminNotificationBell";

interface AdminHeaderProps {
  title: string;
  actions?: ReactNode;
  backHref?: string;
}

export function AdminHeader({ title, actions, backHref }: AdminHeaderProps) {
  const { setMobileMenuOpen } = useAdminLayout();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-card/80 px-4 md:px-6">
      <div className="flex items-center gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        ) : (
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label="Open menu"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <AdminNotificationBell />
        <div className="flex items-center gap-2">{actions}</div>
      </div>
    </header>
  );
}

