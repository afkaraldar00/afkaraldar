"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ChevronDown, MessageCircle } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";

export default function FAQPage() {
  const faqs = [
    {
      q: "Why are prices not listed on the website?",
      a: "Because every Afkar Aldar gift box is custom-built to order with your choice of items, monograms, card printing, and ribbon styles. Once you submit a request or design via our customizer, our team contacts you on WhatsApp with an exact quote.",
    },
    {
      q: "How long does delivery take across the UAE?",
      a: "Standard customized orders take 24–48 hours for hand-assembly and delivery in Dubai, Abu Dhabi, and Sharjah. Express same-day delivery is available upon request for urgent occasions.",
    },
    {
      q: "How do I pay for my order once confirmed?",
      a: "After you agree on the details and price with our gifting advisor, you will receive a secure, private branded payment link (`/pay/[orderId]`) via WhatsApp or email. You can safely complete payment using your credit card, debit card, or Apple Pay via Stripe UAE.",
    },
    {
      q: "Can I customize the greeting card message?",
      a: "Absolutely! We print your personalized greeting message on luxury heavy-cardstock stationery inside a wax-sealed gold envelope.",
    },
    {
      q: "Do you offer corporate or bulk branding?",
      a: "Yes. We specialize in executive corporate gift boxes with hot-stamped client logos, custom brass clasps, and bulk delivery across all 7 UAE Emirates.",
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9DBC6]/60 text-xs font-semibold text-[#7D5121]">
          <Sparkles className="w-3.5 h-3.5 text-[#AD7D39]" />
          Help & Clarifications
        </span>
        <h1 className="font-serif text-4xl font-bold text-[#191611]">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-[#625D55]">
          Everything you need to know about our luxury bespoke gifting experience.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="luxury-card overflow-hidden">
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-serif text-lg font-bold text-[#191611] focus:outline-none"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#AD7D39] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 text-xs text-[#625D55] leading-relaxed border-t border-[#3C2D1E]/10 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Direct Contact Box */}
      <div className="luxury-card p-8 text-center space-y-4 bg-gradient-to-r from-[#F6F0E7] to-[#FBF8F3]">
        <h3 className="font-serif text-2xl font-bold text-[#191611]">Still Have Questions?</h3>
        <p className="text-xs text-[#625D55]">Our gifting director is available on WhatsApp 7 days a week.</p>
        <div>
          <a
            href="https://wa.me/971500000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white font-medium text-xs hover:bg-[#1ebd59] transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Chat with Gifting Advisor</span>
          </a>
        </div>
      </div>

    </div>
  );
}
