import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Truck, Clock, ShieldCheck, HelpCircle, MessageCircle, Sparkles } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo/schema";
import TrackedButton from "@/components/ui/TrackedButton";
import WhatsAppCTA from "@/components/analytics/WhatsAppCTA";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const locationDataMap: Record<
  string,
  {
    emirate: string;
    title: string;
    metaTitle: string;
    metaDesc: string;
    h1: string;
    intro: string;
    neighborhoods: string[];
    deliveryProtocol: string;
    h2s: { title: string; content: string }[];
    faqs: { question: string; answer: string }[];
  }
> = {
  "same-day-gift-delivery-dubai": {
    emirate: "Dubai",
    title: "Same-Day Gift Box Delivery Dubai",
    metaTitle: "Same Day Gift Box Delivery Dubai | Afkar Al Dar",
    metaDesc: "Express luxury custom gift box delivery across Dubai. Servicing Downtown, Marina, Business Bay & DIFC. Request your bespoke design on WhatsApp today.",
    h1: "Express Same-Day Luxury Gift Box Delivery in Dubai",
    intro: "Whether you need an urgent milestone birthday hamper in Downtown Dubai or a bespoke corporate appreciation box delivered to DIFC, our climate-controlled couriers ensure pristine hand-delivery across all Dubai neighborhoods.",
    neighborhoods: [
      "Downtown Dubai & Business Bay",
      "DIFC & World Trade Centre",
      "Dubai Marina & JBR",
      "Palm Jumeirah & Dubai Hills",
      "Jumeirah, Umm Suqeim & Al Wasl",
      "Mirdif, Dubai Silicon Oasis & Arabian Ranches"
    ],
    deliveryProtocol: "Orders confirmed on WhatsApp before 4:00 PM are eligible for express same-day hand-delivery across Dubai.",
    h2s: [
      {
        title: "Climate-Controlled Delivery for Delicate UAE Luxuries",
        content: "Every gift box containing fine chocolates, niche fragrances, or floral accents is transported in temperature-regulated courier vehicles to protect presentation aesthetics against Dubai's summer heat."
      },
      {
        title: "Discreet White-Glove Handover for VIP Recipients",
        content: "Our couriers deliver with white-glove decorum—presenting your cream keepsake box enclosed in a protective velvet sleeve, complete with personalized calligraphy greeting cards."
      },
      {
        title: "Real-Time WhatsApp Delivery Tracking & Proof",
        content: "Stay informed at every step. Receive immediate WhatsApp notifications and photo confirmations upon successful hand-delivery to your recipient."
      }
    ],
    faqs: [
      {
        question: "What is the cutoff time for same-day gift box delivery in Dubai?",
        answer: "Orders finalized and confirmed on WhatsApp before 4:00 PM qualify for express same-day evening delivery across Dubai."
      },
      {
        question: "Can I schedule a specific delivery time for a birthday surprise?",
        answer: "Yes, you can request dedicated 2-hour delivery windows (e.g., 6:00 PM - 8:00 PM) during your WhatsApp design consultation."
      }
    ]
  },
  "gift-box-delivery-abu-dhabi": {
    emirate: "Abu Dhabi",
    title: "Bespoke Gift Box Delivery Abu Dhabi",
    metaTitle: "Luxury Gift Box Delivery Abu Dhabi | Afkar Al Dar",
    metaDesc: "Bespoke custom gift box delivery in Abu Dhabi. Servicing Saadiyat Island, Al Reem & Yas Island. Request your luxury gift curation via WhatsApp.",
    h1: "Premium Luxury Gift Box Delivery Across Abu Dhabi",
    intro: "Elevate your gestures in the UAE capital. We craft and deliver bespoke gift hampers tailored for royal-standard celebrations, VIP corporate meetings, and family milestones in Abu Dhabi.",
    neighborhoods: [
      "Saadiyat Island & Al Maryah Island",
      "Al Reem Island & Cultural District",
      "Yas Island & Raha Beach",
      "Al Bateen & Al Mushrif",
      "Khalifa City & Mohammed Bin Zayed City"
    ],
    deliveryProtocol: "Direct express courier transit from our Dubai studio to Abu Dhabi within 24 hours.",
    h2s: [
      {
        title: "Curated for Prestigious Capital Occasions",
        content: "Designed for Abu Dhabi’s discerning clientele. We combine fine Bukhoor burners, artisanal date selections, niche perfumery, and custom gold-embossed greeting envelopes."
      },
      {
        title: "Corporate VIP Gifting for ADGM & Capital Institutions",
        content: "Providing custom debossed corporate boxes for board meetings, embassy appreciation, and executive summits across Al Maryah Island and ADGM."
      }
    ],
    faqs: [
      {
        question: "How long does delivery take to Abu Dhabi?",
        answer: "Standard delivery to Abu Dhabi takes 24 hours from WhatsApp order confirmation. Next-day morning delivery is available."
      }
    ]
  },
  "luxury-gifts-sharjah": {
    emirate: "Sharjah",
    title: "Luxury Custom Gifts Sharjah",
    metaTitle: "Custom Luxury Gift Box Delivery Sharjah | Afkar Al Dar",
    metaDesc: "Bespoke gift box delivery across Sharjah & Northern Emirates. Custom heritage boxes for Eid, weddings & milestones. Chat on WhatsApp to order.",
    h1: "Custom Bespoke Gift Box Delivery in Sharjah",
    intro: "Honor family traditions and special moments with handcrafted cream keepsake boxes delivered across Sharjah, Ajman, and the Northern Emirates.",
    neighborhoods: [
      "Al Majaz & Buhaira Corniche",
      "Al Zahia & University City Sharjah",
      "Al Rahmaniya & Muwaileh",
      "Ajman Corniche & Al Zorah"
    ],
    deliveryProtocol: "Daily white-glove courier dispatch to Sharjah and Ajman.",
    h2s: [
      {
        title: "Traditional Heritage Elegance with Modern Finish",
        content: "Our custom curations honor Sharjah's rich cultural heritage—featuring gold Islamic geometric accents, premium dates, fine Oud, and calligraphic art."
      }
    ],
    faqs: [
      {
        question: "Do you deliver to Ajman and University City Sharjah?",
        answer: "Yes, we provide daily courier delivery services covering all residential and academic areas across Sharjah and Ajman."
      }
    ]
  }
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = locationDataMap[slug] || {
    metaTitle: "Custom Gift Delivery UAE | Afkar Al Dar",
    metaDesc: "Express luxury custom gift box delivery across Dubai, Abu Dhabi, and the UAE.",
  };

  return generatePageMetadata({
    title: data.metaTitle,
    description: data.metaDesc,
    path: `/locations/${slug}`,
    lang: "en",
  });
}

