/**
 * Extract product SKU from StockX URL
 * Example: https://stockx.com/air-jordan-1-high-heritage -> "air-jordan-1-high-heritage"
 * Example: https://stockx.com/en-gb/air-jordan-1-retro-low-og -> "air-jordan-1-retro-low-og"
 * Note: StockX URLs contain product slug, not actual SKU
 * We'll use the slug as search query for RapidAPI
 */
export function extractStockXSlug(url: string): string | null {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('stockx.com')) return null;
    
    // Extract the product slug from pathname
    // e.g., /en-gb/air-jordan-1-high-heritage -> air-jordan-1-high-heritage
    // or /air-jordan-1-high-heritage -> air-jordan-1-high-heritage
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    
    // Skip common country/language codes (en-gb, en-us, fr-fr, etc.)
    const countryCodePattern = /^[a-z]{2}-[a-z]{2}$/i;
    const slug = pathSegments.find(segment => !countryCodePattern.test(segment));
    
    return slug || null;
  } catch {
    return null;
  }
}

/**
 * Extract brand from StockX slug
 * Examples:
 * - "air-jordan-1-high-heritage" -> "Jordan"
 * - "nike-dunk-low-panda" -> "Nike"
 * - "adidas-yeezy-boost-350" -> "Adidas"
 * - "new-balance-990v4" -> "New Balance"
 */
export function extractBrandFromSlug(slug: string): string | null {
  if (!slug) return null;

  const lowerSlug = slug.toLowerCase();

  // Brand patterns to match (order matters - check specific patterns first)
  const brandPatterns = [
    { pattern: /^air-jordan|jordan/i, name: 'Jordan' },
    { pattern: /^nike/i, name: 'Nike' },
    { pattern: /^adidas-yeezy|yeezy/i, name: 'Yeezy' },
    { pattern: /^adidas/i, name: 'Adidas' },
    { pattern: /^new-balance/i, name: 'New Balance' },
    { pattern: /^puma/i, name: 'Puma' },
    { pattern: /^reebok/i, name: 'Reebok' },
    { pattern: /^converse/i, name: 'Converse' },
    { pattern: /^vans/i, name: 'Vans' },
    { pattern: /^asics/i, name: 'Asics' },
    { pattern: /^salomon/i, name: 'Salomon' },
    { pattern: /^hoka/i, name: 'Hoka' },
    { pattern: /^on-running|on-/i, name: 'On' },
    { pattern: /^under-armour/i, name: 'Under Armour' },
  ];

  for (const { pattern, name } of brandPatterns) {
    if (pattern.test(lowerSlug)) {
      return name;
    }
  }

  return null;
}

/**
 * Format price for display
 */
export function formatPrice(price: number | null): string {
  if (price === null) return 'N/A';
  return `$${price.toLocaleString()}`;
}

/**
 * Calculate savings
 */
export function calculateSavings(stockXPrice: number, yourPrice: number): {
  amount: number;
  percentage: number;
} {
  const amount = stockXPrice - yourPrice;
  const percentage = Math.round((amount / stockXPrice) * 100);
  return { amount, percentage };
}
