import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateLocalBusinessSchema } from "@/lib/seo/schema";
import HomeClientContent from "@/components/home/HomeClientContent";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = generatePageMetadata({
  title: "Custom Luxury Gift Boxes Dubai | Afkar Al Dar",
  description: "Design luxury bespoke gift boxes in Dubai. Crafted for GCC celebrations & corporate gestures. Request your custom gift curation via WhatsApp today.",
  path: "/",
  lang: "en",
  keywords: [
    "custom gift boxes Dubai",
    "bespoke gift hampers UAE",
    "personalised luxury gifting Dubai",
    "صناديق هدايا فخمة دبي",
    "توزيعات وهدايا فاخرة الإمارات"
  ]
});

export default function HomePage() {
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <>
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* Main Interactive UI */}
      <HomeClientContent />

      {/* Rich Editorial SEO Content Sections (Phase 13 Blueprint) */}
      <section className="bg-[#FBF8F3] py-16 border-t border-[#3C2D1E]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-[0.2em] text-[#AD7D39] font-bold">
              Warm Editorial Luxury Gifting in the UAE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#191611]">
              The Art of Personal Curation & Editorial Packaging
            </h2>
            <p className="text-sm text-[#625D55] leading-relaxed">
              At Afkar Al Dar, we treat gift-giving as an artistic conversation. Instead of mass-produced, off-the-shelf gift baskets wrapped in plastic, every box is designed from scratch in our Dubai studio—utilizing heavy-board cream keepsake chests, gold debossed monograms, and plush velvet linings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* H2 - 2 */}
            <div className="bg-white p-8 rounded-2xl border border-[#AD7D39]/20 shadow-sm space-y-3">
              <h3 className="font-serif text-xl font-bold text-[#191611]">
                Signature Collections for Gulf Occasions
              </h3>
              <p className="text-xs text-[#625D55] leading-relaxed">
                From prestigious Khaleeji Milkah engagement ceremonies and VIP milestone birthdays to hospital baby receptions and corporate Eid hampers, our curations honor regional hospitality and modern aesthetics.
              </p>
              <Link href="/occasions" className="inline-flex items-center gap-1 text-xs font-bold text-[#AD7D39] hover:underline pt-2">
                <span>Explore Occasion Collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* H2 - 3 */}
            <div className="bg-white p-8 rounded-2xl border border-[#AD7D39]/20 shadow-sm space-y-3">
              <h3 className="font-serif text-xl font-bold text-[#191611]">
                From Vision to Hand-Delivered Reality
              </h3>
              <p className="text-xs text-[#625D55] leading-relaxed">
                Our seamless WhatsApp customization process connects you directly with a senior design curator. Share your mood board, color preferences, or recipient notes to receive direct interactive previews prior to hand-assembly.
              </p>
              <Link href="/how-it-works" className="inline-flex items-center gap-1 text-xs font-bold text-[#AD7D39] hover:underline pt-2">
                <span>Understand Our Design Process</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* H2 - 4 */}
            <div className="bg-white p-8 rounded-2xl border border-[#AD7D39]/20 shadow-sm space-y-3">
              <h3 className="font-serif text-xl font-bold text-[#191611]">
                Private Client & Corporate Curation
              </h3>
              <p className="text-xs text-[#625D55] leading-relaxed">
                We cater to private clients and corporate procurers across DIFC, Business Bay, and Abu Dhabi. Enjoy white-glove climate-controlled delivery, custom logo debossing, and tailored invoicing without public pricing constraints.
              </p>
              <Link href="/occasions/corporate" className="inline-flex items-center gap-1 text-xs font-bold text-[#AD7D39] hover:underline pt-2">
                <span>Bespoke Corporate Solutions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </section>
    </>
  );
}
