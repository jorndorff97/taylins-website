/**
 * Fetches StockX price from RapidAPI for a given product SKU
 * Returns the price or null if not found
 */
export async function fetchStockXPrice(productSKU: string): Promise<number | null> {
  if (!productSKU) return null;
  
  // Check environment variables
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidApiHost = process.env.RAPIDAPI_HOST;
  
  console.log('[STOCKX API] Environment check:', {
    hasKey: !!rapidApiKey,
    hasHost: !!rapidApiHost,
    host: rapidApiHost,
  });
  
  if (!rapidApiKey || !rapidApiHost) {
    console.error('[STOCKX API] Missing environment variables!');
    return null;
  }
  
  try {
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': rapidApiHost,
      },
    };

    const url = `https://${rapidApiHost}/productprice?styleId=${encodeURIComponent(productSKU)}`;
    console.log('[STOCKX API] Fetching from URL:', url);

    const response = await fetch(url, options);

    console.log('[STOCKX API] Response status:', response.status, response.statusText);

    if (!response.ok) {
      console.error(`[STOCKX API] Request failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log('[STOCKX API] Response data for SKU', productSKU, ':', JSON.stringify(data, null, 2));
    
    // Parse the price from response based on actual API structure
    let price = null;
    
    // Priority 1: Check lowestResellPrice structure (from API response)
    if (data.lowestResellPrice?.stockX) price = data.lowestResellPrice.stockX;
    else if (data.lowestResellPrice?.goat) price = data.lowestResellPrice.goat;
    else if (data.lowestResellPrice?.flightClub) price = data.lowestResellPrice.flightClub;
    else if (data.lowestResellPrice?.stadiumGoods) price = data.lowestResellPrice.stadiumGoods;
    // Priority 2: Try direct properties
    else if (data.lowestAsk) price = data.lowestAsk;
    else if (data.price) price = data.price;
    else if (data.retailPrice) price = data.retailPrice;
    // Priority 3: Try nested structures
    else if (data.Product?.lowestAsk) price = data.Product.lowestAsk;
    else if (data.Product?.price) price = data.Product.price;
    else if (data.sneaker?.lowestAsk) price = data.sneaker.lowestAsk;
    else if (data.sneaker?.price) price = data.sneaker.price;
    // Priority 4: Try market data
    else if (data.market?.lowestAsk) price = data.market.lowestAsk;
    else if (data.market?.lastSale) price = data.market.lastSale;
    
    console.log('[STOCKX API] Extracted price for SKU', productSKU, ':', price);
    
    return price ? Number(price) : null;
  } catch (error) {
    console.error("[STOCKX API] Error fetching price for SKU", productSKU, ":", error);
    return null;
  }
}
