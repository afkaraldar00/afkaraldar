"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle, Sparkles, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";
import confetti from "canvas-confetti";

export default function RequestConfirmationPage() {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("last_order_request");
      if (saved) {
        try {
          setOrder(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Trigger celebratory gold confetti burst on launch
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#AD7D39", "#D4BA99", "#7D5121"],
    });
  }, []);

  return (
    <div className="py-12 md:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
      
      {/* Icon Badge */}
      <div className="mx-auto w-20 h-20 rounded-full bg-[#F6F0E7] border-2 border-[#AD7D39] flex items-center justify-center shadow-lg animate-in zoom-in-75 duration-500">
        <CheckCircle2 className="w-10 h-10 text-[#AD7D39]" />
      </div>

      <div className="space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9DBC6]/60 text-xs font-semibold text-[#7D5121]">
          <Sparkles className="w-3.5 h-3.5 text-[#AD7D39]" />
          Request Received • Status: NEW_REQUEST
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#191611]">
          Thank You! Your Gift Request Has Been Submitted
        </h1>
        <p className="text-sm text-[#625D55] max-w-xl mx-auto leading-relaxed">
          We have received your custom box details. Our gifting director is reviewing your selections and will reach out via WhatsApp shortly to confirm your bespoke price and delivery arrangements.
        </p>
      </div>

      {/* Order Summary Card */}
      {order && (
        <div className="luxury-card p-6 text-left space-y-4 bg-white border border-[#AD7D39]/20 shadow-md">
          <div className="flex items-center justify-between border-b border-[#3C2D1E]/10 pb-3">
            <span className="text-xs uppercase tracking-widest text-[#AD7D39] font-bold">Request Reference</span>
            <span className="font-serif font-bold text-lg text-[#191611]">#{order.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#8A8378] block">Customer Name</span>
              <span className="font-medium text-[#191611]">{order.deliveryInfo?.customerName}</span>
            </div>
            <div>
              <span className="text-[#8A8378] block">Phone / WhatsApp</span>
              <span className="font-medium text-[#191611]">{order.deliveryInfo?.customerPhone}</span>
            </div>
            <div>
              <span className="text-[#8A8378] block">Destination Emirate</span>
              <span className="font-medium text-[#191611]">{order.deliveryInfo?.emirate || "Dubai"}</span>
            </div>
            <div>
              <span className="text-[#8A8378] block">Occasion</span>
              <span className="font-medium text-[#191611] capitalize">{order.occasionSlug}</span>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps Guide */}
      <div className="p-6 rounded-2xl bg-[#F6F0E7] border border-[#3C2D1E]/10 space-y-3 text-left">
        <h3 className="font-serif font-bold text-base text-[#191611] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#AD7D39]" />
          What Happens Next?
        </h3>
        <ul className="space-y-2 text-xs text-[#625D55]">
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#AD7D39]">1.</span>
            <span>Our gifting advisor contacts you on WhatsApp with your customized quote.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#AD7D39]">2.</span>
            <span>Once agreed, we generate your private branded checkout page (`/pay/[checkoutSlug]`).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#AD7D39]">3.</span>
            <span>You complete payment safely online via Stripe (Full or 50% Deposit).</span>
          </li>
        </ul>
      </div>

      {/* Immediate WhatsApp Action */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href={`https://wa.me/971500000000?text=Hello%20Afkar%20Aldar,%20I%20just%20submitted%20order%20request%20%23${order?.id || "NEW"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] text-white font-medium text-sm hover:bg-[#1ebd59] transition-all shadow-md"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>Chat Immediately on WhatsApp</span>
        </a>

        <Link href="/" className="w-full sm:w-auto">
          <TrackedButton
            button_location="hero"
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto gap-2"
          >
            <span>Return to Home</span>
            <ArrowRight className="w-4 h-4" />
          </TrackedButton>
        </Link>
      </div>

    </div>
  );
}
