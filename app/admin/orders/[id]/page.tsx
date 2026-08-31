"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, CheckCircle2, Copy, Send, MessageCircle, DollarSign, ShieldCheck, Clock, RefreshCw, ExternalLink, Printer, Gift, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/dictionary";
import TrackedButton from "@/components/ui/TrackedButton";
import { supabase } from "@/lib/supabase/client";
import { useAdminGuard } from "@/lib/hooks/useAdminGuard";

export default function SingleOrderAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAdmin, isLoading: isAdminLoading } = useAdminGuard();

  // Loading & Database state
  const [order, setOrder] = useState<any>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState<boolean>(true);
  const [status, setStatus] = useState<string>("NEW_REQUEST");
  const [finalPrice, setFinalPrice] = useState<string>("380.00");
  const [paymentType, setPaymentType] = useState<"FULL" | "DEPOSIT">("FULL");
  const [depositAmount, setDepositAmount] = useState<string>("190.00");
  const [checkoutActive, setCheckoutActive] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [statusEvents, setStatusEvents] = useState<any[]>([]);

  // Fetch Order details and history from database
  useEffect(() => {
    async function fetchOrderData() {
      try {
        const { data, error } = await supabase
          .from("Order")
          .select("*, Customer(*)")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setOrder(data);
          setStatus(data.status);
          setFinalPrice(data.finalPrice ? data.finalPrice.toString() : "380.00");
          setPaymentType(data.paymentType || "FULL");
          setDepositAmount(data.depositAmount ? data.depositAmount.toString() : "190.00");
          setCheckoutActive(data.checkoutActive || false);
        }
      } catch (err) {
        console.error("Error loading order from db:", err);
      } finally {
        setIsLoadingOrder(false);
      }
    }

    async function fetchEventsData() {
      try {
        const { data, error } = await supabase
          .from("OrderStatusEvent")
          .select("*")
          .eq("orderId", id)
          .order("createdAt", { ascending: false });

        if (error) throw error;
        if (data) {
          setStatusEvents(data.map((evt: any) => ({
            status: evt.status,
            note: evt.note,
            time: new Date(evt.createdAt).toLocaleString(),
          })));
        }
      } catch (err) {
        console.error("Error loading status events:", err);
      }
    }

    if (isAdmin) {
      fetchOrderData();
      fetchEventsData();
    }
  }, [id, isAdmin]);

  const checkoutSlug = order?.checkoutSlug || `pay-${id.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  const checkoutUrl = typeof window !== "undefined" ? `${window.location.origin}/pay/${checkoutSlug}` : `/pay/${checkoutSlug}`;

  // Fallback to database or defaults
  const customization = order?.customization || {
    boxStyle: { boxColor: "Royal Emerald Velvet", boxSize: "Standard Luxe" },
    selectedItems: ["Artisanal Swiss Pralines (12 pcs)", "Royal Oud Extract (30ml)", "Scented Soy Candle"],
    cardAndRibbon: {
      cardMessage: "Dearest Sarah & Ahmed, wishing you a lifetime of love, joy, and endless prosperity on your special celebration!",
      senderNameOnCard: "With love, Fatima & Hamdan",
      ribbonColor: "Gold Satin Ribbon",
      monogramInitials: "S & A",
    },
  };

  const deliveryInfo = order?.deliveryInfo || {
    customerName: "Sarah Al Mansoori",
    customerEmail: "sarah@example.ae",
    customerPhone: "+971 50 123 4567",
    recipientName: "Sarah & Ahmed",
    emirate: "Dubai",
    deliveryAddress: "Villa 42, Al Wasl Road, Jumeirah 2, Dubai",
    preferredDeliveryDate: "2026-08-30",
    specialRequests: "Please wrap in extra gold tissue paper and ensure afternoon delivery.",
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setStatus(newStatus);
      setStatusEvents([
        { status: newStatus, note: `Status manually updated to ${newStatus}`, time: new Date().toLocaleString() },
        ...statusEvents,
      ]);
    } catch (err: any) {
      console.error(err);
      alert("Failed to update status: " + err.message);
    }
  };

  const handleActivateCheckout = async () => {
    try {
      const res = await fetch("/api/admin/orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: "AWAITING_PAYMENT",
          finalPrice: parseFloat(finalPrice),
          paymentType,
          depositAmount: paymentType === "DEPOSIT" ? parseFloat(depositAmount) : null,
          checkoutActive: true
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setCheckoutActive(true);
      setStatus("AWAITING_PAYMENT");
      setStatusEvents([
        { status: "AWAITING_PAYMENT", note: `Checkout page activated. Final price: AED ${finalPrice} (${paymentType})`, time: new Date().toLocaleString() },
        ...statusEvents,
      ]);
      alert("Private checkout page activated successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to activate checkout: " + err.message);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(checkoutUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrintPackingSlip = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Packing Slip #${id}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; margin: 40px; color: #191611; }
            .header { border-bottom: 2px solid #AD7D39; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
            .box { background: #FBF8F3; padding: 15px; border-radius: 8px; border: 1px solid #E9DBC6; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border-bottom: 1px solid #E9DBC6; padding: 10px; text-align: left; font-size: 12px; }
            th { background: #F6F0E7; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin:0; font-size:24px;">AFKAR ALDAR</h1>
              <p style="margin:4px 0 0 0; font-size:12px; color:#625D55;">Bespoke Curation Packing Slip</p>
            </div>
            <div style="text-align:right; font-size:12px;">
              <strong>ORDER #${id}</strong><br/>
              Date: ${new Date().toLocaleDateString()}
            </div>
          </div>

          <div class="box">
            <h3 style="margin:0 0 8px 0; font-size:14px;">DESTINATION ADDRESS</h3>
            <p style="margin:0; font-size:12px; line-height:1.5;">
              <strong>Recipient:</strong> ${deliveryInfo.recipientName}<br/>
              <strong>Phone:</strong> ${deliveryInfo.customerPhone}<br/>
              <strong>Address:</strong> ${deliveryInfo.deliveryAddress}, ${deliveryInfo.emirate}
            </p>
          </div>

          <h3>BOX CURATION CONTENTS</h3>
          <table>
            <thead>
              <tr>
                <th>Item Specification</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Box Style</td><td>${customization.boxStyle.boxColor}</td></tr>
              <tr><td>Ribbon</td><td>${customization.cardAndRibbon.ribbonColor}</td></tr>
              <tr><td>Monogram</td><td>${customization.cardAndRibbon.monogramInitials}</td></tr>
              <tr><td>Curated Items</td><td>${customization.selectedItems.join(", ")}</td></tr>
            </tbody>
          </table>

          <div class="box" style="margin-top:20px;">
            <h3 style="margin:0 0 8px 0; font-size:14px;">CALLIGRAPHY CARD PROOF</h3>
            <p style="margin:0; font-size:13px; font-style:italic;">"${customization.cardAndRibbon.cardMessage}"</p>
            <p style="margin:4px 0 0 0; font-size:11px; font-weight:bold; color:#AD7D39;">- ${customization.cardAndRibbon.senderNameOnCard}</p>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const whatsappShareText = encodeURIComponent(
    `Hello ${deliveryInfo.customerName},\n\nYour customized gift box order #${id} is ready for review & payment!\n\nView order details & complete payment safely here:\n${checkoutUrl}\n\nThank you for choosing Afkar Aldar.`
  );

  if (isAdminLoading || !isAdmin || isLoadingOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 text-[#AD7D39] animate-spin" />
        <p className="text-sm font-semibold text-[#8A8378]">{isAdminLoading ? "Verifying admin access..." : "Loading order details from database..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3C2D1E]/10 pb-6">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-semibold text-[#AD7D39] hover:underline mb-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl font-bold text-[#191611]">Order #{id}</h1>
            <span className="text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-[#191611] text-[#D4BA99]">
              {status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintPackingSlip}
            className="px-4 py-2.5 rounded-xl bg-[#F6F0E7] text-[#191611] hover:bg-[#E9DBC6] text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-[#AD7D39]" />
            <span>Print Packing Slip</span>
          </button>

          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="p-2.5 rounded-xl border border-[#3C2D1E]/20 text-xs font-bold text-[#191611] bg-white focus:ring-2 focus:ring-[#AD7D39] focus:outline-none shadow-sm"
          >
            <option value="NEW_REQUEST">NEW REQUEST</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="DETAILS_CONFIRMED">DETAILS CONFIRMED</option>
            <option value="PRICE_CONFIRMED">PRICE CONFIRMED</option>
            <option value="AWAITING_PAYMENT">AWAITING PAYMENT</option>
            <option value="DEPOSIT_PAID">DEPOSIT PAID</option>
            <option value="PAID">PAID IN FULL</option>
            <option value="PREPARING">PREPARING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Order Customization & Recipient Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Customization Details */}
          <div className="luxury-card p-6 bg-white space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#191611] border-b border-[#3C2D1E]/10 pb-3 flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#AD7D39]" /> Bespoke Customization Specs
            </h2>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#8A8378] block text-[10px] font-bold uppercase">Box Color & Style</span>
                <span className="font-semibold text-[#191611]">{customization.boxStyle.boxColor} ({customization.boxStyle.boxSize})</span>
              </div>
              <div>
                <span className="text-[#8A8378] block text-[10px] font-bold uppercase">Monogram Initials</span>
                <span className="font-semibold text-[#AD7D39] tracking-widest font-mono">{customization.cardAndRibbon.monogramInitials || "None"}</span>
              </div>
              <div>
                <span className="text-[#8A8378] block text-[10px] font-bold uppercase">Ribbon Accents</span>
                <span className="font-semibold text-[#191611]">{customization.cardAndRibbon.ribbonColor}</span>
              </div>
            </div>

            {/* Selected Items */}
            <div className="pt-2">
              <span className="text-xs text-[#8A8378] font-bold block mb-2">Curated Box Contents ({customization.selectedItems.length} items):</span>
              <div className="flex flex-wrap gap-2">
                {customization.selectedItems.map((item: any, idx: number) => (
                  <span key={idx} className="text-xs px-3 py-1 rounded-lg bg-[#FBF8F3] text-[#292725] border border-[#3C2D1E]/10 font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Printed Card Message */}
            <div className="p-4 rounded-xl bg-[#F6F0E7]/60 border border-[#AD7D39]/20 space-y-2 text-xs">
              <span className="font-serif font-bold text-[#191611] block">Gold Calligraphy Card Message:</span>
              <p className="italic text-[#625D55] font-serif">&quot;{customization.cardAndRibbon.cardMessage}&quot;</p>
              <span className="text-[11px] font-bold text-[#AD7D39] block">- {customization.cardAndRibbon.senderNameOnCard}</span>
            </div>

          </div>

          {/* Delivery & Recipient Details */}
          <div className="luxury-card p-6 bg-white space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#191611] border-b border-[#3C2D1E]/10 pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#AD7D39]" /> Delivery & Recipient Information
            </h2>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#8A8378] block text-[10px] font-bold uppercase">Customer Name</span>
                <span className="font-semibold text-[#191611]">{deliveryInfo.customerName}</span>
              </div>
              <div>
                <span className="text-[#8A8378] block text-[10px] font-bold uppercase">Email Address</span>
                <span className="font-semibold text-[#191611] font-mono">{deliveryInfo.customerEmail}</span>
              </div>
              <div>
                <span className="text-[#8A8378] block text-[10px] font-bold uppercase">Phone / WhatsApp</span>
                <span className="font-semibold text-[#191611] font-mono">{deliveryInfo.customerPhone}</span>
              </div>
              <div>
                <span className="text-[#8A8378] block text-[10px] font-bold uppercase">Emirate</span>
                <span className="font-semibold text-[#191611]">{deliveryInfo.emirate}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#8A8378] block text-[10px] font-bold uppercase">Delivery Address</span>
                <span className="font-semibold text-[#191611]">{deliveryInfo.deliveryAddress}</span>
              </div>
            </div>

            {deliveryInfo.specialRequests && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block">Customer Special Request:</span>
                <span>{deliveryInfo.specialRequests}</span>
              </div>
            )}
          </div>

          {/* Status Audit History Log */}
          <div className="luxury-card p-6 bg-white space-y-3">
            <h3 className="font-serif text-lg font-bold text-[#191611] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#AD7D39]" />
              Order Status Audit Trail
            </h3>

            <div className="space-y-2 text-xs">
              {statusEvents.map((evt, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#F6F0E7]/60 border border-[#3C2D1E]/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#191611] block">{evt.status}</span>
                    <span className="text-[#625D55]">{evt.note}</span>
                  </div>
                  <span className="text-[10px] text-[#8A8378] font-mono">{evt.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Pricing & Checkout Activation Widget */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="luxury-card p-6 bg-white border-2 border-[#AD7D39]/30 space-y-6">
            <div className="flex items-center justify-between border-b border-[#3C2D1E]/10 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#AD7D39]" />
                <h2 className="font-serif text-xl font-bold text-[#191611]">Pricing & Checkout Controls</h2>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  checkoutActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
                }`}
              >
                {checkoutActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>

            {/* Price Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#191611] mb-1">
                  Confirmed Final Price (AED) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={finalPrice}
                  onChange={(e) => {
                    setFinalPrice(e.target.value);
                    const val = parseFloat(e.target.value) || 0;
                    setDepositAmount((val / 2).toFixed(2));
                  }}
                  className="w-full p-3 rounded-xl border border-[#3C2D1E]/20 font-mono font-bold text-xl text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
                />
              </div>

              {/* Payment Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#191611] mb-1">
                  Payment Type Required
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentType("FULL")}
                    className={`p-3 rounded-xl border text-center font-bold transition-all ${
                      paymentType === "FULL"
                        ? "bg-[#191611] text-[#D4BA99] border-[#191611]"
                        : "bg-[#F6F0E7] text-[#292725] border-transparent"
                    }`}
                  >
                    Full Payment (100%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType("DEPOSIT")}
                    className={`p-3 rounded-xl border text-center font-bold transition-all ${
                      paymentType === "DEPOSIT"
                        ? "bg-[#191611] text-[#D4BA99] border-[#191611]"
                        : "bg-[#F6F0E7] text-[#292725] border-transparent"
                    }`}
                  >
                    50% Deposit
                  </button>
                </div>
              </div>

              {paymentType === "DEPOSIT" && (
                <div className="p-3 rounded-xl bg-[#F6F0E7] border border-[#AD7D39]/20 text-xs flex items-center justify-between">
                  <span className="text-[#625D55]">Computed Deposit Due Now:</span>
                  <span className="font-mono font-bold text-[#AD7D39]">AED {depositAmount}</span>
                </div>
              )}
            </div>

            {/* Activate Checkout Action Button */}
            <div>
              <TrackedButton
                type="button"
                onClick={handleActivateCheckout}
                button_location="admin"
                variant="gold"
                size="md"
                className="w-full uppercase font-bold text-xs py-3.5 gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{checkoutActive ? "Update Active Checkout Page" : "Activate Private Checkout Page"}</span>
              </TrackedButton>
            </div>

            {/* Share Payment Link Options */}
            {checkoutActive && (
              <div className="space-y-3 pt-4 border-t border-[#3C2D1E]/10 animate-in fade-in duration-300">
                <span className="text-xs uppercase tracking-widest text-[#AD7D39] font-bold block">
                  Share Checkout URL
                </span>

                <div className="flex items-center gap-2 p-2.5 bg-[#F6F0E7] rounded-xl border border-[#3C2D1E]/10 text-xs font-mono truncate">
                  <span className="truncate flex-1">{checkoutUrl}</span>
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg bg-[#191611] text-white hover:bg-[#AD7D39] transition-colors shrink-0"
                    title="Copy Link"
                  >
                    {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <a
                    href={`https://wa.me/${deliveryInfo.customerPhone.replace(/[^0-9]/g, "")}?text=${whatsappShareText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#1ebd59] transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Send via WhatsApp</span>
                  </a>

                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-[#191611] text-[#D4BA99] font-semibold hover:bg-[#29231C] transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Preview Pay Page</span>
                  </a>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
