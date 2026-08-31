import { Metadata } from "next";

export interface GeneratePageMetadataOptions {
  title: string;
  description: string;
  path: string;
  lang: "en" | "ar";
  keywords?: string[];
  image?: string;
}

export function generatePageMetadata({
  title,
  description,
  path,
  lang,
  keywords = [],
  image = "/hero%20mobile%20bg.png",
}: GeneratePageMetadataOptions): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://afkaraldar.ae";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  // Ensure path starts with lang
  const relativePath = cleanPath.replace(/^\/(en|ar)/, "");
  const enUrl = `${baseUrl}/en${relativePath}`;
  const arUrl = `${baseUrl}/ar${relativePath}`;
  const currentUrl = `${baseUrl}/${lang}${relativePath}`;

  const defaultKeywords = [
    "custom gift boxes Dubai",
    "luxury gift box UAE",
    "corporate gifts Dubai",
    "same day gift delivery Dubai",
    "هدايا دبي",
    "توزيعات فخمة",
    "Afkar Al Dar",
  ];

  const hasBrand = title.includes("Afkar Al Dar") || title.includes("أفكار الدار");
  const finalTitle = hasBrand ? title : `${title} | ${lang === "ar" ? "أفكار الدار" : "Afkar Al Dar"}`;

  return {
    title: finalTitle,
    description,
    keywords: [...keywords, ...defaultKeywords],
    alternates: {
      canonical: currentUrl,
      languages: {
        "en-ae": enUrl,
        "ar-ae": arUrl,
        "x-default": enUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: "Afkar Al Dar",
      images: [
        {
          url: image.startsWith("http") ? image : `${baseUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: lang === "ar" ? "ar_AE" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.startsWith("http") ? image : `${baseUrl}${image}`],
    },
    verification: {
      google: "sZ4rp7cW5XfW5jFENRBM-zfuZsV1boaj6YtH_Xpna2s",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
