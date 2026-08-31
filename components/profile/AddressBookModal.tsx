"use client";

import React, { useState, useEffect } from "react";
import { X, MapPin, Building, User, Phone, Check } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";

export interface AddressItem {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  emirate: string;
  street: string;
  buildingVilla: string;
  notes?: string;
  isDefault?: boolean;
}

interface AddressBookModalProps {
  address: AddressItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: AddressItem) => void;
}

const EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];

export default function AddressBookModal({ address, isOpen, onClose, onSave }: AddressBookModalProps) {
  const [label, setLabel] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [emirate, setEmirate] = useState("Dubai");
  const [street, setStreet] = useState("");
  const [buildingVilla, setBuildingVilla] = useState("");
  const [notes, setNotes] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (address) {
      setLabel(address.label || "");
      setRecipientName(address.recipientName || "");
      setPhone(address.phone || "");
      setEmirate(address.emirate || "Dubai");
      setStreet(address.street || "");
      setBuildingVilla(address.buildingVilla || "");
      setNotes(address.notes || "");
      setIsDefault(!!address.isDefault);
    } else {
      setLabel("Home / Villa");
      setRecipientName("");
      setPhone("+971 ");
      setEmirate("Dubai");
      setStreet("");
      setBuildingVilla("");
      setNotes("");
      setIsDefault(false);
    }
  }, [address, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: AddressItem = {
      id: address ? address.id : `addr_${Date.now()}`,
      label: label.trim() || "Delivery Location",
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      emirate,
      street: street.trim(),
      buildingVilla: buildingVilla.trim(),
      notes: notes.trim(),
      isDefault,
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4BA99]">Gifting Address Book</span>
            <h2 className="font-serif text-xl font-bold text-white mt-0.5">
              {address ? "Edit Recipient Address" : "Add New Delivery Address"}
            </h2>
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
              Address Label / Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Palm Jumeirah Villa, DIFC Office, Sister's Apartment"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#625D55] mb-1">
                Recipient Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#625D55] mb-1">
                Recipient Mobile / Phone
              </label>
              <input
                type="tel"
                required
                placeholder="+971 50 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#625D55] mb-1">
                Emirate / Region
              </label>
              <select
                value={emirate}
                onChange={(e) => setEmirate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none bg-white"
              >
                {EMIRATES.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#625D55] mb-1">
                Building / Villa / Suite
              </label>
              <input
                type="text"
                required
                placeholder="Villa 24 / Apartment 802"
                value={buildingVilla}
                onChange={(e) => setBuildingVilla(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#625D55] mb-1">
              Street / Area / Landmark
            </label>
            <input
              type="text"
              required
              placeholder="Al Wasl Road, near City Walk"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#625D55] mb-1">
              Delivery Notes / Security Gate Instructions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Leave with gate reception or call 10 mins prior to arrival"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-[#AD7D39] rounded border-gray-300 focus:ring-[#AD7D39]"
            />
            <label htmlFor="isDefault" className="text-xs text-[#191611] font-medium cursor-pointer">
              Set as my primary default delivery address
            </label>
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
              button_location="address_book_modal"
              variant="gold"
              size="md"
              className="px-6 py-2.5 uppercase font-bold text-xs"
            >
              <span>Save Address</span>
            </TrackedButton>
          </div>

        </form>

      </div>
    </div>
  );
}
