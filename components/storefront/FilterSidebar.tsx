"use client";

import { useEffect } from "react";
import clsx from "clsx";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterSection {
  id: string;
  label: string;
  options: FilterOption[];
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sections: FilterSection[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (sectionId: string, value: string, checked: boolean) => void;
  onClearAll: () => void;
  resultCount: number;
}

export function FilterSidebar({
  isOpen,
  onClose,
  sections,
  selectedFilters,
  onFilterChange,
  onClearAll,
  resultCount,
}: FilterSidebarProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const totalSelected = Object.values(selectedFilters).flat().length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <h2 className="text-lg font-semibold text-slate-900">All filters</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close filters"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter Sections */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {sections.map((section) => (
            <div key={section.id} className="border-b border-slate-100 py-5 first:pt-0 last:border-b-0">
              <h3 className="mb-4 text-base font-semibold text-slate-900">{section.label}</h3>
              <div className="space-y-3">
                {section.options.map((option) => {
                  const isChecked = selectedFilters[section.id]?.includes(option.value) ?? false;
                  return (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-3 text-sm text-slate-700 hover:text-slate-900"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => onFilterChange(section.id, option.value, e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                      />
                      <span className="flex-1">{option.label}</span>
                      {option.count !== undefined && (
                        <span className="text-xs text-slate-400">({option.count})</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-5 py-4">
          <p className="mb-4 text-sm text-slate-500">{resultCount} results</p>
          <div className="flex gap-3">
            <button
              onClick={onClearAll}
              disabled={totalSelected === 0}
              className="flex-1 rounded-full border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-full bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
            >
              See results
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
