declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export type TrackParams = {
  occasion?: string;
  gift_box_name?: string;
  product_id?: string;
  value?: number;
  currency?: string;
  button_location?: "hero" | "navbar" | "floating" | "bottom_cta" | "occasion_card" | "box_detail" | "customizer" | "admin" | "checkout" | "profile" | "profile_orders" | "profile_calendar" | "profile_address_book" | "profile_wishlist" | "profile_tickets" | "profile_settings" | "profile_order_modal" | "address_book_modal" | "gifting_calendar_modal" | "new_ticket_modal" | "vip_modal";
  page_name?: string;
  [key: string]: unknown;
};

export function track(eventName: string, params: TrackParams = {}) {
  if (typeof window === "undefined") return;
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    timestamp: new Date().toISOString(),
    ...params,
  });

  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics Track: ${eventName}]`, params);
  }
}
