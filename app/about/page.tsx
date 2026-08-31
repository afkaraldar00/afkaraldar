import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateAboutPageSchema, generateBreadcrumbSchema } from "@/lib/seo/schema";
import Link from "next/link";
import { Sparkles, Heart, ShieldCheck, Award, ArrowRight } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";

export const metadata = generatePageMetadata({
  title: "About Afkar Al Dar | Luxury Custom Gift Studio Dubai",
  description: "Discover Afkar Al Dar. We blend Gulf heritage with warm editorial luxury to create bespoke keepsake gift boxes in Dubai. Request your design on WhatsApp.",
  path: "/about",
  lang: "en",
  keywords: [
    "luxury gift box studio Dubai",
    "custom gifting studio UAE",
    "premium bespoke hampers Dubai story",
    "استوديو هدايا فاخرة دبي",
    "قصة أفكار الدار للهدايا الإمارات"
  ]
});

export default function AboutPage() {
  const aboutSchema = generateAboutPageSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "About Us", item: "/about" }
  ]);

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9DBC6]/60 text-xs font-semibold text-[#7D5121]">
          <Sparkles className="w-3.5 h-3.5 text-[#AD7D39]" />
          <span>Our Heritage & Craftsmanship</span>
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#191611]">
          Crafting Personal Stories Through Warm Editorial Luxury
        </h1>
        <p className="text-base text-[#625D55] leading-relaxed">
          Founded in Dubai, Afkar Al Dar was born from a passion to elevate gift-giving from a transactional chore into an unforgettable sensory ritual.
        </p>
      </div>

      {/* Main Brand Narrative Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#191611] shadow-xl border border-[#AD7D39]/30">
          <img
            src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop"
            alt="Afkar Al Dar design studio table displaying cream linen box materials, gold foil ribbons, and mood boards"
            className="object-cover w-full h-full"
          />
        </div>

        <div className="space-y-6 text-[#292725]">
          <h2 className="font-serif text-3xl font-bold text-[#191611]">
            Our Philosophy: Moving Gifting Beyond Mass Production
          </h2>
          <p className="text-sm leading-relaxed text-[#625D55]">
            We believe true luxury lies in thoughtfulness. Every box is meticulously assembled by hand using heavy-board construction, plush velvet interiors, and gold hot-stamped monograms.
          </p>
          <p className="text-sm leading-relaxed text-[#625D55]">
            Instead of standard off-the-shelf items, our curators source rare treats, artisanal regional honeys, bespoke fragrances, and custom-engraved accessories across the Emirates.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-[#AD7D39]" />
              <span className="text-xs font-semibold text-[#191611]">Hand-stamped monogramming & custom ribbons</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#AD7D39]" />
              <span className="text-xs font-semibold text-[#191611]">White-glove climate-controlled UAE delivery</span>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-[#AD7D39]" />
              <span className="text-xs font-semibold text-[#191611]">100% personalized card & message stationery</span>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/customize/birthday">
              <TrackedButton
                button_location="hero"
                variant="gold"
                size="md"
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Begin Your Custom Order</span>
              </TrackedButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Additional H2 Brand Pillars (Phase 13 Blueprint) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-[#FBF8F3] p-8 sm:p-12 rounded-3xl border border-[#AD7D39]/20">
        
        <div className="space-y-3">
          <h3 className="font-serif text-xl font-bold text-[#191611]">
            Warm Editorial Aesthetic
          </h3>
          <p className="text-xs text-[#625D55] leading-relaxed">
            Our visual identity balances warm cream linen textures, deep matte black contrasts, and refined gold accents paired with Cormorant Garamond calligraphy.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-serif text-xl font-bold text-[#191611]">
            Artisan GCC Sourcing
          </h3>
          <p className="text-xs text-[#625D55] leading-relaxed">
            We collaborate with local Emirati chocolatiers, regional niche perfumers, and international luxury artisans to ensure box contents remain exclusive.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-serif text-xl font-bold text-[#191611]">
            Personal Touch & White-Glove Care
          </h3>
          <p className="text-xs text-[#625D55] leading-relaxed">
            Every client communicates directly with dedicated design curators on WhatsApp, ensuring personal care from draft concept to final hand delivery.
          </p>
        </div>

      </div>

      {/* Internal Links Footer */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#AD7D39] pt-4 border-t border-[#3C2D1E]/10">
        <Link href="/how-it-works" className="inline-flex items-center gap-1 hover:underline">
          <span>Explore our custom curation process</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <span className="text-[#3C2D1E]/20">•</span>
        <Link href="/occasions/wedding" className="inline-flex items-center gap-1 hover:underline">
          <span>View signature wedding curation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
