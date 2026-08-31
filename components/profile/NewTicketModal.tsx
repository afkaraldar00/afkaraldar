"use client";

import React, { useState } from "react";
import { X, HelpCircle, MessageSquare, Send } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";

export interface TicketItem {
  id: string;
  orderId?: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

interface NewTicketModalProps {
  ordersList: Array<{ id: string; boxName: string }>;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: TicketItem) => void;
}

const CATEGORIES = [
  { value: "DELIVERY", label: "Delivery Slot / Address Change" },
  { value: "CUSTOMIZATION", label: "Customization Request & Card Message" },
  { value: "BILLING", label: "Pricing & Payment Inquiry" },
  { value: "CORPORATE", label: "Bulk Corporate Gifting Order" },
  { value: "GENERAL", label: "General Inquiry / Gifting Advisor Service" },
];

export default function NewTicketModal({ ordersList, isOpen, onClose, onSubmit }: NewTicketModalProps) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("DELIVERY");
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const ticket: TicketItem = {
      id: `tkt-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: orderId || undefined,
      category,
      subject: subject.trim(),
      message: message.trim(),
      status: "OPEN",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    setTimeout(() => {
      onSubmit(ticket);
      setIsSubmitting(false);
      onClose();
      // Reset form
      setSubject("");
      setMessage("");
      setOrderId("");
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#AD7D39]/30 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-[#191611] text-white flex items-center justify-between border-b border-[#AD7D39]/30">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4BA99]">Support Assistance</span>
            <h2 className="font-serif text-xl font-bold text-white mt-0.5">Open Support Ticket</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8A8378] hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-[#292725]">
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#625D55] mb-1">
              Ticket Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#625D55] mb-1">
              Related Gift Request / Order (Optional)
            </label>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none bg-white"
            >
              <option value="">-- None / General Request --</option>
              {ordersList.map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.id} - {o.boxName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#625D55] mb-1">
              Subject Line
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Urgent update to delivery time slot in Jumeirah"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#625D55] mb-1">
              Detailed Message for Support Team
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe your request or question in detail. Our support team will review and respond promptly."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#3C2D1E]/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold text-[#625D55] hover:bg-[#F6F0E7] transition-colors"
            >
              Cancel
            </button>
            <TrackedButton
              type="submit"
              disabled={isSubmitting}
              button_location="new_ticket_modal"
              variant="gold"
              size="md"
              className="px-6 py-2.5 uppercase font-bold text-xs gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Submitting..." : "Submit Ticket"}</span>
            </TrackedButton>
          </div>

        </form>

      </div>
    </div>
  );
}
