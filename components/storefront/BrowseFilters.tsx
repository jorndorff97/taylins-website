"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterSidebar, FilterSection } from "./FilterSidebar";
import { ListingCard } from "./ListingCard";
import type { Listing, ListingImage, ListingSize, ListingTierPrice } from "@prisma/client";

type SerializedListing = Omit<Listing, 'flatPricePerPair' | 'basePricePerPair' | 'costPerPair' | 'stockXPrice'> & {
  flatPricePerPair: number | null;
  basePricePerPair: number | null;
  costPerPair: number | null;
  stockXPrice: number | null;
  images: ListingImage[];
  sizes: ListingSize[];
  tierPrices: (Omit<ListingTierPrice, 'pricePerPair'> & { pricePerPair: number })[];
};

interface CategoryOption {
  slug: string;
  label: string;
}

interface BrowseFiltersProps {
  listings: SerializedListing[];
  categories: CategoryOption[];
  activeCategories: string[];
  brands: string[];
  currentCategory: string;
  currentSearch: string;
  currentSort: string;
}

// Price ranges for filtering
const PRICE_RANGES = [
  { value: "0-50", label: "Under $50", min: 0, max: 50 },
  { value: "50-100", label: "$50 - $100", min: 50, max: 100 },
  { value: "100-150", label: "$100 - $150", min: 100, max: 150 },
  { value: "150-200", label: "$150 - $200", min: 150, max: 200 },
  { value: "200+", label: "$200+", min: 200, max: Infinity },
];

