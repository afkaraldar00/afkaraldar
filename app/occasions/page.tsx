"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Filter } from "lucide-react";
import { track } from "@/lib/analytics/track";
import AnimatedReveal from "@/components/ui/AnimatedReveal";
import TrackedButton from "@/components/ui/TrackedButton";
import { supabase } from "@/lib/supabase/client";

export default function OccasionsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOccasions() {
      try {
        const { data, error } = await supabase
          .from("Occasion")
          .select("*")
          .order("name", { ascending: true });
        if (data) {
          setCollections(data);
        }
      } catch (err) {
        console.error("Error loading occasions:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOccasions();
  }, []);

  const filterTabs = [
    { id: "all", name: "All Themes" },
    { id: "celebrations", name: "Celebrations" },
    { id: "personal", name: "Love & Family" },
    { id: "milestones", name: "Milestones" },
    { id: "corporate", name: "Corporate" },
  ];

  const filteredCollections = activeFilter === "all" 
    ? collections 
    : collections.filter(item => item.category === activeFilter);

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Page Header */}
      <AnimatedReveal animation="fade-up">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9DBC6]/60 text-xs font-semibold text-[#7D5121] animate-float">
            <Sparkles className="w-3.5 h-3.5 text-[#AD7D39]" />
            Curated Gift Themes
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#191611]">
            Explore Gift Collections by Occasion
          </h1>
          <p className="text-base text-[#625D55] leading-relaxed">
            Discover our handcrafted luxury gift box concepts tailored for life’s most cherished celebrations.
          </p>

          {/* Elegant Monogram Graphic Spacer */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#AD7D39]/40" />
            <div className="relative flex items-center justify-center">
              <span className="font-serif text-[#AD7D39] text-xs tracking-widest font-bold">A</span>
              <div className="absolute w-3.5 h-3.5 border-b border-[#AD7D39] rotate-45 opacity-60" />
            </div>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#AD7D39]/40" />
          </div>
        </div>
      </AnimatedReveal>

      {/* Filter Tabs Navigation */}
      <AnimatedReveal animation="fade-up" delay={100}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2">
          <span className="flex items-center gap-1.5 text-xs text-[#8A8378] font-bold uppercase tracking-wider pr-2">
            <Filter className="w-3.5 h-3.5" />
            Filter by:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-[#F6F0E7]/60 rounded-xl border border-[#3C2D1E]/5">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveFilter(tab.id);
                  track("filter_occasions", { filter: tab.id });
                }}
                className={`px-4 py-2 text-xs font-bold tracking-wider rounded-lg transition-all duration-300 active:scale-95 cursor-pointer ${
                  activeFilter === tab.id
                    ? "bg-[#AD7D39] text-white shadow-md shadow-[#AD7D39]/20"
                    : "text-[#625D55] hover:bg-[#F6F0E7] hover:text-[#191611]"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </AnimatedReveal>

      {/* Occasion Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[300px]">
        {filteredCollections.map((item, idx) => (
          <AnimatedReveal key={item.slug} animation="fade-up" delay={idx * 100}>
            <Link
              href={`/occasions/${item.slug}`}
              onClick={() => track("select_occasion", { occasion: item.slug, button_location: "occasion_card" })}
              className="luxury-card overflow-hidden group flex flex-col justify-between h-full bg-white relative hover-gold-shine border border-[#3C2D1E]/10"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-[#191611]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="object-cover w-full h-full img-zoom-hover opacity-90 group-hover:opacity-100"
                  />
                  
                  {/* Category Pill Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#FBF8F3] bg-[#AD7D39] px-2.5 py-1 rounded-md shadow-md">
                      {item.badge}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-[#191611]/85 via-transparent to-transparent flex items-end p-4">
                    <span className="text-xs font-semibold text-[#D4BA99] bg-[#191611]/70 px-2.5 py-1.5 rounded-md backdrop-blur-md group-hover:bg-[#AD7D39] group-hover:text-white transition-colors duration-300">
                      {item.boxCount || item.count}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <h2 className="font-serif text-2xl font-bold text-[#191611] group-hover:text-[#AD7D39] transition-colors duration-300">
                    {item.name}
                  </h2>
                  <p className="text-xs text-[#625D55] leading-relaxed">
                    {item.description || item.desc}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between text-xs font-bold text-[#AD7D39] border-t border-[#3C2D1E]/5 mt-4">
                <span className="group-hover:underline">Explore Collection</span>
                <div className="w-8 h-8 rounded-full bg-[#F6F0E7] flex items-center justify-center group-hover:bg-[#AD7D39] group-hover:text-white transition-all duration-300">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          </AnimatedReveal>
        ))}
      </div>

      {/* Bottom Custom designbuilder CTA banner */}
      <AnimatedReveal animation="scale-in">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#191611] via-[#29231C] to-[#191611] text-white p-8 sm:p-12 border border-[#AD7D39]/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          
          {/* Subtle gold decoration leaf */}
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-[#AD7D39]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-[#AD7D39]">
              <Sparkles className="w-3.5 h-3.5" />
              Bespoke Customizer
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
              Craft a Unique Curation
            </h2>
            <p className="text-xs text-[#D4BA99] leading-relaxed">
              If your occasion calls for specific customized items, ribbon details, or branded gift setups, launch our interactive custom builder to select every detail.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Link href="/customize/birthday">
              <TrackedButton
                button_location="bottom_cta"
                variant="gold"
                size="md"
                className="w-full md:w-auto uppercase font-bold text-xs tracking-wider"
              >
                Launch Builder
              </TrackedButton>
            </Link>
          </div>
        </div>
      </AnimatedReveal>

    </div>
  );
}


