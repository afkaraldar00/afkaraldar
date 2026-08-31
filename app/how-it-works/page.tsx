import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateHowToSchema, generateBreadcrumbSchema } from "@/lib/seo/schema";
import Link from "next/link";
import { Sparkles, ArrowRight, MessageCircle, Gift, Pencil, Truck, ShieldCheck } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";
import WhatsAppCTA from "@/components/analytics/WhatsAppCTA";

export const metadata = generatePageMetadata({
  title: "How Custom Gift Box Design Works | Afkar Al Dar Dubai",
  description: "Learn how we design bespoke gift boxes in Dubai. Choose your occasion, select items, and finalize via WhatsApp. Start your custom request today.",
  path: "/how-it-works",
  lang: "en",
  keywords: [
    "custom gift box design Dubai",
    "personalised gift box process UAE",
    "order custom hampers Dubai WhatsApp",
    "طريقة تصميم صندوق هدايا دبي"
  ]
});

export default function HowItWorksPage() {
  const steps = [
    {
      name: "Step 1: Share Your Vision or Select an Occasion Base",
      text: "Select a signature box concept from our online catalog or start with a completely blank canvas, providing your preferred color theme, budget, and recipient notes.",
      url: "/how-it-works#step-1",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop"
    },
    {
      name: "Step 2: Instant WhatsApp Design Consultation & Mood Board",
      text: "Converse directly with a senior design curator on WhatsApp. Receive real-time photos of ribbon options, custom typography proofs, and itemized quote options.",
      url: "/how-it-works#step-2",
      image: "https://images.unsplash.com/photo-1513885535751-8b9238bd48d7?q=80&w=1000&auto=format&fit=crop"
    },
    {
      name: "Step 3: Artisan Curation & Hand-Assembled Presentation",
      text: "Every item is hand-inspected in our studio. We apply gold hot-stamping for monograms, hand-tie satin ribbons, and insert handwritten-style calligraphic cards.",
      url: "/how-it-works#step-3",
      image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=1000&auto=format&fit=crop"
    },
    {
      name: "Step 4: Express Hand-Delivery Across Dubai & the UAE",
      text: "Your finished gift box is placed into a protective velvet sleeve and hand-delivered via white-glove climate-controlled courier across Dubai and all Emirates.",
      url: "/how-it-works#step-4",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  const howToSchema = generateHowToSchema(
    "Your Vision, Handcrafted: How Our Custom Design Process Works",
    "Four simple steps to craft and hand-deliver bespoke luxury gift boxes across Dubai and the UAE.",
    steps
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "How It Works", item: "/how-it-works" }
  ]);

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E9DBC6]/60 text-xs font-semibold text-[#7D5121]">
          <Sparkles className="w-3.5 h-3.5 text-[#AD7D39]" />
          <span>Bespoke Design Experience</span>
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#191611]">
          Your Vision, Handcrafted: How Our Custom Process Works
        </h1>
        <p className="text-base text-[#625D55] leading-relaxed">
          From your first WhatsApp consultation to white-glove delivery in Dubai, we ensure every detail of your gift box reflects warm editorial luxury.
        </p>
      </div>

      {/* 4 Step Process Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Step 1 */}
        <div id="step-1" className="bg-white p-8 rounded-3xl border border-[#AD7D39]/20 shadow-sm space-y-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-full bg-[#191611] text-[#D4BA99] font-serif font-bold text-lg flex items-center justify-center">
              1
            </span>
            <Gift className="w-6 h-6 text-[#AD7D39]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#191611]">
            Step 1: Share Your Vision or Select an Occasion Base
          </h2>
          <p className="text-xs sm:text-sm text-[#625D55] leading-relaxed">
            Select a signature box concept from our online catalog or present a completely blank canvas. Share your occasion details, budget parameters, and recipient preferences with our curators.
          </p>
          <img
            src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop"
            alt="Step-by-step diagram of Afkar Al Dar bespoke gift box customization process"
            className="w-full h-44 object-cover rounded-xl border border-[#AD7D39]/10"
          />
        </div>

        {/* Step 2 */}
        <div id="step-2" className="bg-white p-8 rounded-3xl border border-[#AD7D39]/20 shadow-sm space-y-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-full bg-[#191611] text-[#D4BA99] font-serif font-bold text-lg flex items-center justify-center">
              2
            </span>
            <MessageCircle className="w-6 h-6 text-[#AD7D39]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#191611]">
            Step 2: Instant WhatsApp Design Consultation
          </h2>
          <p className="text-xs sm:text-sm text-[#625D55] leading-relaxed">
            Skip automated shopping carts. Engage in direct conversation on WhatsApp with a senior design curator who shares live product photography, typography options, and itemized estimates.
          </p>
          <img
            src="https://images.unsplash.com/photo-1513885535751-8b9238bd48d7?q=80&w=600&auto=format&fit=crop"
            alt="Design curator sharing custom box arrangement photos via WhatsApp on smartphone"
            className="w-full h-44 object-cover rounded-xl border border-[#AD7D39]/10"
          />
        </div>

        {/* Step 3 */}
        <div id="step-3" className="bg-white p-8 rounded-3xl border border-[#AD7D39]/20 shadow-sm space-y-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-full bg-[#191611] text-[#D4BA99] font-serif font-bold text-lg flex items-center justify-center">
              3
            </span>
            <Pencil className="w-6 h-6 text-[#AD7D39]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#191611]">
            Step 3: Artisan Curation & Hand-Assembly
          </h2>
          <p className="text-xs sm:text-sm text-[#625D55] leading-relaxed">
            Our studio artisans inspect every item, hot-stamp gold foil monograms onto rigid cream box lids, tie satin ribbons, and enclose handwritten-style calligraphic cards.
          </p>
          <img
            src="https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=600&auto=format&fit=crop"
            alt="Hand-assembled luxury box undergoing final ribbon tie and inspection in studio"
            className="w-full h-44 object-cover rounded-xl border border-[#AD7D39]/10"
          />
        </div>

        {/* Step 4 */}
        <div id="step-4" className="bg-white p-8 rounded-3xl border border-[#AD7D39]/20 shadow-sm space-y-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-full bg-[#191611] text-[#D4BA99] font-serif font-bold text-lg flex items-center justify-center">
              4
            </span>
            <Truck className="w-6 h-6 text-[#AD7D39]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#191611]">
            Step 4: Express Delivery Across Dubai & UAE
          </h2>
          <p className="text-xs sm:text-sm text-[#625D55] leading-relaxed">
            Your assembled gift box is encased in a protective sleeve and hand-delivered via climate-controlled courier across Dubai, Abu Dhabi, Sharjah, and all Northern Emirates.
          </p>
          <img
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop"
            alt="White-glove climate-controlled UAE gift box delivery"
            className="w-full h-44 object-cover rounded-xl border border-[#AD7D39]/10"
          />
        </div>

      </div>

      {/* Trust Banner & CTA */}
      <div className="bg-[#191611] text-white p-8 sm:p-12 rounded-3xl border border-[#AD7D39]/40 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Ready to Begin Your Custom Design?
          </h3>
          <p className="text-xs sm:text-sm text-[#D4BA99]">
            Connect with a curator now to review custom color palettes, ribbons, and item curations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <WhatsAppCTA
            productName="Custom Gift Curation Request"
            pageSlug="how-it-works"
            category="custom-design"
            ctaPosition="bottom_cta"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#1ebd59] transition-all shadow-lg"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Chat on WhatsApp Now</span>
          </WhatsAppCTA>

          <Link href="/request" className="w-full sm:w-auto">
            <TrackedButton
              button_location="bottom_cta"
              variant="gold"
              size="lg"
              className="w-full justify-center gap-2 text-xs uppercase tracking-wider font-bold"
            >
              <span>Submit Design Request</span>
              <ArrowRight className="w-4 h-4" />
            </TrackedButton>
          </Link>
        </div>
      </div>

      {/* Internal Links Footer */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#AD7D39] pt-4 border-t border-[#3C2D1E]/10">
        <Link href="/occasions/corporate" className="hover:underline">
          Learn about corporate bulk order workflow
        </Link>
        <span className="text-[#3C2D1E]/20">•</span>
        <Link href="/about" className="hover:underline">
          Read our brand story & craftsmanship philosophy
        </Link>
      </div>

    </div>
  );
}
