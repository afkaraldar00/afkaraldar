import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo/schema";
import OccasionClientContent from "@/components/occasions/OccasionClientContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const occasionDataMap: Record<
  string,
  {
    title: string;
    metaTitle: string;
    metaDesc: string;
    h1: string;
    h2s: { title: string; content: string }[];
    faqs: { question: string; answer: string }[];
    boxes: { slug: string; name: string; desc: string; image: string; altText: string }[];
  }
> = {
  birthday: {
    title: "Birthday Celebrations",
    metaTitle: "Luxury Birthday Gift Boxes Dubai | Afkar Al Dar",
    metaDesc: "Curate bespoke luxury birthday gift boxes in Dubai. Tailored color themes, artisan keepsakes & personal notes. Request your custom design on WhatsApp.",
    h1: "Bespoke Birthday Box Curation Tailored to Their Personality",
    h2s: [
      {
        title: "Beyond Standard Gifts: Personalized Editorial Birthday Boxes",
        content: "Position your gift as a deeply personal statement that replaces generic off-the-shelf options with warm cream keepsake boxes, hand-stamped gold foil monograms, and carefully curated artisanal items."
      },
      {
        title: "Curated Keepsakes for Milestone Celebrations",
        content: "Mark milestone birth anniversaries (30th, 40th, 50th) with VIP sophistication. We pair regional niche fragrances with hand-crafted chocolates, leather journals, and personalized calligraphic greeting cards."
      },
      {
        title: "How We Tailor Your Birthday Design via WhatsApp",
        content: "Customize your gift box in minutes over direct WhatsApp chat. Share recipient preferences, color schemes, or specific luxury items to receive interactive mood boards and real-time design previews."
      }
    ],
    faqs: [
      {
        question: "Can I customize the contents of a birthday gift box?",
        answer: "Yes, every box is curated to order. You can select specific luxury treats, niche fragrances, ribbon colors, and custom monograms directly via WhatsApp."
      },
      {
        question: "Do you offer delivery across Dubai and the UAE?",
        answer: "We offer white-glove climate-controlled delivery across Dubai, Abu Dhabi, Sharjah, and all Northern Emirates."
      }
    ],
    boxes: [
      {
        slug: "birthday-signature-box",
        name: "Birthday Signature Box",
        desc: "Curated luxury items, personalized greeting card, gold monogramming, and silk ribbon finish.",
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop",
        altText: "Personalized luxury birthday gift box with gold foil lettering and velvet lining"
      },
      {
        slug: "birthday-grand-edition",
        name: "Milestone Birthday Grand Edition",
        desc: "Expansive luxury box with velvet interior, artisanal delicacies, custom candle, and keepsake accessory.",
        image: "https://images.unsplash.com/photo-1513885535751-8b9238bd48d7?q=80&w=1000&auto=format&fit=crop",
        altText: "Curated milestone birthday gift set featuring niche perfume and silk ribbon details"
      }
    ]
  },
  wedding: {
    title: "Weddings & Engagements",
    metaTitle: "Luxury Wedding & Engagement Gifts Dubai | Afkar Al Dar",
    metaDesc: "Elevate wedding & engagement gifting in Dubai. Bespoke Khaleeji Milkah boxes & luxury bridal hampers. Request a custom design consultation on WhatsApp.",
    h1: "Elegant Keepsake Hampers for Engagements & Weddings",
    h2s: [
      {
        title: "Honoring Gulf Bridal Rituals with Warm Editorial Luxury",
        content: "Speak to the elevated expectations of Gulf wedding rituals. Our heavy-board cream chests and gold calligraphic lettering honor family generosity for Milkah, Shabka, and wedding celebrations."
      },
      {
        title: "Custom Milkah & Engagement Curation for Discriminating Hosts",
        content: "We curate elements tailored for Khaleeji brides—hand-forged brass Bukhoor burners, organic Emirati dates, premium grade Oud, and silk-lined trays matched to bridal themes."
      },
      {
        title: "Bespoke Bridal Keepsake Boxes & Guest Favors (توزيعات)",
        content: "We provide showpiece presentation hampers for the couple alongside coordinated guest favor boxes (توزيعات) for high-end wedding receptions."
      }
    ],
    faqs: [
      {
        question: "Do you specialize in Khaleeji Milkah (هدايا ملكة) gift curation?",
        answer: "Yes, we craft bespoke luxury Milkah and engagement hampers featuring brass Bukhoor burners, fine Oud, custom calligraphy, and velvet presentation boxes."
      }
    ],
    boxes: [
      {
        slug: "wedding-milkah-signature",
        name: "Khaleeji Milkah Royal Hamper",
        desc: "Hand-forged brass incense burner, premium grade Oud, silk ribbon, and gold calligraphy card.",
        image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=1000&auto=format&fit=crop",
        altText: "Luxury Khaleeji Milkah engagement gift box with brass incense burner and velvet interior"
      }
    ]
  },
  graduation: {
    title: "Graduation & Milestones",
    metaTitle: "Luxury Graduation Gift Boxes Dubai | Afkar Al Dar",
    metaDesc: "Celebrate academic milestones with bespoke luxury graduation gift boxes in Dubai. Custom monograms & premium treats. WhatsApp us to request your design.",
    h1: "Mark Academic Achievements with Bespoke Gift Curation",
    h2s: [
      {
        title: "Celebrating Success with Refined Keepsake Packaging",
        content: "Transform academic rewards into mementos with debossed graduation years, school color ribbons, and hand-selected luxury accessories."
      },
      {
        title: "Customizable Options for High School & University Graduates",
        content: "Select executive leather journals and fine writing instruments for university graduates entering corporate careers, or tech accessories and chocolates for high school graduates."
      }
    ],
    faqs: [
      {
        question: "Can school or university colors be incorporated into the box design?",
        answer: "Absolutely. We match ribbons, card accents, and custom monograms to your graduate's school or university colors."
      }
    ],
    boxes: [
      {
        slug: "graduation-executive-edition",
        name: "Graduate Executive Keepsake Box",
        desc: "Debossed gold emblem planner, fine pen, artisan chocolates, and custom graduation sentiment card.",
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop",
        altText: "Luxury graduation gift box with debossed gold emblem and custom leather planner"
      }
    ]
  },
  "new-baby": {
    title: "New Baby & Parenthood",
    metaTitle: "Luxury New Baby Gift Boxes Dubai | Afkar Al Dar",
    metaDesc: "Welcome new arrivals with luxury bespoke baby gift boxes in Dubai. Premium organic keepsakes & custom themes. Request your design consultation on WhatsApp.",
    h1: "Cherished Luxury Gift Boxes for Newborns & Parents",
    h2s: [
      {
        title: "Tactile Luxury for Hospital Receptions & Baby Showers",
        content: "Our warm cream boxes serve as refined centerpieces for UAE hospital receptions and baby showers, substituting plastic toys with heirloom keepsake pieces."
      },
      {
        title: "Curating Gender-Neutral, Soft Pastels & Gold Accents",
        content: "Choose soft sage, powder rose, warm cream, and champagne gold palettes paired with organic cotton blankets, silver rattles, and certified baby skincare."
      }
    ],
    faqs: [
      {
        question: "Do you supply baby reception guest favors (توزيعات مواليد)?",
        answer: "Yes, we design matching guest favor boxes and hospital reception gift sets tailored to your chosen color theme and baby name monogram."
      }
    ],
    boxes: [
      {
        slug: "baby-heirloom-set",
        name: "Newborn Heirloom Keepsake Chest",
        desc: "Embroidered organic linen blanket, silver-plated rattle, luxury baby bath care, and gold monogrammed card.",
        image: "https://images.unsplash.com/photo-1513885535751-8b9238bd48d7?q=80&w=1000&auto=format&fit=crop",
        altText: "Cream and soft gold luxury baby gift box with embroidered linen blanket and silver rattle"
      }
    ]
  },
  corporate: {
    title: "Corporate Luxury Gifting",
    metaTitle: "Luxury Corporate Gift Boxes Dubai | Afkar Al Dar",
    metaDesc: "Elevate B2B relationships with bespoke luxury corporate gift boxes in Dubai. Custom logo debossing & VIP curation. Request your corporate quote on WhatsApp.",
    h1: "High-Touch Corporate Gifting Designed for UAE Leaders",
    h2s: [
      {
        title: "Reinforcing Business Relationships Through Warm Editorial Luxury",
        content: "Corporate gifting acts as brand diplomacy. Replacing standard promotional items with bespoke editorial boxes signals prestige to UAE business partners and executives."
      },
      {
        title: "Complete Brand Integration: Logos, Monograms & Custom Inserts",
        content: "We offer gold foil hot-stamping on rigid cream box lids, pantone-matched ribbons, and debossed executive leather stationery bearing company logos."
      }
    ],
    faqs: [
      {
        question: "Can we add our company logo to custom corporate gift boxes?",
        answer: "Yes, we provide gold foil logo hot-stamping, corporate branded ribbons, and tailored inserts for VIP client appreciation."
      }
    ],
    boxes: [
      {
        slug: "corporate-vip-edition",
        name: "VIP Executive Appreciation Box",
        desc: "Gold debossed company emblem, Italian leather notebook, premium dates, and bespoke corporate greeting card.",
        image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=1000&auto=format&fit=crop",
        altText: "Bespoke executive corporate gift box with gold debossed company logo and luxury stationery"
      }
    ]
  }
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = occasionDataMap[slug] || {
    metaTitle: "Bespoke Gift Box Collections | Afkar Al Dar",
    metaDesc: "Explore luxury bespoke gift box collections for all UAE occasions.",
  };

  return generatePageMetadata({
    title: data.metaTitle,
    description: data.metaDesc,
    path: `/occasions/${slug}`,
    lang: "en",
  });
}

