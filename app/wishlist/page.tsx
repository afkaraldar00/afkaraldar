"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, Gift, Sparkles, ArrowRight } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("afkaraldar_wishlist");
      if (saved) {
        try {
          setWishlist(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleRemove = (slug: string) => {
    const updated = wishlist.filter((item) => item.slug !== slug);
    setWishlist(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("afkaraldar_wishlist", JSON.stringify(updated));
    }
  };

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9DBC6]/60 text-xs font-semibold text-[#7D5121]">
          <Heart className="w-3.5 h-3.5 fill-[#AD7D39] text-[#AD7D39]" />
          Saved Curations
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#191611]">
          Your Gifting Wishlist
        </h1>
        <p className="text-xs text-[#625D55] leading-relaxed">
          Save box designs and custom arrangements to revisit, customize, or request whenever you are ready.
        </p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item) => (
            <div key={item.slug} className="luxury-card overflow-hidden bg-white flex flex-col justify-between group">
              <div>
                <div className="relative aspect-square overflow-hidden bg-[#191611]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => handleRemove(item.slug)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-md focus:outline-none"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#AD7D39]">
                    {item.occasion}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#191611] group-hover:text-[#AD7D39] transition-colors leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#625D55] leading-relaxed line-clamp-2">
                    {item.tagline}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link href={`/box/${item.slug}`}>
                  <TrackedButton
                    button_location="box_detail"
                    variant="gold"
                    size="md"
                    className="w-full gap-2 text-xs font-bold uppercase"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Customize & Request</span>
                  </TrackedButton>
                </Link>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-[#3C2D1E]/20 rounded-2xl p-16 text-center text-xs text-[#8A8378] flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
          <Heart className="w-12 h-12 text-[#AD7D39]/30 stroke-[1.25]" />
          <p className="leading-relaxed">Your wishlist is currently empty. Start exploring occasions or custom gift configurations.</p>
          <Link href="/occasions">
            <TrackedButton
              button_location="hero"
              variant="gold"
              size="sm"
              className="gap-2 text-xs uppercase"
            >
              <span>Explore Collections</span>
              <ArrowRight className="w-4 h-4" />
            </TrackedButton>
          </Link>
        </div>
      )}

    </div>
  );
}