export function BrowseFilters({
  listings,
  categories,
  activeCategories,
  brands,
  currentCategory,
  currentSearch,
  currentSort,
}: BrowseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Client-side category state for instant switching
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);

  // Parse current filters from URL
  const getFiltersFromUrl = useCallback(() => {
    const filters: Record<string, string[]> = {};
    
    const brandParam = searchParams.get("brands");
    if (brandParam) filters.brand = brandParam.split(",");
    
    const priceParam = searchParams.get("price");
    if (priceParam) filters.price = priceParam.split(",");
    
    const categoryParam = searchParams.get("categories");
    if (categoryParam) filters.category = categoryParam.split(",");
    
    return filters;
  }, [searchParams]);

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(getFiltersFromUrl);

  // Update URL when filters change
  const updateUrl = useCallback((newFilters: Record<string, string[]>) => {
    const params = new URLSearchParams();
    
    if (currentCategory) params.set("category", currentCategory);
    if (currentSearch) params.set("q", currentSearch);
    if (currentSort && currentSort !== "newest") params.set("sort", currentSort);
    
    if (newFilters.brand?.length) params.set("brands", newFilters.brand.join(","));
    if (newFilters.price?.length) params.set("price", newFilters.price.join(","));
    if (newFilters.category?.length) params.set("categories", newFilters.category.join(","));
    
    router.push(`/browse?${params.toString()}`, { scroll: false });
  }, [router, currentCategory, currentSearch, currentSort]);

  // Get the category label from slug for filtering
  const getCategoryLabel = useCallback((slug: string): string | null => {
    const found = categories.find((c) => c.slug === slug);
    return found?.label ?? null;
  }, [categories]);

  // Filter listings based on selected filters AND selected category
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      // Category filter (from top pills - single select)
      if (selectedCategory) {
        const categoryLabel = getCategoryLabel(selectedCategory);
        if (categoryLabel && listing.category.toLowerCase() !== categoryLabel.toLowerCase()) {
          return false;
        }
      }
      
      // Brand filter
      if (selectedFilters.brand?.length) {
        if (!listing.brand || !selectedFilters.brand.includes(listing.brand)) {
          return false;
        }
      }
      
      // Category filter (multi-select within sidebar - additional filter)
      if (selectedFilters.category?.length) {
        if (!selectedFilters.category.includes(listing.category)) {
          return false;
        }
      }
      
      // Price filter
      if (selectedFilters.price?.length) {
        const price = listing.flatPricePerPair ?? listing.tierPrices[0]?.pricePerPair ?? 0;
        const matchesPrice = selectedFilters.price.some((rangeKey) => {
          const range = PRICE_RANGES.find((r) => r.value === rangeKey);
          if (!range) return false;
          return price >= range.min && price < range.max;
        });
        if (!matchesPrice) return false;
      }
      
      return true;
    });
  }, [listings, selectedFilters, selectedCategory, getCategoryLabel]);

  // Count listings per filter option
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach((l) => {
      if (l.brand) {
        counts[l.brand] = (counts[l.brand] || 0) + 1;
      }
    });
    return counts;
  }, [listings]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach((l) => {
      counts[l.category] = (counts[l.category] || 0) + 1;
    });
    return counts;
  }, [listings]);

  const priceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PRICE_RANGES.forEach((range) => {
      counts[range.value] = listings.filter((l) => {
        const price = l.flatPricePerPair ?? l.tierPrices[0]?.pricePerPair ?? 0;
        return price >= range.min && price < range.max;
      }).length;
    });
    return counts;
  }, [listings]);

  // Build filter sections for sidebar
  const filterSections: FilterSection[] = useMemo(() => {
    const sections: FilterSection[] = [];

    // Brand section
    if (brands.length > 0) {
      sections.push({
        id: "brand",
        label: "Brand",
        options: brands.map((brand) => ({
          value: brand,
          label: brand,
          count: brandCounts[brand] || 0,
        })),
      });
    }

    // Category section
    const categoryOptions = categories
      .filter((cat) => activeCategories.includes(cat.label))
      .map((cat) => ({
        value: cat.label,
        label: cat.label,
        count: categoryCounts[cat.label] || 0,
      }));
    
    if (categoryOptions.length > 0) {
      sections.push({
        id: "category",
        label: "Category",
        options: categoryOptions,
      });
    }

    // Price section
    sections.push({
      id: "price",
      label: "Price",
      options: PRICE_RANGES.map((range) => ({
        value: range.value,
        label: range.label,
        count: priceCounts[range.value] || 0,
      })),
    });

    return sections;
  }, [brands, categories, activeCategories, brandCounts, categoryCounts, priceCounts]);

  const handleFilterChange = (sectionId: string, value: string, checked: boolean) => {
    setSelectedFilters((prev) => {
      const current = prev[sectionId] || [];
      const updated = checked
        ? [...current, value]
        : current.filter((v) => v !== value);
      
      const newFilters = { ...prev, [sectionId]: updated };
      
      // Clean up empty arrays
      if (newFilters[sectionId].length === 0) {
        delete newFilters[sectionId];
      }
      
      updateUrl(newFilters);
      return newFilters;
    });
  };

  const handleClearAll = () => {
    setSelectedFilters({});
    setSelectedCategory("");
    updateUrl({});
  };

  const totalSelected = Object.values(selectedFilters).flat().length;

  // Sort options
  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
  ];

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams();
    if (currentCategory) params.set("category", currentCategory);
    if (currentSearch) params.set("q", currentSearch);
    if (sortValue !== "newest") params.set("sort", sortValue);
    if (selectedFilters.brand?.length) params.set("brands", selectedFilters.brand.join(","));
    if (selectedFilters.price?.length) params.set("price", selectedFilters.price.join(","));
    if (selectedFilters.category?.length) params.set("categories", selectedFilters.category.join(","));
    router.push(`/browse?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {/* Top Filter Bar - Single unified row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filter Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter
          {totalSelected > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs text-white">
              {totalSelected}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="appearance-none rounded-full border border-slate-300 bg-white py-2 pl-4 pr-8 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:border-slate-400 focus:outline-none focus:ring-0"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-slate-200" />

        {/* Category Pills - client-side instant switching */}
        <button
          onClick={() => setSelectedCategory("")}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            !selectedCategory 
              ? "border-slate-900 bg-slate-900 text-white" 
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          All
        </button>
        {categories
          .filter((cat) => activeCategories.includes(cat.label))
          .map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedCategory === cat.slug
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-slate-200" />

        {/* Quick filters - Popular Brands */}
        {brands.slice(0, 3).map((brand) => {
          const isSelected = selectedFilters.brand?.includes(brand);
          return (
            <button
              key={brand}
              onClick={() => handleFilterChange("brand", brand, !isSelected)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                isSelected
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {brand}
            </button>
          );
        })}

        {/* Quick price filter */}
        <button
          onClick={() => {
            const isSelected = selectedFilters.price?.includes("0-50");
            handleFilterChange("price", "0-50", !isSelected);
          }}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            selectedFilters.price?.includes("0-50")
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Under $50
        </button>
      </div>

      {/* Active filters display */}
      {totalSelected > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500">Active filters:</span>
          {Object.entries(selectedFilters).flatMap(([sectionId, values]) =>
            values.map((value) => (
              <button
                key={`${sectionId}-${value}`}
                onClick={() => handleFilterChange(sectionId, value, false)}
                className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200"
              >
                {value}
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ))
          )}
          <button
            onClick={handleClearAll}
            className="text-sm text-red-600 hover:text-red-700 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results */}
      {filteredListings.length === 0 ? (
        <p className="mt-12 text-slate-500">
          No listings match your filters.{" "}
          <button onClick={handleClearAll} className="text-red-600 hover:underline">
            Clear filters
          </button>
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sections={filterSections}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
        resultCount={filteredListings.length}
      />
    </>
  );
}
