import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo/schema";
import SingleBoxClientContent from "@/components/box/SingleBoxClientContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const formattedTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return generatePageMetadata({
    title: `${formattedTitle} | Royal Velvet Celebration Box Dubai | Afkar Al Dar`,
    description: `Discover ${formattedTitle}. Deep velvet lining, gold accents & custom contents for UAE milestone moments. Request your design on WhatsApp.`,
    path: `/box/${slug}`,
    lang: "en",
  });
}

export default async function SingleBoxDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const formatTitle = (slug: string) => {
    return slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const boxName = formatTitle(slug);

  const includedItems = [
    "Handcrafted rigid keepsake box with gold foil lettering",
    "Choice of double-faced satin ribbon or velvet tie",
    "Personalized heavy-cardstock greeting envelope & message",
    "Artisanal Swiss pralines & luxury roasted nuts selection",
    "Subtle ambient scented botanical pouch (Oud / Rose)",
    "Protective velvet sleeve and white-glove UAE delivery box",
  ];

  const productSchema = generateProductSchema({
    name: boxName,
    description: `Discover ${boxName}. Deep velvet lining, gold accents & custom contents for UAE milestone moments. Request your design on WhatsApp.`,
    image: ["/hero%20mobile%20bg.png"],
    price: 350,
    sku: `AFKAR-${slug.toUpperCase()}`,
    url: `/box/${slug}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Collections", item: "/occasions" },
    { name: boxName, item: `/box/${slug}` },
  ]);

  return (
    <div className="py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Main Interactive Product UI */}
      <SingleBoxClientContent slug={slug} boxName={boxName} includedItems={includedItems} />

      {/* Rich Product H2 Editorial Copy Sections (Phase 13 Blueprint) */}
      <section className="bg-[#FBF8F3] p-8 sm:p-12 rounded-3xl border border-[#AD7D39]/20 space-y-10">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs uppercase tracking-widest text-[#AD7D39] font-bold">Product Craftsmanship & Specifications</span>
          <h2 className="font-serif text-3xl font-bold text-[#191611]">
            {boxName} — Custom Designed for Your Moment
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-[#AD7D39]/15 shadow-sm space-y-2">
            <h3 className="font-serif text-base font-bold text-[#191611]">
              Deep Velvet & Rigid Keepsake Structure
            </h3>
            <p className="text-xs text-[#625D55] leading-relaxed">
              Crafted with heavy-duty rigid keepsake construction wrapped in plush midnight velvet or warm cream, closed with a weighted brass clasp for double duty as a memory chest.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#AD7D39]/15 shadow-sm space-y-2">
            <h3 className="font-serif text-base font-bold text-[#191611]">
              Tailored Interior Curation Options
            </h3>
            <p className="text-xs text-[#625D55] leading-relaxed">
              Select modular placement options—from niche eau de parfum bottles and hand-blown candle vessels to single-origin chocolates and personalized calligraphic notes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#AD7D39]/15 shadow-sm space-y-2">
            <h3 className="font-serif text-base font-bold text-[#191611]">
              Monogramming & Gold Foil Details
            </h3>
            <p className="text-xs text-[#625D55] leading-relaxed">
              Every box features metallic gold hot-stamping for recipient initials or corporate logos, paired with double-faced satin ribbon weaving.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#AD7D39]/15 shadow-sm space-y-2">
            <h3 className="font-serif text-base font-bold text-[#191611]">
              Instant WhatsApp Design Consultation
            </h3>
            <p className="text-xs text-[#625D55] leading-relaxed">
              Because pricing varies based on interior item selection, you receive interactive mood boards and itemized estimates directly from our senior curators.
            </p>
          </div>

        </div>

        {/* Internal Linking */}
        <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#AD7D39] border-t border-[#3C2D1E]/10">
          <Link href="/occasions/wedding" className="inline-flex items-center gap-1 hover:underline">
            <span>Ideal for Engagement & Milkah Gifts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-[#3C2D1E]/20">|</span>
          <Link href="/how-it-works" className="inline-flex items-center gap-1 hover:underline">
            <span>See how item selection & customization works</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
