import type { ReactNode } from "react";

interface AdminHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function AdminHeader({ title, actions }: AdminHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-card/80 px-6">
      <h1 className="text-base font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-2">{actions}</div>
    </header>
  );
}

