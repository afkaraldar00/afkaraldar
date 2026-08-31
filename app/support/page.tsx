"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, ShieldAlert, MessageCircle, HelpCircle, Phone, Mail } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";

export default function SupportIntakePage() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [category, setCategory] = useState<string>("general");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const categories = [
    { id: "curation", name: "Curation & Box Contents" },
    { id: "delivery", name: "Delivery Status & Changes" },
    { id: "payment", name: "Payment Links & Stripe" },
    { id: "general", name: "General Inquiries" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/support/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          orderId,
          subject: `[${category.toUpperCase()}] ${subject}`,
          message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
      } else {
        alert("Failed to submit support ticket. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9DBC6]/60 text-xs font-semibold text-[#7D5121]">
          <HelpCircle className="w-3.5 h-3.5 text-[#AD7D39]" />
          Gifting Support Desk
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#191611]">
          How Can We Help You?
        </h1>
        <p className="text-xs text-[#625D55] leading-relaxed">
          Open a help ticket and our client services team will assist you within 2–4 business hours.
        </p>
      </div>

      {isSubmitted ? (
        <div className="luxury-card p-8 text-center space-y-6 max-w-xl mx-auto border-2 border-emerald-500/20">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#191611]">Ticket Filed Successfully</h2>
            <p className="text-xs text-[#625D55] leading-relaxed">
              We have received your support inquiry. A gifting advisor will email you shortly or connect via WhatsApp to resolve your issue.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/">
              <TrackedButton button_location="hero" variant="secondary" size="md">
                <span>Return to Home</span>
              </TrackedButton>
            </Link>
            <a
              href="https://wa.me/971500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] text-white text-xs font-medium hover:bg-[#1ebd59] transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Live Support</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 luxury-card p-6 bg-white border border-[#3C2D1E]/10 space-y-4">
            <h3 className="font-serif font-bold text-base text-[#191611] border-b border-[#3C2D1E]/10 pb-3">
              Open Support Ticket
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-[#625D55] uppercase mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Mansoori"
                  className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider text-[#625D55] uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sarah@example.ae"
                  className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-[#625D55] uppercase mb-1">Order ID (Optional)</label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. AFK-892101"
                  className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider text-[#625D55] uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#625D55] uppercase mb-1">Subject *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Delivery address update request"
                className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#625D55] uppercase mb-1">How can we help? *</label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or custom request in detail here..."
                className="w-full p-3 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none leading-relaxed"
              />
            </div>

            <TrackedButton
              type="submit"
              disabled={isSubmitting}
              button_location="navbar"
              variant="gold"
              size="md"
              className="w-full font-bold uppercase tracking-wider text-xs py-3"
            >
              <span>{isSubmitting ? "Submitting Inquiry..." : "Submit Support Inquiry"}</span>
            </TrackedButton>
          </form>

          {/* Right Column: Direct Help Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="luxury-card p-6 bg-[#F6F0E7] border border-[#AD7D39]/20 space-y-4">
              <h4 className="font-serif font-bold text-base text-[#191611]">Direct Gifting Advisor Contacts</h4>
              <p className="text-xs text-[#625D55] leading-relaxed">
                If your request is urgent (e.g. same-day delivery update, spelling correction on a greeting card), please contact us directly.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <a
                  href="https://wa.me/971500000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-lg bg-[#25D366] text-white font-semibold hover:opacity-95 transition-all shadow-sm"
                >
                  <MessageCircle className="w-4.5 h-4.5 fill-current" />
                  <span>WhatsApp Live Support</span>
                </a>

                <div className="p-3 bg-white rounded-lg border border-[#3C2D1E]/10 space-y-2 text-[#625D55]">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#AD7D39]" />
                    <span className="font-medium text-[#191611]">support@afkaraldar.ae</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#AD7D39]" />
                    <span className="font-medium text-[#191611]">+971 50 123 4567</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
