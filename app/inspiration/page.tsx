"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";
import { supabase } from "@/lib/supabase/client";

export default function InspirationPage() {
  const [lookbookItems, setLookbookItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLookbook() {
      try {
        const { data, error } = await supabase
          .from("LookbookItem")
          .select("*")
          .order("createdAt", { ascending: false });
        if (data) {
          setLookbookItems(data);
        }
      } catch (err) {
        console.error("Error loading lookbook:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLookbook();
  }, []);

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9DBC6]/60 text-xs font-semibold text-[#7D5121]">
          <Sparkles className="w-3.5 h-3.5 text-[#AD7D39]" />
          Editorial Lookbook
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#191611]">
          Gifting Inspiration & Gallery
        </h1>
        <p className="text-base text-[#625D55] leading-relaxed">
          Explore past custom box creations crafted by Afkar Aldar for high-profile weddings, corporate galas, and intimate celebrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {lookbookItems.map((item, idx) => (
          <div key={idx} className="luxury-card overflow-hidden group">
            <div className="relative aspect-[16/10] overflow-hidden bg-[#191611]">
              <img
                src={item.image}
                alt={item.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full bg-[#191611]/80 text-[#D4BA99] backdrop-blur-md">
                {item.occasion}
              </span>
            </div>
            <div className="p-6 space-y-3">
              <h2 className="font-serif text-2xl font-bold text-[#191611] group-hover:text-[#AD7D39] transition-colors">
                {item.title}
              </h2>
              <p className="text-xs text-[#625D55] leading-relaxed">
                {item.tagline}
              </p>
              <div className="pt-2">
                <Link href="/customize/birthday">
                  <TrackedButton
                    button_location="hero"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    <span>Design Similar Creation</span>
                    <ArrowRight className="w-4 h-4" />
                  </TrackedButton>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
