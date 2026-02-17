import { PrismaClient, ListingStatus, InventoryMode, PricingMode } from "@prisma/client";

const prisma = new PrismaClient();

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop";

async function main() {
  // Create sample active listings so the storefront has something to show
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        title: "Nike Dunk Low Retro",
        brand: "Nike",
        category: "Sneakers",
        status: ListingStatus.ACTIVE,
        moq: 6,
        flatPricePerPair: 85,
        basePricePerPair: 90,
        stockXPrice: 120,
        inventoryMode: InventoryMode.SIZE_RUN,
        pricingMode: PricingMode.FLAT,
        instantBuy: true,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, sortOrder: 0 },
          ],
        },
        sizes: {
          create: [
            { sizeLabel: "8", quantity: 10, soldOut: false },
            { sizeLabel: "9", quantity: 12, soldOut: false },
            { sizeLabel: "10", quantity: 15, soldOut: false },
            { sizeLabel: "11", quantity: 8, soldOut: false },
          ],
        },
      },
    }),
    prisma.listing.create({
      data: {
        title: "Jordan 1 Retro High",
        brand: "Jordan",
        category: "Sneakers",
        status: ListingStatus.ACTIVE,
        moq: 6,
        flatPricePerPair: 110,
        basePricePerPair: 115,
        stockXPrice: 145,
        inventoryMode: InventoryMode.SIZE_RUN,
        pricingMode: PricingMode.FLAT,
        instantBuy: false,
        images: {
          create: [
            { url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop", sortOrder: 0 },
          ],
        },
        sizes: {
          create: [
            { sizeLabel: "9", quantity: 6, soldOut: false },
            { sizeLabel: "10", quantity: 8, soldOut: false },
            { sizeLabel: "11", quantity: 6, soldOut: false },
          ],
        },
      },
    }),
    prisma.listing.create({
      data: {
        title: "Yeezy Slide",
        brand: "Adidas",
        category: "Slides & Mules",
        status: ListingStatus.ACTIVE,
        moq: 12,
        flatPricePerPair: 35,
        basePricePerPair: 38,
        stockXPrice: 55,
        inventoryMode: InventoryMode.SIZE_RUN,
        pricingMode: PricingMode.FLAT,
        instantBuy: true,
        images: {
          create: [
            { url: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop", sortOrder: 0 },
          ],
        },
        sizes: {
          create: [
            { sizeLabel: "S", quantity: 20, soldOut: false },
            { sizeLabel: "M", quantity: 25, soldOut: false },
            { sizeLabel: "L", quantity: 20, soldOut: false },
          ],
        },
      },
    }),
    prisma.listing.create({
      data: {
        title: "New Balance 550",
        brand: "New Balance",
        category: "Casuals",
        status: ListingStatus.ACTIVE,
        moq: 6,
        flatPricePerPair: 72,
        basePricePerPair: 75,
        stockXPrice: 95,
        inventoryMode: InventoryMode.SIZE_RUN,
        pricingMode: PricingMode.FLAT,
        instantBuy: true,
        images: {
          create: [
            { url: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=400&fit=crop", sortOrder: 0 },
          ],
        },
        sizes: {
          create: [
            { sizeLabel: "8", quantity: 8, soldOut: false },
            { sizeLabel: "9", quantity: 10, soldOut: false },
            { sizeLabel: "10", quantity: 12, soldOut: false },
          ],
        },
      },
    }),
  ]);

  console.log(`Seeded ${listings.length} sample listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
