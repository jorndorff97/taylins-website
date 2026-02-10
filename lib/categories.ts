import { prisma } from "@/lib/prisma";
import { ListingStatus } from "@prisma/client";

export const STOREFRONT_CATEGORIES = [
  // Footwear (Currently Active)
  { slug: "sneakers", label: "Sneakers", group: "Footwear" },
  { slug: "slides-mules", label: "Slides & Mules", group: "Footwear" },
  { slug: "casuals", label: "Casuals", group: "Footwear" },
  { slug: "boots", label: "Boots", group: "Footwear" },
  
  // Apparel (Coming Soon by default)
  { slug: "streetwear", label: "Streetwear", group: "Apparel" },
  { slug: "hoodies", label: "Hoodies", group: "Apparel" },
  { slug: "tees", label: "Tees", group: "Apparel" },
  
  // Accessories (Coming Soon by default)
  { slug: "hats", label: "Hats", group: "Accessories" },
  { slug: "bags", label: "Bags", group: "Accessories" },
  
  // Electronics (Coming Soon by default)
  { slug: "electronics", label: "Electronics", group: "Electronics" },
  
  // Collectibles
  { slug: "collectibles", label: "Collectibles", group: "Other" },
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

/**
 * Check if a category has at least one active listing
 */
export async function getCategoryStatus(categoryLabel: string): Promise<boolean> {
  const count = await prisma.listing.count({
    where: {
      status: ListingStatus.ACTIVE,
      category: { equals: categoryLabel, mode: "insensitive" }
    }
  });
  return count > 0;
}

/**
 * Get all category labels that have at least one active listing
 */
export async function getActiveCategories(): Promise<string[]> {
  const results = await prisma.listing.groupBy({
    by: ['category'],
    where: { status: ListingStatus.ACTIVE },
    _count: { id: true }
  });
  return results.map(r => r.category);
}
