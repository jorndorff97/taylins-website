/**
 * Fetches StockX price from RapidAPI for a given product SKU
 * Returns the price or null if not found
 */
export async function fetchStockXPrice(productSKU: string): Promise<number | null> {
  if (!productSKU) return null;
  
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidApiHost = process.env.RAPIDAPI_HOST;
  
  if (!rapidApiKey || !rapidApiHost) {
    console.error('[STOCKX API] Missing environment variables');
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
    console.log('[STOCKX API] Fetching:', url);

    const response = await fetch(url, options);

    if (!response.ok) {
      console.error(`[STOCKX API] Request failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    let price = null;
    
    if (data.lowestResellPrice?.stockX) price = data.lowestResellPrice.stockX;
    else if (data.lowestResellPrice?.goat) price = data.lowestResellPrice.goat;
    else if (data.lowestResellPrice?.flightClub) price = data.lowestResellPrice.flightClub;
    else if (data.lowestResellPrice?.stadiumGoods) price = data.lowestResellPrice.stadiumGoods;
    else if (data.lowestAsk) price = data.lowestAsk;
    else if (data.retailPrice) price = data.retailPrice;
    
    console.log('[STOCKX API] SKU:', productSKU, '| Price:', price);
    
    return price ? Number(price) : null;
  } catch (error) {
    console.error("[STOCKX API] Error fetching price for SKU", productSKU, ":", error);
    return null;
  }
}
