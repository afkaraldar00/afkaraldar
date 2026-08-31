"use client";

export type CardAndRibbonConfig = {
  cardMessage: string;
  senderNameOnCard: string;
  ribbonColor: string;
  monogramInitials: string;
  waxSealColor: string;
};

interface StepCardAndRibbonProps {
  data: CardAndRibbonConfig;
  onChange: (updated: Partial<CardAndRibbonConfig>) => void;
}

export default function StepCardAndRibbon({ data, onChange }: StepCardAndRibbonProps) {
  const ribbons = [
    { id: "gold-satin", name: "Gold Satin" },
    { id: "emerald-velvet", name: "Emerald Velvet" },
    { id: "burgundy-silk", name: "Burgundy Silk" },
    { id: "champagne-organza", name: "Champagne Organza" },
    { id: "midnight-[#191611]", name: "Midnight Black Ribbon" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#191611]">Card & Finish Customization</h2>
        <p className="text-xs text-[#625D55] mt-1">Compose your bespoke message and select luxury packaging accents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card Message Inputs */}
        <div className="space-y-4 luxury-card p-5 bg-white">
          <h3 className="font-serif font-bold text-base text-[#191611]">Printed Greeting Card</h3>
          
          <div>
            <label className="block text-xs font-semibold text-[#625D55] mb-1">Your Personal Message</label>
            <textarea
              rows={4}
              value={data.cardMessage}
              onChange={(e) => onChange({ cardMessage: e.target.value })}
              placeholder="Wishing you unforgettable joy, laughter, and blessings on your special day..."
              className="w-full p-3 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#625D55] mb-1">Signed From (Name on Card)</label>
            <input
              type="text"
              value={data.senderNameOnCard}
              onChange={(e) => onChange({ senderNameOnCard: e.target.value })}
              placeholder="With love, Sarah & Ahmed"
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
            />
          </div>
        </div>

        {/* Packaging Details */}
        <div className="space-y-4 luxury-card p-5 bg-white">
          <h3 className="font-serif font-bold text-base text-[#191611]">Packaging Accents</h3>

          <div>
            <label className="block text-xs font-semibold text-[#625D55] mb-1">Ribbon Tie</label>
            <select
              value={data.ribbonColor}
              onChange={(e) => onChange({ ribbonColor: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
            >
              {ribbons.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#625D55] mb-1">Hot-Stamped Gold Monogram Initials (Optional)</label>
            <input
              type="text"
              maxLength={4}
              value={data.monogramInitials}
              onChange={(e) => onChange({ monogramInitials: e.target.value.toUpperCase() })}
              placeholder="e.g. S & A"
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none tracking-widest font-bold"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
