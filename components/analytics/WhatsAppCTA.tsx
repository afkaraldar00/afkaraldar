"use client";

import React from "react";
import { track, TrackParams } from "@/lib/analytics/track";

export interface WhatsAppCTAProps {
  phone?: string;
  productName?: string;
  pageSlug?: string;
  category?: string;
  lang?: "en" | "ar";
  ctaPosition?: NonNullable<TrackParams["button_location"]>;
  className?: string;
  children: React.ReactNode;
}

export default function WhatsAppCTA({
  phone = "971500000000",
  productName = "Custom Luxury Gift Box",
  pageSlug = "home",
  category = "general",
  lang = "en",
  ctaPosition = "hero",
  className = "",
  children,
}: WhatsAppCTAProps) {
  const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Fire GA4 event
    track("click_to_whatsapp", {
      product_name: productName,
      page_slug: pageSlug,
      product_category: category,
      language: lang,
      button_location: ctaPosition,
    });
  };

  const cleanPhone = phone.replace(/[^0-9]/g, "");
  
  const greeting = lang === "ar"
    ? `مرحباً أفكار الدار، أود الاستفسار عن طلب: ${productName} (من صفحة: ${pageSlug})`
    : `Hello Afkar Al Dar, I would like to order: ${productName} (Page: ${pageSlug})`;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(greeting)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleWhatsAppClick}
      className={className}
    >
      {children}
    </a>
  );
}
