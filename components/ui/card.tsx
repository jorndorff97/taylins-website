import type { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={clsx(
        "rounded-xl bg-card p-6 shadow-soft ring-1 ring-slate-200/60",
        className,
      )}
    >
      {children}
    </section>
  );
}

