/**
 * Fetches StockX price from RapidAPI for a given product SKU
 * Returns the price or null if not found
 */
export async function fetchStockXPrice(productSKU: string): Promise<number | null> {
  if (!productSKU) return null;
  
  try {
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST!,
      },
    };

    const response = await fetch(
      `https://${process.env.RAPIDAPI_HOST}/productprice?styleId=${encodeURIComponent(productSKU)}`,
      options
    );

    if (!response.ok) {
      console.error(`RapidAPI request failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log('RapidAPI response for SKU', productSKU, ':', JSON.stringify(data, null, 2));
    
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
    
    console.log('Extracted price for SKU', productSKU, ':', price);
    
    return price ? Number(price) : null;
  } catch (error) {
    console.error("StockX price fetch error for SKU", productSKU, ":", error);
    return null;
  }
}