export default async function LocationDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const data = locationDataMap[slug] || {
    emirate: "UAE",
    title: "Bespoke Gift Delivery UAE",
    metaTitle: "Custom Gift Delivery UAE | Afkar Al Dar",
    metaDesc: "Express luxury custom gift box delivery across Dubai, Abu Dhabi, and the UAE.",
    h1: "Express Custom Gift Box Delivery Across the UAE",
    intro: "Handcrafted luxury keepsake gift boxes curated and delivered across all seven Emirates.",
    neighborhoods: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Al Ain", "Ras Al Khaimah"],
    deliveryProtocol: "White-glove climate-controlled courier service.",
    h2s: [
      {
        title: "Bespoke UAE Luxury Curation",
        content: "Every box is designed to order with custom monograms, ribbons, and hand-selected items."
      }
    ],
    faqs: [
      {
        question: "How do I order a custom box?",
        answer: "Simply tap the WhatsApp button to consult directly with our design team."
      }
    ]
  };

  const localBusinessSchema = generateLocalBusinessSchema();
  const faqSchema = generateFAQSchema(data.faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Locations", item: "/locations" },
    { name: data.title, item: `/locations/${slug}` }
  ]);

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero Header */}
      <div className="bg-[#191611] text-white p-8 sm:p-14 rounded-3xl border-2 border-[#AD7D39]/40 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#AD7D39]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-3 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#AD7D39]/20 text-xs font-semibold text-[#D4BA99] border border-[#AD7D39]/30">
            <MapPin className="w-3.5 h-3.5 text-[#AD7D39]" />
            <span>Hyper-Local UAE Coverage — {data.emirate}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
            {data.h1}
          </h1>

          <p className="text-sm sm:text-base text-[#D4BA99] leading-relaxed">
            {data.intro}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 relative z-10">
          <WhatsAppCTA
            productName={`Delivery Request - ${data.title}`}
            pageSlug={`location-${slug}`}
            category="location-delivery"
            ctaPosition="hero"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#1ebd59] transition-all shadow-lg cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Order Delivery via WhatsApp</span>
          </WhatsAppCTA>

          <Link href="/occasions" className="w-full sm:w-auto">
            <TrackedButton
              button_location="hero"
              variant="outline"
              size="lg"
              className="w-full justify-center gap-2 text-xs uppercase tracking-wider font-bold border-[#AD7D39] text-[#D4BA99]"
            >
              <span>Explore Gift Collections</span>
              <ArrowRight className="w-4 h-4" />
            </TrackedButton>
          </Link>
        </div>
      </div>

      {/* Neighborhoods Serviced Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#AD7D39]" />
          <h2 className="font-serif text-2xl font-bold text-[#191611]">
            Neighborhoods & Areas Serviced in {data.emirate}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.neighborhoods.map((zone, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-[#AD7D39]/20 flex items-center gap-3 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#AD7D39] shrink-0" />
              <span className="text-xs font-bold text-[#191611]">{zone}</span>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-[#F6F0E7] border border-[#AD7D39]/25 flex items-center gap-3 text-xs text-[#625D55]">
          <Clock className="w-4 h-4 text-[#AD7D39] shrink-0" />
          <span><strong>Delivery Protocol:</strong> {data.deliveryProtocol}</span>
        </div>
      </div>

      {/* Editorial Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-[#FBF8F3] p-8 sm:p-12 rounded-3xl border border-[#AD7D39]/20">
        {data.h2s.map((h2, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-[#AD7D39]/15 shadow-sm space-y-2">
            <h3 className="font-serif text-lg font-bold text-[#191611]">{h2.title}</h3>
            <p className="text-xs text-[#625D55] leading-relaxed">{h2.content}</p>
          </div>
        ))}
      </div>

      {/* Local FAQs */}
      <div className="space-y-6 bg-white p-8 rounded-3xl border border-[#3C2D1E]/10">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#AD7D39]" />
          <h2 className="font-serif text-2xl font-bold text-[#191611]">
            Delivery Questions for {data.emirate}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.faqs.map((faq, idx) => (
            <div key={idx} className="space-y-1.5 bg-[#FBF8F3] p-5 rounded-xl border border-[#3C2D1E]/10">
              <h3 className="text-sm font-bold text-[#191611]">{faq.question}</h3>
              <p className="text-xs text-[#625D55] leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Links Footer */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#AD7D39] pt-4 border-t border-[#3C2D1E]/10">
        <Link href="/how-it-works" className="hover:underline">
          Learn how custom design and delivery work
        </Link>
        <span className="text-[#3C2D1E]/20">•</span>
        <Link href="/occasions/birthday" className="hover:underline">
          Explore luxury birthday gift delivery
        </Link>
        <span className="text-[#3C2D1E]/20">•</span>
        <Link href="/occasions/wedding" className="hover:underline">
          Explore Khaleeji wedding & engagement hampers
        </Link>
      </div>
    </div>
  );
}
