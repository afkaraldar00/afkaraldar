export interface ProductSchemaOptions {
  name: string;
  description: string;
  image: string[];
  price: string | number;
  sku?: string;
  currency?: string;
  ratingValue?: string | number;
  reviewCount?: string | number;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function generateProductSchema(options: ProductSchemaOptions) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://afkaraldar.ae";
  const currency = options.currency || "AED";

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": options.name,
    "image": options.image.map((img) => (img.startsWith("http") ? img : `${baseUrl}${img}`)),
    "description": options.description,
    "sku": options.sku || "AFKAR-BOX-GENERIC",
    "brand": {
      "@type": "Brand",
      "name": "Afkar Al Dar",
    },
    "offers": {
      "@type": "Offer",
      "url": options.url.startsWith("http") ? options.url : `${baseUrl}${options.url}`,
      "priceCurrency": currency,
      "price": options.price.toString(),
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Afkar Al Dar",
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": currency,
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "AE",
          "addressRegion": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Al Ain", "Ras Al Khaimah"],
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY",
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY",
          },
        },
      },
    },
    "aggregateRating": options.ratingValue
      ? {
          "@type": "AggregateRating",
          "ratingValue": options.ratingValue.toString(),
          "reviewCount": (options.reviewCount || 45).toString(),
        }
      : undefined,
  };
}

export function generateLocalBusinessSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://afkaraldar.ae";

  return {
    "@context": "https://schema.org",
    "@type": "GiftShop",
    "name": "Afkar Al Dar Custom Gift Boxes",
    "image": `${baseUrl}/hero%20mobile%20bg.png`,
    "@id": `${baseUrl}/#organization`,
    "url": baseUrl,
    "telephone": "+971500000000",
    "priceRange": "AED 250 - AED 2500",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Al Quoz Industrial Area 3",
      "addressLocality": "Dubai",
      "addressRegion": "Dubai",
      "postalCode": "00000",
      "addressCountry": "AE",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 25.1324,
      "longitude": 55.2312,
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      "opens": "08:00",
      "closes": "22:00",
    },
    "areaServed": [
      { "@type": "City", "name": "Dubai" },
      { "@type": "City", "name": "Abu Dhabi" },
      { "@type": "City", "name": "Sharjah" },
      { "@type": "City", "name": "Ajman" },
      { "@type": "City", "name": "Al Ain" },
      { "@type": "City", "name": "Ras Al Khaimah" },
    ],
    "sameAs": [
      "https://www.instagram.com/afkaraldar",
      "https://www.facebook.com/afkaraldar",
    ],
  };
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://afkaraldar.ae";

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item.startsWith("http") ? item.item : `${baseUrl}${item.item}`,
    })),
  };
}

export interface HowToStepItem {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

export function generateHowToSchema(title: string, description: string, steps: HowToStepItem[]) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://afkaraldar.ae";

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      "url": step.url ? (step.url.startsWith("http") ? step.url : `${baseUrl}${step.url}`) : `${baseUrl}/how-it-works#step-${index + 1}`,
      "image": step.image ? (step.image.startsWith("http") ? step.image : `${baseUrl}${step.image}`) : undefined,
    })),
  };
}

export function generateAboutPageSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://afkaraldar.ae";

  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "Afkar Al Dar",
      "url": baseUrl,
      "logo": `${baseUrl}/logo.png`,
      "description": "Afkar Al Dar blends Gulf heritage with warm editorial luxury to curate bespoke keepsake gift boxes in Dubai and across the UAE.",
      "knowsAbout": [
        "Bespoke Gifting",
        "Gulf Hospitality & Etiquette",
        "Luxury Packaging Design",
        "Corporate Appreciation Gestures"
      ],
      "sameAs": [
        "https://www.instagram.com/afkaraldar",
        "https://www.facebook.com/afkaraldar"
      ]
    }
  };
}

