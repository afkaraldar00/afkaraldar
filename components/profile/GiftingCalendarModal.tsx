"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Gift, Bell, Heart } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";

export interface GiftingOccasionItem {
  id: string;
  title: string;
  recipientName: string;
  occasionDate: string; // YYYY-MM-DD
  occasionSlug: string;
  reminderDaysBefore: number;
  notes?: string;
}

interface GiftingCalendarModalProps {
  occasion: GiftingOccasionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: GiftingOccasionItem) => void;
}

const OCCASIONS_LIST = [
  { slug: "birthday", name: "Birthday Celebration" },
  { slug: "wedding", name: "Wedding & Anniversary" },
  { slug: "graduation", name: "Graduation & Milestone" },
  { slug: "new-baby", name: "New Baby & Parenthood" },
  { slug: "corporate", name: "Corporate Gifting" },
  { slug: "just-because", name: "Special Gesture / Just Because" },
];

export default function GiftingCalendarModal({ occasion, isOpen, onClose, onSave }: GiftingCalendarModalProps) {
  const [title, setTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [occasionDate, setOccasionDate] = useState("");
  const [occasionSlug, setOccasionSlug] = useState("birthday");
  const [reminderDaysBefore, setReminderDaysBefore] = useState(7);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (occasion) {
      setTitle(occasion.title || "");
      setRecipientName(occasion.recipientName || "");
      setOccasionDate(occasion.occasionDate || "");
      setOccasionSlug(occasion.occasionSlug || "birthday");
      setReminderDaysBefore(occasion.reminderDaysBefore || 7);
      setNotes(occasion.notes || "");
    } else {
      setTitle("");
      setRecipientName("");
      // Default to 14 days from today
      const future = new Date();
      future.setDate(future.getDate() + 14);
      setOccasionDate(future.toISOString().split("T")[0]);
      setOccasionSlug("birthday");
      setReminderDaysBefore(7);
      setNotes("");
    }
  }, [occasion, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: GiftingOccasionItem = {
      id: occasion ? occasion.id : `occ_rem_${Date.now()}`,
      title: title.trim() || `${recipientName}'s Special Day`,
      recipientName: recipientName.trim(),
      occasionDate,
      occasionSlug,
      reminderDaysBefore: Number(reminderDaysBefore),
      notes: notes.trim(),
    };
    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#AD7D39]/30 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-[#191611] text-white flex items-center justify-between border-b border-[#AD7D39]/30">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4BA99]">Gifting Reminder Calendar</span>
            <h2 className="font-serif text-xl font-bold text-white mt-0.5">
              {occasion ? "Edit Gifting Reminder" : "Add Gifting Occasion Date"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8A8378] hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-[#292725]">
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#625D55] mb-1">
              Event Title / Label
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mom's 60th Birthday, Wedding Anniversary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#625D55] mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                required
                placeholder="Recipient Name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#625D55] mb-1">
                Occasion Type
              </label>
              <select
                value={occasionSlug}
                onChange={(e) => setOccasionSlug(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none bg-white"
              >
                {OCCASIONS_LIST.map((o) => (
                  <option key={o.slug} value={o.slug}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#625D55] mb-1">
                Occasion Date
              </label>
              <input
                type="date"
                required
                value={occasionDate}
                onChange={(e) => setOccasionDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#625D55] mb-1">
                Reminder Notification Lead Time
              </label>
              <select
                value={reminderDaysBefore}
                onChange={(e) => setReminderDaysBefore(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none bg-white"
              >
                <option value={3}>3 Days Before</option>
                <option value={7}>7 Days Before (Recommended)</option>
                <option value={14}>14 Days Before</option>
                <option value={30}>30 Days Before (Corporate)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#625D55] mb-1">
              Gifting Preferences & Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Loves emerald velvet, white roses, and customized gold monogram card"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              button_location="gifting_calendar_modal"
              variant="gold"
              size="md"
              className="px-6 py-2.5 uppercase font-bold text-xs"
            >
              <span>Save Reminder</span>
            </TrackedButton>
          </div>

        </form>

      </div>
    </div>
  );
}