export default async function SingleOccasionPage({ params }: PageProps) {
  const { slug } = await params;
  const data = occasionDataMap[slug] || {
    title: "Bespoke Collection",
    metaTitle: "Bespoke Gift Box Collections | Afkar Al Dar",
    metaDesc: "Explore luxury bespoke gift box collections for all UAE occasions.",
    h1: "Tailored Gift Collections for Special Moments",
    h2s: [
      {
        title: "Bespoke Gift Design Studio in Dubai",
        content: "Curated gift box concepts handcrafted for individual and corporate celebrations."
      }
    ],
    faqs: [
      {
        question: "How do I request a custom design?",
        answer: "Click the WhatsApp button on any box design to consult directly with a curator."
      }
    ],
    boxes: [
      {
        slug: `${slug}-signature-box`,
        name: `Bespoke Signature Box`,
        desc: "Curated luxury items, personalized greeting card, gold monogramming, and silk ribbon finish.",
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop",
        altText: "Afkar Al Dar bespoke luxury gift box"
      }
    ]
  };

  const faqSchema = generateFAQSchema(data.faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Occasions", item: "/occasions" },
    { name: data.title, item: `/occasions/${slug}` }
  ]);

  return (
    <div className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Main Interactive Box Grid */}
      <OccasionClientContent slug={slug} title={data.title} boxes={data.boxes} />

      {/* Rich Editorial H2 Copy Blocks */}
      <section className="bg-[#FBF8F3] p-8 sm:p-12 rounded-3xl border border-[#AD7D39]/20 space-y-10">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs uppercase tracking-widest text-[#AD7D39] font-bold">Editorial Curation</span>
          <h2 className="font-serif text-3xl font-bold text-[#191611]">{data.h1}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.h2s.map((h2, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-[#AD7D39]/15 shadow-sm space-y-2">
              <h3 className="font-serif text-lg font-bold text-[#191611]">{h2.title}</h3>
              <p className="text-xs text-[#625D55] leading-relaxed">{h2.content}</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="pt-6 border-t border-[#3C2D1E]/10 space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#AD7D39]" />
            <h3 className="font-serif text-xl font-bold text-[#191611]">Frequently Asked Questions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.faqs.map((faq, idx) => (
              <div key={idx} className="space-y-1.5 bg-white p-5 rounded-xl border border-[#3C2D1E]/10">
                <h4 className="text-sm font-bold text-[#191611]">{faq.question}</h4>
                <p className="text-xs text-[#625D55] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Internal Linking */}
        <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#AD7D39]">
          <Link href="/how-it-works" className="inline-flex items-center gap-1 hover:underline">
            <span>Learn how custom curation works</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-[#3C2D1E]/20">|</span>
          <Link href="/occasions/corporate" className="inline-flex items-center gap-1 hover:underline">
            <span>Explore corporate appreciation boxes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
