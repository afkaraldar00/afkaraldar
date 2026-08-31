"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, CheckCircle2, Lock, Gift, ChevronDown, MessageCircle, Heart, ArrowRight } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";
import { formatCurrency } from "@/lib/dictionary";
import { track } from "@/lib/analytics/track";
import { supabase } from "@/lib/supabase/client";
import confetti from "canvas-confetti";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

function CheckoutForm({ amountDue, checkoutSlug }: { amountDue: number; checkoutSlug: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pay/${checkoutSlug}?success=true`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "An unexpected error occurred.");
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />
      
      {message && (
        <div className="p-3 py-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold leading-relaxed">
          {message}
        </div>
      )}

      <TrackedButton
        type="submit"
        button_location="checkout"
        variant="gold"
        size="lg"
        disabled={isProcessing || !stripe || !elements}
        className="w-full text-base font-bold gap-2 py-4 shadow-xl hover:shadow-2xl"
      >
        <Lock className="w-5 h-5" />
        <span>{isProcessing ? "Processing Payment..." : `Pay ${formatCurrency(amountDue)} Now`}</span>
      </TrackedButton>
    </form>
  );
}

export default function BrandedCheckoutPage({ params }: { params: Promise<{ checkoutSlug: string }> }) {
  const { checkoutSlug } = use(params);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSummaryMobile, setShowSummaryMobile] = useState<boolean>(true);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [gatewayError, setGatewayError] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    async function loadStripeKey() {
      try {
        const res = await fetch("/api/pay/config");
        const { stripePublishableKey } = await res.json();
        if (stripePublishableKey) {
          setStripePromise(loadStripe(stripePublishableKey));
        }
      } catch (err) {
        console.error("Error loading stripe key from API:", err);
      }
    }
    loadStripeKey();
  }, []);

  useEffect(() => {
    async function loadOrder() {
      try {
        const { data: order, error } = await supabase
          .from("Order")
          .select("*, Customer(*), GiftBox(*)")
          .eq("checkoutSlug", checkoutSlug)
          .maybeSingle();

        if (error) throw error;

        if (order) {
          const isOrderAlreadyPaid = ["PAID", "DEPOSIT_PAID", "PREPARING", "SHIPPED", "DELIVERED"].includes(order.status);
          if (isOrderAlreadyPaid) {
            setIsPaid(true);
          }

          setOrderDetails({
            id: order.id,
            boxName: order.GiftBox?.name || "Custom Gift Box",
            occasion: order.occasionSlug,
            image: order.GiftBox?.images?.[0] || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000",
            boxColor: order.customization?.boxColor || "Custom Velvet Box",
            monogram: order.customization?.cardAndRibbon?.monogramInitials || "N/A",
            ribbon: order.customization?.cardAndRibbon?.ribbonColor || "N/A",
            selectedItems: order.customization?.selectedItems || [],
            cardMessage: order.customization?.cardAndRibbon?.cardMessage || "",
            senderName: order.customization?.cardAndRibbon?.senderNameOnCard || "",
            recipientName: order.deliveryInfo?.recipientName || "Valued Client",
            deliveryEmirate: order.deliveryInfo?.emirate || "Dubai",
            deliveryAddress: `${order.deliveryInfo?.buildingVilla || ""}, ${order.deliveryInfo?.street || ""}, ${order.deliveryInfo?.emirate || ""}`,
            deliveryDate: order.deliveryInfo?.preferredDeliveryDate || "TBD",
            finalPrice: order.finalPrice ? Number(order.finalPrice) : 0,
            paymentType: order.paymentType || "FULL",
            amountDue: order.paymentType === "DEPOSIT" ? Number(order.depositAmount || 0) : Number(order.finalPrice || 0),
            checkoutActive: order.checkoutActive,
            status: order.status,
            customerEmail: order.Customer?.email || order.deliveryInfo?.customerEmail || "",
          });
        }
      } catch (err) {
        console.error("Error loading order checkout details:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [checkoutSlug]);

  // Check URL parameters for successful payment redirect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const successParam = params.get("success");
      const paymentIntentSecret = params.get("payment_intent_client_secret");

      if (successParam === "true" || paymentIntentSecret) {
        setIsPaid(true);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#AD7D39", "#D4BA99", "#7D5121"],
        });
      }
    }
  }, []);

  // Fetch clientSecret from create-intent endpoint on mount / order load
  useEffect(() => {
    if (orderDetails && orderDetails.amountDue > 0 && !isPaid) {
      async function createPaymentIntent() {
        try {
          const res = await fetch("/api/pay/create-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              checkoutSlug,
              amount: orderDetails.amountDue,
              currency: "AED",
              customerEmail: orderDetails.customerEmail || "",
            }),
          });
          const data = await res.json();
          if (data.success && data.clientSecret) {
            setClientSecret(data.clientSecret);
            setGatewayError(null);
          } else {
            setGatewayError(data.error || "Failed to initialize payment gateway.");
          }
        } catch (err: any) {
          console.error("Error creating payment intent:", err);
          setGatewayError(err?.message || "Connection error to payment server.");
        }
      }
      createPaymentIntent();
    }
  }, [orderDetails, isPaid, checkoutSlug]);

  const handlePayMock = async () => {
    if (!orderDetails) return;
    setIsProcessing(true);

    try {
      const isDeposit = orderDetails.paymentType === "DEPOSIT";
      const newOrderStatus = isDeposit ? "DEPOSIT_PAID" : "PAID";
      const newPaymentStatus = isDeposit ? "PARTIALLY_PAID" : "PAID";

      await supabase
        .from("Order")
        .update({ status: newOrderStatus })
        .eq("id", orderDetails.id);

      await supabase.from("OrderStatusEvent").insert({
        orderId: orderDetails.id,
        status: newOrderStatus,
        note: `Payment completed successfully via Private Branded Simulator. Amount: AED ${orderDetails.amountDue}`,
      });

      await supabase
        .from("Payment")
        .upsert({
          orderId: orderDetails.id,
          status: newPaymentStatus,
          amountPaid: orderDetails.amountDue,
          providerRef: `pay-sim-${Date.now()}`,
          paidAt: new Date().toISOString(),
          type: orderDetails.paymentType,
          amountDue: orderDetails.amountDue
        }, { onConflict: "orderId" });

      setIsPaid(true);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#AD7D39", "#D4BA99", "#7D5121"],
      });
    } catch (dbErr) {
      console.warn("Error updating DB state inside simulator:", dbErr);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-xs text-[#8A8378] space-y-3">
        <div className="w-8 h-8 border-2 border-[#AD7D39] border-t-transparent rounded-full animate-spin" />
        <span className="font-serif text-sm font-semibold tracking-wider text-[#191611]">Securing Checkout Session...</span>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-200">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#191611]">Secure Payment Link Expired or Invalid</h1>
        <p className="text-xs text-[#625D55] max-w-sm">
          This single-use private payment link could not be loaded. Please check your URL or request a new one from your advisor.
        </p>
        <Link href="/">
          <TrackedButton button_location="checkout" variant="secondary" size="md">
            <span>Return to Home</span>
          </TrackedButton>
        </Link>
      </div>
    );
  }

  if (!orderDetails.checkoutActive && !isPaid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F6F0E7]/60 via-[#FBF8F3] to-[#FBF8F3] py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-8 text-center luxury-card p-8 bg-white border border-[#AD7D39]/20 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-[#AD7D39] border border-amber-200 flex items-center justify-center mx-auto animate-pulse">
            <Gift className="w-8 h-8" />
          </div>
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#AD7D39]">Curation Pending Review</span>
            <h1 className="font-serif text-3xl font-bold text-[#191611]">Your Custom Gift Box is Under Review</h1>
            <p className="text-xs text-[#625D55] leading-relaxed max-w-md mx-auto">
              Our gifting advisor is currently finalizing items, custom ribbon branding, or shipping logs for your request (<strong>Order #{orderDetails.id}</strong>).
            </p>
            <p className="text-xs text-[#AD7D39] font-semibold">
              Once verified, this page will automatically activate so you can complete your payment.
            </p>
          </div>
          <div className="pt-4 border-t border-[#3C2D1E]/10 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={`https://wa.me/971500000000?text=Hello%20Afkar%20Aldar,%20I'm%20checking%20the%20status%20of%20my%20curation%20request%20%23${orderDetails.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white text-xs font-medium hover:bg-[#1ebd59] transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Ask Advisor on WhatsApp</span>
            </a>
            <Link href="/profile">
              <TrackedButton button_location="checkout" variant="secondary" size="md">
                <span>View Dashboard</span>
              </TrackedButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F0E7]/60 via-[#FBF8F3] to-[#FBF8F3] py-8 md:py-16">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-[#AD7D39] flex items-center justify-center text-white font-serif text-lg font-bold">
              A
            </div>
            <span className="font-serif text-2xl font-bold text-[#191611]">Afkar Aldar</span>
          </Link>
          <div className="flex items-center justify-center gap-2 text-xs text-[#7D5121] bg-[#E9DBC6]/60 py-1 px-3 rounded-full w-fit mx-auto font-medium">
            <Lock className="w-3.5 h-3.5 text-[#AD7D39]" />
            <span>Private Branded Checkout • Encrypted 256-Bit SSL</span>
          </div>
        </div>

        {isPaid ? (
          /* Payment Success State */
          <div className="luxury-card p-8 text-center space-y-6 bg-white border-2 border-emerald-500/30 animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-bold text-emerald-700">Payment Confirmed</span>
              <h1 className="font-serif text-3xl font-bold text-[#191611]">
                Thank You! Your Payment Has Been Received
              </h1>
              <p className="text-sm text-[#625D55] max-w-md mx-auto">
                Payment of <span className="font-bold text-[#191611]">{formatCurrency(orderDetails.amountDue)}</span> for Order #{orderDetails.id} was successfully processed.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F6F0E7] text-left text-xs text-[#625D55] space-y-1.5 border border-[#AD7D39]/20">
              <div className="flex justify-between">
                <span className="font-semibold text-[#191611]">Status:</span>
                <span className="text-emerald-700 font-bold">PREPARING (Handcrafted in Workshop)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#191611]">Delivery Destination:</span>
                <span>{orderDetails.deliveryAddress} ({orderDetails.deliveryEmirate})</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#191611]">Target Delivery Date:</span>
                <span>{orderDetails.deliveryDate}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
              <a
                href={`https://wa.me/971500000000?text=Hello%20Afkar%20Aldar,%20I've%20just%20completed%20payment%20for%20order%20%23${orderDetails.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white text-xs font-medium hover:bg-[#1ebd59] transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Notify Gifting Advisor on WhatsApp</span>
              </a>

              <Link href="/">
                <TrackedButton button_location="checkout" variant="secondary" size="md">
                  <span>Return to Website</span>
                </TrackedButton>
              </Link>
            </div>
          </div>
        ) : (
          /* Active Payment Flow */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Order Summary & Customization Readout */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="luxury-card overflow-hidden bg-white border border-[#AD7D39]/20 shadow-md">
                
                {/* Header Toggle for Mobile */}
                <div
                  onClick={() => setShowSummaryMobile(!showSummaryMobile)}
                  className="p-5 border-b border-[#3C2D1E]/10 flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-[#AD7D39] font-bold">Confirmed Order Details</span>
                    <h2 className="font-serif text-xl font-bold text-[#191611]">Order #{orderDetails.id}</h2>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-[#AD7D39] lg:hidden transition-transform ${showSummaryMobile ? "rotate-180" : ""}`} />
                </div>

                {showSummaryMobile && (
                  <div className="p-6 space-y-6 animate-in fade-in duration-200">
                    
                    {/* Main Product Showcase */}
                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#191611] shrink-0 border border-[#AD7D39]/30">
                        <img src={orderDetails.image} alt={orderDetails.boxName} className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#AD7D39]">{orderDetails.occasion}</span>
                        <h3 className="font-serif font-bold text-lg text-[#191611] leading-tight">{orderDetails.boxName}</h3>
                        <p className="text-xs text-[#625D55] mt-0.5">{orderDetails.boxColor} • Monogram ({orderDetails.monogram})</p>
                      </div>
                    </div>

                    {/* Included Items List */}
                    <div className="space-y-2 pt-2 border-t border-[#3C2D1E]/10">
                      <span className="text-xs font-semibold text-[#191611] block">Bespoke Contents Included:</span>
                      <ul className="space-y-1 text-xs text-[#625D55]">
                        {orderDetails.selectedItems.map((item: any, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#AD7D39] shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Card Message */}
                    <div className="p-4 rounded-xl bg-[#F6F0E7] border border-[#AD7D39]/20 text-xs space-y-1">
                      <span className="font-serif font-bold text-[#191611]">Personalized Greeting Card:</span>
                      <p className="italic text-[#625D55]">"{orderDetails.cardMessage}"</p>
                      <span className="text-[11px] font-semibold text-[#AD7D39] block">{orderDetails.senderName}</span>
                    </div>

                    {/* Delivery Destination */}
                    <div className="space-y-1 text-xs text-[#625D55] border-t border-[#3C2D1E]/10 pt-4">
                      <span className="font-semibold text-[#191611] block">White-Glove Delivery Destination:</span>
                      <p>{orderDetails.recipientName} — {orderDetails.deliveryAddress}, {orderDetails.deliveryEmirate}</p>
                      <p className="text-[#8A8378]">Scheduled Date: {orderDetails.deliveryDate}</p>
                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* Right Column: Pricing Summary & Pay Button */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="luxury-card p-6 bg-white border-2 border-[#AD7D39]/30 space-y-6 shadow-lg">
                <div className="space-y-1 border-b border-[#3C2D1E]/10 pb-4">
                  <span className="text-xs uppercase tracking-widest text-[#AD7D39] font-bold">Payment Summary</span>
                  <h3 className="font-serif text-2xl font-bold text-[#191611]">
                    {formatCurrency(orderDetails.amountDue)}
                  </h3>
                  <p className="text-xs text-[#625D55]">
                    {orderDetails.paymentType === "FULL" ? "Full payment for bespoke creation & delivery" : "50% Deposit to initiate hand-assembly"}
                  </p>
                </div>

                {/* Secure Payment Trigger */}
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#F6F0E7] border border-[#3C2D1E]/10 text-xs text-[#625D55] flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#AD7D39] shrink-0" />
                    <span>Stripe UAE Secured Gateway (Apple Pay, Visa, Mastercard, AMEX)</span>
                  </div>

                  {clientSecret && !clientSecret.includes("mock_") && stripePromise ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm amountDue={orderDetails.amountDue} checkoutSlug={checkoutSlug} />
                    </Elements>
                  ) : clientSecret && clientSecret.includes("mock_") ? (
                    <div className="space-y-4">
                      <div className="p-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold leading-relaxed">
                        ⚠️ Stripe is running in Demo Sandbox mode. You can complete this payment using the secure local developer checkout simulator below.
                      </div>
                      <TrackedButton
                        button_location="checkout"
                        variant="gold"
                        size="lg"
                        disabled={isProcessing}
                        onClick={handlePayMock}
                        className="w-full text-base font-bold gap-2 py-4 shadow-xl hover:shadow-2xl"
                      >
                        <Lock className="w-5 h-5" />
                        <span>{isProcessing ? "Processing Sandbox Payment..." : `Confirm Sandbox Payment (AED ${orderDetails.amountDue})`}</span>
                      </TrackedButton>
                    </div>
                  ) : gatewayError ? (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold leading-relaxed space-y-2">
                      <p className="font-bold">⚠️ Payment Gateway Initialization Failed</p>
                      <p className="opacity-90">{gatewayError}</p>
                      <p className="text-[10px] text-rose-600 font-mono mt-1 pt-1 border-t border-rose-200">
                        Please verify that your STRIPE_SECRET_KEY is active and fully configured in Vercel settings.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-[#AD7D39]/30 rounded-xl space-y-2">
                      <div className="w-6 h-6 border-2 border-[#AD7D39] border-t-transparent rounded-full animate-spin" />
                      <p className="text-[11px] text-[#8A8378] font-medium">Securing transaction session...</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 text-center text-xs text-[#8A8378] space-y-1">
                  <p>Encrypted SSL Checkout • Single-Use Order Link</p>
                  <p>Need assistance? Contact us at support@afkaraldar.ae</p>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
