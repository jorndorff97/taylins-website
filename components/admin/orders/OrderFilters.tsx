"use client";

import { Input } from "@/components/ui/input";

export type OrderSort = "newest" | "oldest" | "highest" | "lowest";

interface OrderFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: OrderSort;
  onSortChange: (value: OrderSort) => void;
}

export function OrderFilters({
  search,
  onSearchChange,
  sort,
  onSortChange,
}: OrderFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <Input
          type="text"
          placeholder="Search by order #, email, or listing..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as OrderSort)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="highest">Highest value</option>
        <option value="lowest">Lowest value</option>
      </select>
    </div>
  );
}
