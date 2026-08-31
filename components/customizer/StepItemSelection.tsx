"use client";

import { Check, Plus } from "lucide-react";

export type AvailableItem = {
  id: string;
  name: string;
  category: "sweets" | "fragrance" | "keepsakes" | "beverages";
  desc: string;
  icon: string;
};

interface StepItemSelectionProps {
  selectedItemIds: string[];
  onToggleItem: (itemId: string) => void;
}

export default function StepItemSelection({ selectedItemIds, onToggleItem }: StepItemSelectionProps) {
  const items: AvailableItem[] = [
    { id: "pralines", name: "Artisanal Swiss Pralines (12 pcs)", category: "sweets", desc: "Handcrafted milk & dark chocolate truffles.", icon: "🍫" },
    { id: "oud-perfume", name: "Royal Oud & Amber Extract (30ml)", category: "fragrance", desc: "Concentrated luxury Arabian perfume oils.", icon: "✨" },
    { id: "leather-journal", name: "Hot-Stamped Leather Journal", category: "keepsakes", desc: "Italian leather cover with gold leaf pages.", icon: "📖" },
    { id: "scented-candle", name: "Scented Soy Candle (Rose & Wood)", category: "fragrance", desc: "Poured in a matte ceramic gold-rimmed jar.", icon: "🕯️" },
    { id: "crystal-flutes", name: "Gold-Rimmed Crystal Flutes (Pair)", category: "keepsakes", desc: "Hand-blown crystal champagne flutes.", icon: "🥂" },
    { id: "organic-honey", name: "Sidr Royal UAE Organic Honey", category: "sweets", desc: "Pure raw honey jar with wooden dipper.", icon: "🍯" },
    { id: "executive-pen", name: "Brushed Brass Fountain Pen", category: "keepsakes", desc: "Weighted writing pen with refillable ink.", icon: "🖋️" },
    { id: "cashmere-scarf", name: "Soft Pashmina Cashmere Shawl", category: "keepsakes", desc: "Woven luxury warmth in neutral champagne tone.", icon: "🧣" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#191611]">Select Box Contents</h2>
        <p className="text-xs text-[#625D55] mt-1">Choose 3 to 6 luxury items to include in your gift curation.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => {
          const isSelected = selectedItemIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggleItem(item.id)}
              className={`p-4 rounded-xl border text-left flex items-start justify-between gap-3 transition-all duration-300 focus:outline-none hover:-translate-y-1 hover:shadow-md cursor-pointer active:scale-95 group ${
                isSelected
                  ? "border-[#AD7D39] bg-[#F6F0E7] shadow-sm ring-2 ring-[#AD7D39]/40 scale-[1.01]"
                  : "border-[#3C2D1E]/10 bg-white hover:border-[#AD7D39]/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-300">{item.icon}</span>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#191611] group-hover:text-[#AD7D39] transition-colors">{item.name}</h3>
                  <p className="text-xs text-[#625D55] mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>

              <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center border transition-all duration-300 ${
                isSelected ? "bg-[#AD7D39] border-[#AD7D39] text-white animate-checkmark-pop" : "border-[#3C2D1E]/20 text-transparent group-hover:border-[#AD7D39]"
              }`}>
                {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-[#8A8378] group-hover:text-[#AD7D39]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
