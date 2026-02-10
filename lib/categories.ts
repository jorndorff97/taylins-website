export const STOREFRONT_CATEGORIES = [
  { slug: "sneakers", label: "Sneakers" },
  { slug: "slides-mules", label: "Slides & Mules" },
  { slug: "casuals", label: "Casuals" },
  { slug: "boots", label: "Boots" },
  { slug: "collectibles", label: "Collectibles" },
] as const;

export function categorySlugToLabel(slug: string): string {
  const found = STOREFRONT_CATEGORIES.find((c) => c.slug === slug);
  return found?.label ?? slug;
}

export function categoryLabelToSlug(label: string): string {
  const normalized = label.toLowerCase().replace(/\s+/g, "-");
  const found = STOREFRONT_CATEGORIES.find((c) => c.label.toLowerCase() === label.toLowerCase());
  return found?.slug ?? normalized;
}
