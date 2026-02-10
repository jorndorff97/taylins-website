"use client";

import type { ReactNode } from "react";
import { useAdminLayout } from "./AdminLayoutClient";

interface AdminHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function AdminHeader({ title, actions }: AdminHeaderProps) {
  const { setMobileMenuOpen } = useAdminLayout();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-card/80 px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger menu button - visible only on mobile */}
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
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </header>
  );
}

