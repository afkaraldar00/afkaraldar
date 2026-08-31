"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Gift } from "lucide-react";
import StepBoxStyle, { BoxStyleConfig } from "@/components/customizer/StepBoxStyle";
import StepItemSelection from "@/components/customizer/StepItemSelection";
import StepCardAndRibbon, { CardAndRibbonConfig } from "@/components/customizer/StepCardAndRibbon";
import StepRecipientInfo, { RecipientInfoConfig } from "@/components/customizer/StepRecipientInfo";
import TrackedButton from "@/components/ui/TrackedButton";
import { track } from "@/lib/analytics/track";

export default function CustomizerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Step 1 State
  const [boxStyle, setBoxStyle] = useState<BoxStyleConfig>({
    boxColor: "emerald-velvet",
    boxSize: "standard",
  });

  // Step 2 State
  const [selectedItems, setSelectedItems] = useState<string[]>(["pralines", "oud-perfume", "scented-candle"]);

  // Step 3 State
  const [cardAndRibbon, setCardAndRibbon] = useState<CardAndRibbonConfig>({
    cardMessage: "",
    senderNameOnCard: "",
    ribbonColor: "gold-satin",
    monogramInitials: "",
    waxSealColor: "gold",
  });

  // Step 4 State
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfoConfig>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    recipientName: "",
    recipientPhone: "",
    emirate: "Dubai",
    deliveryAddress: "",
    preferredDeliveryDate: "",
    specialRequests: "",
  });

  const toggleItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((i) => i !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
      track("add_customization_option", { gift_box_name: slug, product_id: itemId });
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      track("start_customization", { gift_box_name: slug, occasion: slug });
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientInfo.customerName || !recipientInfo.customerEmail || !recipientInfo.customerPhone) {
      alert("Please fill in your name, email, and phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        occasionSlug: slug,
        customization: {
          boxStyle,
          selectedItems,
          cardAndRibbon,
        },
        deliveryInfo: recipientInfo,
      };

      const res = await fetch("/api/requests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        track("submit_order_request", {
          gift_box_name: slug,
          occasion: slug,
          value: 0,
          currency: "AED",
          button_location: "customizer",
        });

        // Store request confirmation details in localStorage for rendering on /request/confirmation
        if (typeof window !== "undefined") {
          localStorage.setItem("last_order_request", JSON.stringify(data.order));
        }

        router.push("/request/confirmation");
      } else {
        alert("Failed to submit order request. Please try again or contact WhatsApp support.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: "Box Style" },
    { num: 2, label: "Items" },
    { num: 3, label: "Card & Ribbon" },
    { num: 4, label: "Delivery Info" },
  ];

  return (
    <div className="py-8 md:py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#AD7D39] font-bold">Interactive Customizer</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#191611]">
          Design Your Custom Gift Box
        </h1>
        <p className="text-xs sm:text-sm text-[#625D55]">
          Step {currentStep} of 4 • Tailoring for {slug.toUpperCase()}
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-between border-b border-[#3C2D1E]/10 pb-4">
        {steps.map((s) => {
          const isCompleted = currentStep > s.num;
          const isCurrent = currentStep === s.num;
          return (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                  isCurrent
                    ? "bg-[#AD7D39] text-white ring-4 ring-[#AD7D39]/20"
                    : isCompleted
                    ? "bg-[#191611] text-[#D4BA99]"
                    : "bg-[#F6F0E7] text-[#8A8378]"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4 text-[#D4BA99]" /> : s.num}
              </div>
              <span className={`hidden sm:inline text-xs font-medium ${isCurrent ? "text-[#191611]" : "text-[#8A8378]"}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Render */}
      <form onSubmit={handleSubmitRequest}>
        <div className="min-h-[380px]">
          {currentStep === 1 && (
            <StepBoxStyle data={boxStyle} onChange={(up) => setBoxStyle({ ...boxStyle, ...up })} />
          )}

          {currentStep === 2 && (
            <StepItemSelection selectedItemIds={selectedItems} onToggleItem={toggleItem} />
          )}

          {currentStep === 3 && (
            <StepCardAndRibbon data={cardAndRibbon} onChange={(up) => setCardAndRibbon({ ...cardAndRibbon, ...up })} />
          )}

          {currentStep === 4 && (
            <StepRecipientInfo data={recipientInfo} onChange={(up) => setRecipientInfo({ ...recipientInfo, ...up })} />
          )}
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center justify-between pt-8 border-t border-[#3C2D1E]/10 mt-8">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs font-medium text-[#292725] hover:bg-[#F6F0E7]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <TrackedButton
              type="button"
              onClick={handleNext}
              button_location="customizer"
              variant="gold"
              size="md"
              eventName="cta_click"
              className="gap-2"
            >
              <span>Continue to Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </TrackedButton>
          ) : (
            <TrackedButton
              type="submit"
              disabled={isSubmitting}
              button_location="customizer"
              variant="gold"
              size="lg"
              eventName="submit_order_request"
              className="gap-2 shadow-lg"
            >
              <Gift className="w-5 h-5" />
              <span>{isSubmitting ? "Submitting Request..." : "Submit Gift Request"}</span>
            </TrackedButton>
          )}
        </div>
      </form>

    </div>
  );
}
