"use client";

import Link from "next/link";
import { Sparkles, CheckCircle2, ShieldCheck, Heart, ArrowLeft, MessageCircle, Gift, ShoppingBag } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";
import WhatsAppCTA from "@/components/analytics/WhatsAppCTA";
import { useCart } from "@/lib/context/CartContext";

export interface SingleBoxClientContentProps {
  slug: string;
  boxName: string;
  includedItems: string[];
}

export default function SingleBoxClientContent({ slug, boxName, includedItems }: SingleBoxClientContentProps) {
  const { addToCart } = useCart();
  return (
    <div className="space-y-12">
      {/* Back Navigation */}
      <Link href="/occasions" className="inline-flex items-center gap-2 text-xs font-medium text-[#AD7D39] hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Collections</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Image Gallery Showcase */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#191611] border border-[#AD7D39]/30 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop"
              alt={`The Royal Velvet Celebration Box open view showing plush interior compartments and gold foil card - ${boxName}`}
              className="object-cover w-full h-full"
            />
            <div className="absolute top-4 left-4">
              <span className="text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-[#191611]/80 text-[#D4BA99] backdrop-blur-md border border-[#AD7D39]/30">
                Bespoke Order
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="aspect-square rounded-xl overflow-hidden border border-[#AD7D39]/20 bg-[#191611]">
              <img
                src="https://images.unsplash.com/photo-1513885535751-8b9238bd48d7?q=80&w=300&auto=format&fit=crop"
                alt="Close-up of hot-stamped gold foil monogram initials on luxury cream gift box lid"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="aspect-square rounded-xl overflow-hidden border border-[#AD7D39]/20 bg-[#191611]">
              <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=300&auto=format&fit=crop"
                alt="Hand-assembled luxury velvet hamper with custom ribbon tie and artisan gift items"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="aspect-square rounded-xl overflow-hidden border border-[#AD7D39]/20 bg-[#191611]">
              <img
                src="https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=300&auto=format&fit=crop"
                alt="Artisanal sweets and custom card arrangement inside box"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Specification & Action */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9DBC6]/60 text-xs font-semibold text-[#7D5121] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#AD7D39]" />
              <span>Tailored Gifting Experience</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#191611]">
              {boxName}
            </h1>
            <p className="text-sm text-[#625D55] mt-2 leading-relaxed">
              Designed with timeless craftsmanship. Customize every detail from box color and artisanal treats to personalized engraved cards and silk ribbons.
            </p>
          </div>

          {/* Pricing Notice */}
          <div className="p-4 rounded-xl bg-[#F6F0E7] border border-[#AD7D39]/25 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#AD7D39] shrink-0 mt-0.5" />
            <div className="text-xs text-[#625D55]">
              <span className="font-semibold text-[#191611]">Custom Gifting Quote: </span>
              As every box is personalized to your specifications, final pricing is provided after you submit your customization options or chat with our design team.
            </div>
          </div>

          {/* Items Included List */}
          <div className="space-y-3 pt-2">
            <h3 className="font-serif text-lg font-bold text-[#191611]">What’s Included in This Box</h3>
            <ul className="space-y-2">
              {includedItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-[#292725]">
                  <CheckCircle2 className="w-4 h-4 text-[#AD7D39] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Primary CTAs */}
          <div className="space-y-3 pt-4 border-t border-[#3C2D1E]/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href={`/customize/${slug}`} className="block">
                <TrackedButton
                  button_location="box_detail"
                  variant="gold"
                  size="lg"
                  eventName="start_customization"
                  trackingParams={{ gift_box_name: boxName, product_id: slug }}
                  className="w-full gap-2 text-sm font-semibold shadow-md"
                >
                  <Gift className="w-4 h-4" />
                  <span>Customize Spec</span>
                </TrackedButton>
              </Link>

              <button
                onClick={() => {
                  addToCart({
                    id: `box_${slug}_${Date.now()}`,
                    slug,
                    name: boxName,
                    occasion: slug.toUpperCase(),
                    price: 350,
                    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000",
                  });
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#191611] text-[#D4BA99] font-bold text-sm border border-[#AD7D39]/40 hover:bg-[#292725] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#AD7D39]" />
                <span>Add Box to Cart</span>
              </button>
            </div>

            <WhatsAppCTA
              productName={boxName}
              pageSlug={`box-${slug}`}
              category="custom-gift-box"
              ctaPosition="box_detail"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] text-white font-medium text-sm hover:bg-[#1ebd59] transition-all shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Inquire via WhatsApp</span>
            </WhatsAppCTA>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-[#8A8378]">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#AD7D39]" />
              <span>Handcrafted in UAE</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#AD7D39]" />
              <span>White-Glove Courier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
