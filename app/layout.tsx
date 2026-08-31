import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import StorefrontShell from "@/components/layout/StorefrontShell";
import GTMProvider from "@/components/analytics/GTMProvider";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Afkar Aldar | Bespoke Luxury Gift Boxes UAE",
  description: "Handcrafted, ultra-luxurious customized gift boxes tailored for weddings, birthdays, corporate gifting, and special moments across Dubai and the UAE.",
  keywords: ["gift boxes UAE", "customized gifts Dubai", "luxury gift box", "corporate gifts UAE", "bespoke gifting", "Afkar Aldar"],
  verification: {
    google: "sZ4rp7cW5XfW5jFENRBM-zfuZsV1boaj6YtH_Xpna2s",
  },
  openGraph: {
    title: "Afkar Aldar | Bespoke Luxury Gift Boxes",
    description: "Curated gift discovery & personalized luxury box experiences in Dubai & UAE.",
    type: "website",
    locale: "en_US",
    siteName: "Afkar Aldar",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable} h-full scroll-smooth`}>
      <head>
        <meta name="google-site-verification" content="sZ4rp7cW5XfW5jFENRBM-zfuZsV1boaj6YtH_Xpna2s" />
        <GTMProvider />
      </head>
      <body className="min-h-full flex flex-col bg-[#FBF8F3] text-[#292725] font-sans antialiased selection:bg-[#AD7D39] selection:text-white">
        <StorefrontShell>{children}</StorefrontShell>
      </body>
    </html>
  );
}
