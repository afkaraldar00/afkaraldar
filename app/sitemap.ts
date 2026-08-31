import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://afkaraldar.ae";
  const lastModified = new Date();

  const occasionSlugs = [
    "birthday",
    "wedding",
    "graduation",
    "new-baby",
    "corporate",
    "eid",
  ];

  const locationSlugs = [
    "same-day-gift-delivery-dubai",
    "gift-box-delivery-abu-dhabi",
    "luxury-gifts-sharjah",
  ];

  const productSlugs = [
    "the-royal-velvet-celebration-box",
    "birthday-signature-box",
    "milestone-birthday-grand-edition",
    "khaleeji-milkah-royal-hamper",
    "graduate-executive-keepsake-box",
    "newborn-heirloom-keepsake-chest",
    "vip-executive-appreciation-box",
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Homepage
  sitemapEntries.push({
    url: baseUrl,
    lastModified,
    changeFrequency: "daily",
    priority: 1.0,
  });

  // Core Pillars
  sitemapEntries.push(
    {
      url: `${baseUrl}/occasions`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    }
  );

  // Occasion Pages
  occasionSlugs.forEach((slug) => {
    sitemapEntries.push({
      url: `${baseUrl}/occasions/${slug}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  // Location Pages (Hyper-Local UAE)
  locationSlugs.forEach((slug) => {
    sitemapEntries.push({
      url: `${baseUrl}/locations/${slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  });

  // Product Showcase Pages
  productSlugs.forEach((slug) => {
    sitemapEntries.push({
      url: `${baseUrl}/box/${slug}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  return sitemapEntries;
}
