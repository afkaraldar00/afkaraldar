"use client";

import React from "react";
import { X, ExternalLink, Package, Clock, MapPin, Gift, CheckCircle2, RotateCcw, CreditCard, Sparkles } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";
import Link from "next/link";
import { formatCurrency } from "@/lib/dictionary";

export interface OrderDetail {
  id: string;
  boxName: string;
  occasionSlug?: string;
  status: string;
  createdAt: string;
  finalPrice?: number | null;
  currency?: string;
  checkoutActive?: boolean;
  checkoutSlug?: string;
  customization?: {
    boxColor?: string;
    ribbonColor?: string;
    lining?: string;
    greetingCard?: string;
    customItems?: string[];
    specialNotes?: string;
  };
  deliveryInfo?: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    address?: string;
    emirate?: string;
    deliveryDate?: string;
    deliverySlot?: string;
  };
}

interface OrderDetailModalProps {
  order: OrderDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

const ORDER_STEPS = [
  { key: "NEW_REQUEST", label: "Request Submitted" },
  { key: "CONTACTED", label: "Gifting Advisor Contacted" },
  { key: "PRICE_CONFIRMED", label: "Price Confirmed" },
  { key: "AWAITING_PAYMENT", label: "Awaiting Payment" },
  { key: "PAID", label: "Payment Received" },
  { key: "PREPARING", label: "Afkar AlDar Preparing" },
  { key: "SHIPPED", label: "In Transit" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  // Determine active step index
  const currentStepIndex = Math.max(
    0,
    ORDER_STEPS.findIndex((s) => s.key === order.status)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#AD7D39]/30 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-[#191611] text-white flex items-center justify-between border-b border-[#AD7D39]/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-[#D4BA99]">#{order.id}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#AD7D39]/20 text-[#D4BA99] border border-[#AD7D39]/40">
                {order.status.replace("_", " ")}
              </span>
            </div>
            <h2 className="font-serif text-xl font-bold text-white mt-1">{order.boxName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8A8378] hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#292725]">
          
          {/* Status Timeline */}
          <div className="bg-[#F6F0E7]/60 p-4 rounded-xl border border-[#3C2D1E]/10 space-y-3">
            <div className="flex items-center justify-between border-b border-[#3C2D1E]/10 pb-2">
              <h3 className="font-serif font-bold text-sm text-[#191611] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#AD7D39]" /> Order Fulfillment Progress
              </h3>
              <span className="text-[10px] text-[#8A8378]">Submitted: {order.createdAt}</span>
            </div>

            {/* Horizontal Timeline Bar */}
            <div className="pt-2 pb-1 overflow-x-auto">
              <div className="flex items-center min-w-[500px]">
                {ORDER_STEPS.map((step, idx) => {
                  const isPassed = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center relative group">
                      {/* Connecting Line */}
                      {idx !== 0 && (
                        <div
                          className={`absolute top-3 right-1/2 left-[-50%] h-0.5 ${
                            idx <= currentStepIndex ? "bg-[#AD7D39]" : "bg-[#3C2D1E]/15"
                          }`}
                        />
                      )}
                      
                      {/* Dot */}
                      <div
                        className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isCurrent
                            ? "bg-[#AD7D39] text-white ring-4 ring-[#AD7D39]/20"
                            : isPassed
                            ? "bg-[#191611] text-[#D4BA99]"
                            : "bg-white border border-[#3C2D1E]/20 text-gray-400"
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="text-[9px] font-bold">{idx + 1}</span>}
                      </div>

                      {/* Label */}
                      <span className={`text-[9px] font-medium text-center mt-2 leading-tight ${isCurrent ? "font-bold text-[#AD7D39]" : "text-[#625D55]"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Payment Banner if Active */}
          {order.checkoutActive && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700">
                  <CreditCard className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-amber-900 text-sm">Payment Link Ready</h4>
                  <p className="text-[11px] text-amber-700">
                    Your gifting advisor has calculated final pricing: <span className="font-bold">{formatCurrency(order.finalPrice || 0, order.currency || "AED")}</span>
                  </p>
                </div>
              </div>
              <Link href={`/pay/${order.checkoutSlug}`}>
                <TrackedButton
                  button_location="profile_order_modal"
                  variant="gold"
                  size="sm"
                  className="gap-2 text-[11px] font-bold uppercase tracking-wider py-2.5 px-4 shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Review & Pay</span>
                </TrackedButton>
              </Link>
            </div>
          )}

          {/* Customization Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Box Specifications */}
            <div className="p-4 rounded-xl border border-[#3C2D1E]/10 space-y-3 bg-[#FBF8F3]">
              <h4 className="font-serif font-bold text-sm text-[#191611] border-b border-[#3C2D1E]/10 pb-2 flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#AD7D39]" /> Box Customization Specs
              </h4>
              
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between">
                  <span className="text-[#625D55]">Exterior Color:</span>
                  <span className="font-medium text-[#191611]">{order.customization?.boxColor || "Royal Emerald Velvet"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#625D55]">Silk Ribbon:</span>
                  <span className="font-medium text-[#191611]">{order.customization?.ribbonColor || "Champagne Gold Satin"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#625D55]">Interior Lining:</span>
                  <span className="font-medium text-[#191611]">{order.customization?.lining || "Ivory Suede"}</span>
                </li>
              </ul>

              {order.customization?.customItems && order.customization.customItems.length > 0 && (
                <div className="pt-2 border-t border-[#3C2D1E]/10">
                  <span className="block text-[10px] font-bold text-[#625D55] uppercase tracking-wider mb-1">Curated Box Items:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {order.customization.customItems.map((item, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#3C2D1E]/10 text-[#191611]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Delivery & Personal Card Message */}
            <div className="p-4 rounded-xl border border-[#3C2D1E]/10 space-y-3 bg-[#FBF8F3]">
              <h4 className="font-serif font-bold text-sm text-[#191611] border-b border-[#3C2D1E]/10 pb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#AD7D39]" /> Delivery & Greeting
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[#625D55] block text-[10px] font-bold uppercase">Recipient Contact:</span>
                  <p className="font-medium text-[#191611]">{order.deliveryInfo?.customerName || "Sarah Al Mansoori"}</p>
                  <p className="text-[11px] text-[#625D55]">{order.deliveryInfo?.customerPhone || "+971 50 123 4567"}</p>
                </div>

                <div>
                  <span className="text-[#625D55] block text-[10px] font-bold uppercase">Destination Address:</span>
                  <p className="font-medium text-[#191611]">
                    {order.deliveryInfo?.address || "Villa 14, Al Wasl Road, Jumeirah 2, Dubai"}
                  </p>
                </div>

                {order.customization?.greetingCard && (
                  <div className="pt-2 border-t border-[#3C2D1E]/10">
                    <span className="text-[#625D55] block text-[10px] font-bold uppercase">Gold Foil Calligraphy Message:</span>
                    <p className="italic text-[#191611] bg-white p-2.5 rounded-lg border border-[#3C2D1E]/10 mt-1 font-serif">
                      &quot;{order.customization.greetingCard}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F6F0E7]/80 border-t border-[#3C2D1E]/10 flex items-center justify-between gap-4">
          <Link href={`/customize/${order.occasionSlug || "birthday"}`}>
            <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#625D55] hover:text-[#AD7D39] transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Duplicate / Re-customize</span>
            </button>
          </Link>

          <TrackedButton
            button_location="profile_order_modal"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs uppercase font-bold px-6"
          >
            Close
          </TrackedButton>
        </div>

      </div>
    </div>
  );
}
