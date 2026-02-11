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
