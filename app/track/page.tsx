"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Clock, CheckCircle2, ShieldAlert, ArrowRight, Phone, Mail, Gift, ShieldCheck, ExternalLink } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";
import { formatCurrency } from "@/lib/dictionary";
import { supabase } from "@/lib/supabase/client";

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState<string>("");
  const [phoneOrEmail, setPhoneOrEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [existingOrders, setExistingOrders] = useState<any[]>([]);

  useEffect(() => {
    async function loadOrders() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const storedEmail = typeof window !== "undefined" ? localStorage.getItem("afkar_customer_email") : null;

        const clientEmails: string[] = [];
        if (session?.user?.email) clientEmails.push(session.user.email);
        if (storedEmail && !clientEmails.includes(storedEmail)) clientEmails.push(storedEmail);

        // Privacy rule: Only load orders belonging to the current user/client
        if (clientEmails.length === 0) {
          setExistingOrders([]);
          return;
        }

        const { data, error } = await supabase
          .from("Order")
          .select("id, deliveryInfo, Customer(email, phone)")
          .order("createdAt", { ascending: false });

        if (error) throw error;
        if (data) {
          const filteredUserOrders = data.filter((o: any) => {
            const email = (o.deliveryInfo?.customerEmail || o.Customer?.email || "").toLowerCase();
            return clientEmails.some((e) => e.toLowerCase() === email);
          });
          setExistingOrders(filteredUserOrders);
        }
      } catch (e) {
        console.error("Error loading existing orders:", e);
      }
    }
    loadOrders();
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !phoneOrEmail) {
      setErrorMsg("Please enter both Order ID and Phone/Email.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setTrackedOrder(null);

    try {
      const cleanOrderId = orderId.trim().toUpperCase();
      const contact = phoneOrEmail.trim().toLowerCase();

      const { data: order, error } = await supabase
        .from("Order")
        .select("*, Customer(*), GiftBox(*)")
        .eq("id", cleanOrderId)
        .maybeSingle();

      if (error) throw error;

      if (!order) {
        setErrorMsg("Order not found or contact details do not match.");
        setIsLoading(false);
        return;
      }

      // Check if email or phone matches (checks customer table or deliveryInfo)
      const customerEmail = order.deliveryInfo?.customerEmail || order.Customer?.email || "";
      const customerPhone = order.deliveryInfo?.customerPhone || order.Customer?.phone || "";

      // Remove symbols from phone for matching
      const cleanInputPhone = contact.replace(/[^0-9]/g, "");
      const cleanDbPhone = customerPhone.replace(/[^0-9]/g, "");

      const matchEmail = customerEmail.toLowerCase() === contact;
      const matchPhone = cleanDbPhone !== "" && cleanInputPhone !== "" && (cleanDbPhone.includes(cleanInputPhone) || cleanInputPhone.includes(cleanDbPhone));

      if (matchEmail || matchPhone) {
        setTrackedOrder({
          id: order.id,
          customerPhone: customerPhone,
          customerEmail: customerEmail,
          customerName: order.deliveryInfo?.customerName || order.Customer?.name || "Client",
          boxName: order.GiftBox?.name || "Custom Afkar AlDar Gift Box",
          occasion: order.occasionSlug,
          status: order.status,
          createdAt: new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          deliveryAddress: `${order.deliveryInfo?.buildingVilla || ""}, ${order.deliveryInfo?.street || ""}, ${order.deliveryInfo?.emirate || ""}`,
          finalPrice: order.finalPrice ? Number(order.finalPrice) : null,
          checkoutActive: order.checkoutActive,
          checkoutSlug: order.checkoutSlug,
        });
      } else {
        setErrorMsg("Order not found or contact details do not match.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTimelineSteps = (status: string) => {
    const steps = [
      { id: "NEW_REQUEST", label: "Request Submitted", desc: "We've received your design selections." },
      { id: "DETAILS_CONFIRMED", label: "Details Confirmed", desc: "Our advisor has finalized details with you." },
      { id: "AWAITING_PAYMENT", label: "Awaiting Payment", desc: "Your custom payment link is active." },
      { id: "PAID", label: "Paid & Preparing", desc: "Crafting your box in our workshop." },
      { id: "DELIVERED", label: "Delivered", desc: "Hand-delivered with utmost care." },
    ];

    const getStatusIndex = (currentStatus: string) => {
      if (["NEW_REQUEST", "CONTACTED"].includes(currentStatus)) return 0;
      if (currentStatus === "DETAILS_CONFIRMED" || currentStatus === "PRICE_CONFIRMED") return 1;
      if (currentStatus === "AWAITING_PAYMENT") return 2;
      if (["PAID", "DEPOSIT_PAID", "PREPARING", "SHIPPED"].includes(currentStatus)) return 3;
      if (currentStatus === "DELIVERED") return 4;
      return -1;
    };

    const activeIdx = getStatusIndex(status);

    return (
      <div className="space-y-6 pt-4">
        {steps.map((step, idx) => {
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;
          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all text-xs font-bold ${
                    isCurrent
                      ? "bg-[#AD7D39] text-white border-[#AD7D39] ring-4 ring-[#AD7D39]/20"
                      : isDone
                      ? "bg-[#191611] text-[#D4BA99] border-[#191611]"
                      : "bg-[#FBF8F3] text-[#8A8378] border-[#3C2D1E]/15"
                  }`}
                >
                  {isDone ? "✓" : idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-0.5 h-10 ${isDone ? "bg-[#191611]" : "bg-[#3C2D1E]/10"}`} />
                )}
              </div>
              <div className="pt-0.5">
                <h4 className={`text-xs font-bold tracking-wide uppercase ${isCurrent ? "text-[#AD7D39]" : "text-[#191611]"}`}>
                  {step.label}
                </h4>
                <p className="text-[10px] text-[#625D55] leading-relaxed mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#AD7D39] font-bold">Secure Order Lookup</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#191611]">
          Track Your Custom Curation
        </h1>
        <p className="text-xs text-[#625D55] leading-relaxed">
          Verify the status of your Afkar AlDar gift box request from design submission to delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Lookup Form */}
        <div className="lg:col-span-5 luxury-card p-6 bg-white border border-[#3C2D1E]/10 space-y-5">
          <h3 className="font-serif font-bold text-base text-[#191611]">Enter Request Details</h3>
          
          <form onSubmit={handleLookup} className="space-y-4">
            {existingOrders.length > 0 && (
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-[#AD7D39] uppercase mb-1">
                  Select From Your Orders
                </label>
                <select
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const matched = existingOrders.find((o) => o.id === selectedId);
                    if (matched) {
                      setOrderId(matched.id);
                      const email = matched.deliveryInfo?.customerEmail || matched.Customer?.email || "";
                      const phone = matched.deliveryInfo?.customerPhone || matched.Customer?.phone || "";
                      setPhoneOrEmail(email || phone || "");
                    }
                  }}
                  className="w-full p-2.5 rounded-lg border border-[#AD7D39]/30 text-xs text-[#7D5121] bg-[#FBF8F3] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none font-sans font-semibold"
                >
                  <option value="">-- Choose an Order to Autofill --</option>
                  {existingOrders.map((o) => {
                    const name = o.deliveryInfo?.customerName || "Guest Client";
                    return (
                      <option key={o.id} value={o.id}>
                        {o.id} - {name}
                      </option>
                     );
                  })}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#625D55] uppercase mb-1">
                Order ID / Request Reference *
              </label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. AFK-892101"
                className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#625D55] uppercase mb-1">
                Phone or Email *
              </label>
              <input
                type="text"
                required
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                placeholder="e.g. +971 50 123 4567 or email"
                className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <TrackedButton
              type="submit"
              disabled={isLoading}
              button_location="navbar"
              variant="gold"
              size="md"
              className="w-full text-xs font-bold uppercase tracking-wider gap-2 py-3"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? "Searching..." : "Track My Request"}</span>
            </TrackedButton>
          </form>
        </div>

        {/* Right Side: Results Display */}
        <div className="lg:col-span-7">
          {trackedOrder ? (
            <div className="luxury-card p-6 bg-white border border-[#AD7D39]/20 space-y-6 animate-in fade-in duration-300">
              
              {/* Order Info Card Header */}
              <div className="flex items-center justify-between border-b border-[#3C2D1E]/10 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A8378]">Order Reference</span>
                  <h3 className="font-serif text-xl font-bold text-[#191611]">#{trackedOrder.id}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A8378] block">Date Placed</span>
                  <span className="text-xs font-semibold text-[#191611]">{trackedOrder.createdAt}</span>
                </div>
              </div>

              {/* Box Details Card */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#8A8378] block">Box Curation</span>
                  <span className="font-semibold text-[#191611]">{trackedOrder.boxName}</span>
                </div>
                <div>
                  <span className="text-[#8A8378] block">Destination</span>
                  <span className="font-semibold text-[#191611]">{trackedOrder.deliveryAddress}</span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="pt-2 border-t border-[#3C2D1E]/10">
                <span className="text-xs uppercase tracking-widest text-[#AD7D39] font-bold block mb-4">
                  Curation Progress
                </span>
                {getTimelineSteps(trackedOrder.status)}
              </div>

              {/* Dynamic Payment Card Action */}
              {trackedOrder.checkoutActive && (
                <div className="p-4 rounded-xl bg-[#F6F0E7] border border-[#AD7D39]/30 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#191611]">Payment Link is Active</span>
                    <span className="font-mono font-bold text-[#AD7D39]">{formatCurrency(trackedOrder.finalPrice)}</span>
                  </div>
                  <Link href={`/pay/${trackedOrder.checkoutSlug}`} className="block">
                    <TrackedButton
                      button_location="checkout"
                      variant="gold"
                      size="sm"
                      className="w-full gap-2 text-xs font-bold uppercase"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Review & Complete Payment</span>
                    </TrackedButton>
                  </Link>
                </div>
              )}

            </div>
          ) : (
            <div className="border border-dashed border-[#3C2D1E]/20 rounded-2xl p-12 text-center text-xs text-[#8A8378] flex flex-col items-center justify-center gap-3 h-full min-h-[300px]">
              <Search className="w-10 h-10 text-[#AD7D39]/40 stroke-[1.25]" />
              <p>Enter your Order ID and contact details to view live curation updates.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
