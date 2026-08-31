"use client";

export type RecipientInfoConfig = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  recipientName: string;
  recipientPhone: string;
  emirate: string;
  deliveryAddress: string;
  preferredDeliveryDate: string;
  specialRequests: string;
};

interface StepRecipientInfoProps {
  data: RecipientInfoConfig;
  onChange: (updated: Partial<RecipientInfoConfig>) => void;
}

export default function StepRecipientInfo({ data, onChange }: StepRecipientInfoProps) {
  const emirates = [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Ras Al Khaimah",
    "Fujairah",
    "Umm Al Quwain",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#191611]">Contact & Delivery Details</h2>
        <p className="text-xs text-[#625D55] mt-1">Provide your contact info so our team can confirm your pricing & delivery schedule.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Your Contact Info */}
        <div className="space-y-3 luxury-card p-5 bg-white">
          <h3 className="font-serif font-bold text-base text-[#191611]">Your Information (Order Requester)</h3>
          
          <div>
            <label className="block text-xs font-semibold text-[#625D55] mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={data.customerName}
              onChange={(e) => onChange({ customerName: e.target.value })}
              placeholder="e.g. Sarah Al Mansoori"
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#625D55] mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={data.customerEmail}
              onChange={(e) => onChange({ customerEmail: e.target.value })}
              placeholder="sarah@example.ae"
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#625D55] mb-1">Phone / WhatsApp Number *</label>
            <input
              type="tel"
              required
              value={data.customerPhone}
              onChange={(e) => onChange({ customerPhone: e.target.value })}
              placeholder="+971 50 123 4567"
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
            />
          </div>
        </div>

        {/* Recipient & Delivery Info */}
        <div className="space-y-3 luxury-card p-5 bg-white">
          <h3 className="font-serif font-bold text-base text-[#191611]">Delivery Destination (UAE)</h3>

          <div>
            <label className="block text-xs font-semibold text-[#625D55] mb-1">Recipient Name</label>
            <input
              type="text"
              value={data.recipientName}
              onChange={(e) => onChange({ recipientName: e.target.value })}
              placeholder="e.g. Ahmed & Mariam"
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#625D55] mb-1">Emirate *</label>
            <select
              value={data.emirate}
              onChange={(e) => onChange({ emirate: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
            >
              {emirates.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#625D55] mb-1">Delivery Address</label>
            <input
              type="text"
              value={data.deliveryAddress}
              onChange={(e) => onChange({ deliveryAddress: e.target.value })}
              placeholder="Villa 45, Al Wasl Road, Jumeirah 2, Dubai"
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#625D55] mb-1">Preferred Delivery Date</label>
            <input
              type="date"
              value={data.preferredDeliveryDate}
              onChange={(e) => onChange({ preferredDeliveryDate: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
            />
          </div>
        </div>

      </div>

      {/* Special Requests */}
      <div className="luxury-card p-5 bg-white space-y-2">
        <label className="block text-xs font-semibold text-[#625D55]">Special Requests or Custom Branding Notes</label>
        <textarea
          rows={2}
          value={data.specialRequests}
          onChange={(e) => onChange({ specialRequests: e.target.value })}
          placeholder="e.g. Please wrap in extra gold tissue paper, or mention express evening delivery..."
          className="w-full p-3 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
        />
      </div>
    </div>
  );
}
