import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-slate-900 hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-900",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-300",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
