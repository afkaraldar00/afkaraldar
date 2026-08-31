"use client";

import Link from "next/link";
import { Sparkles, Gift, ArrowLeft } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";

export interface BoxItem {
  slug: string;
  name: string;
  desc: string;
  image: string;
  altText: string;
}

export interface OccasionClientContentProps {
  slug: string;
  title: string;
  boxes: BoxItem[];
}

export default function OccasionClientContent({ slug, title, boxes }: OccasionClientContentProps) {
  return (
    <div className="space-y-10">
      
      {/* Top Header Controls */}
      <div className="space-y-4">
        <Link href="/occasions" className="inline-flex items-center gap-2 text-xs font-medium text-[#AD7D39] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Occasions</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3C2D1E]/10 pb-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#AD7D39] font-bold">Occasion Collection</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#191611] mt-1">{title}</h1>
          </div>

          <Link href={`/customize/${slug}`}>
            <TrackedButton
              button_location="occasion_card"
              variant="gold"
              size="md"
              eventName="start_customization"
              trackingParams={{ occasion: slug }}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Customize Your Own Box</span>
            </TrackedButton>
          </Link>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {boxes.map((box) => (
          <div key={box.slug} className="luxury-card overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="relative aspect-square overflow-hidden bg-[#191611]">
                <img
                  src={box.image}
                  alt={box.altText || box.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#AD7D39]">{title}</span>
                <h3 className="font-serif text-xl font-bold text-[#191611] group-hover:text-[#AD7D39] transition-colors">
                  {box.name}
                </h3>
                <p className="text-xs text-[#625D55] leading-relaxed">
                  {box.desc}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Link href={`/box/${box.slug}`}>
                <TrackedButton
                  button_location="box_detail"
                  variant="primary"
                  size="md"
                  eventName="view_content"
                  trackingParams={{ gift_box_name: box.name, product_id: box.slug }}
                  className="w-full gap-2 text-xs font-semibold"
                >
                  <Gift className="w-4 h-4" />
                  <span>Customize & Request</span>
                </TrackedButton>
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
