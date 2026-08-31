"use client";

import { Check } from "lucide-react";

export type BoxStyleConfig = {
  boxColor: string;
  boxSize: "standard" | "grand" | "suite";
};

interface StepBoxStyleProps {
  data: BoxStyleConfig;
  onChange: (updated: Partial<BoxStyleConfig>) => void;
}

export default function StepBoxStyle({ data, onChange }: StepBoxStyleProps) {
  const colorOptions = [
    { id: "emerald-velvet", name: "Emerald Velvet", hex: "#0F382C", borderHex: "#AD7D39" },
    { id: "gold-champagne", name: "Champagne Gold", hex: "#D4BA99", borderHex: "#7D5121" },
    { id: "midnight-black", name: "Midnight Black", hex: "#191611", borderHex: "#AD7D39" },
    { id: "pearl-cream", name: "Pearl Cream", hex: "#F6F0E7", borderHex: "#D4BA99" },
    { id: "rose-blush", name: "Rose Blush", hex: "#E8C5C8", borderHex: "#AD7D39" },
  ];

  const sizeOptions = [
    { id: "standard", name: "Classic Gift Box", desc: "Holds 3–4 luxury items + card", badge: "Popular" },
    { id: "grand", name: "Grand Keepsake Box", desc: "Holds 5–7 luxury items + keepsake", badge: "Luxury" },
    { id: "suite", name: "VIP Executive Suite", desc: "Expansive luxury box with velvet lining", badge: "VIP" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#191611]">Choose Keepsake Box Style</h2>
        <p className="text-xs text-[#625D55] mt-1">Select your preferred color scheme and box dimension.</p>
      </div>

      {/* Box Color Selection */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-[#191611] uppercase tracking-wider">
          Box Color Finish
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {colorOptions.map((c) => {
            const isSelected = data.boxColor === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange({ boxColor: c.id })}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 text-center focus:outline-none hover:-translate-y-1 hover:shadow-md cursor-pointer active:scale-95 ${
                  isSelected
                    ? "border-[#AD7D39] bg-[#F6F0E7] shadow-sm ring-2 ring-[#AD7D39]/40 scale-[1.03]"
                    : "border-[#3C2D1E]/10 bg-white hover:border-[#AD7D39]/40"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full shadow-inner flex items-center justify-center relative border border-black/10 transition-transform duration-300"
                  style={{ backgroundColor: c.hex }}
                >
                  {isSelected && (
                    <Check className={`w-5 h-5 animate-checkmark-pop ${c.id === "pearl-cream" ? "text-black" : "text-white"}`} />
                  )}
                </div>
                <span className="text-xs font-medium text-[#292725]">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Box Size Selection */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-[#191611] uppercase tracking-wider">
          Box Dimension
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sizeOptions.map((s) => {
            const isSelected = data.boxSize === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onChange({ boxSize: s.id as BoxStyleConfig["boxSize"] })}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-300 focus:outline-none hover:-translate-y-1 hover:shadow-md cursor-pointer active:scale-95 ${
                  isSelected
                    ? "border-[#AD7D39] bg-[#F6F0E7] shadow-sm ring-2 ring-[#AD7D39]/40 scale-[1.02]"
                    : "border-[#3C2D1E]/10 bg-white hover:border-[#AD7D39]/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-base text-[#191611]">{s.name}</span>
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full transition-colors ${
                      isSelected ? "bg-[#AD7D39] text-white" : "bg-[#191611] text-[#D4BA99]"
                    }`}>
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#625D55] mt-1">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
