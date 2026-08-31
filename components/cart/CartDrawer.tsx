"use client";

import React from "react";
import Link from "next/link";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { formatCurrency } from "@/lib/dictionary";

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart, totalCount, totalAmount } = useCart();

  if (!isCartOpen) return null;

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    const itemsList = cart
      .map((item) => `• ${item.name} (${item.occasion}) x${item.quantity} - AED ${(item.price * item.quantity).toFixed(2)}`)
      .join("\n");

    const message = encodeURIComponent(
      `Hello Afkar AlDar Concierge! 🎁\n\nI would like to inquire about finalizing my luxury gift box cart:\n\n${itemsList}\n\n*Total Estimated Amount:* AED ${totalAmount.toFixed(2)}\n\nPlease advise on availability and white-glove UAE delivery details.`
    );
    window.open(`https://wa.me/971501234567?text=${message}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-[#191611]">
      {/* Backdrop overlay */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FBF8F3] border-l border-[#AD7D39]/30 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-6 bg-[#191611] text-white border-b border-[#AD7D39]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#AD7D39]/20 text-[#D4BA99] border border-[#AD7D39]/30">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                  <span>Your Luxury Gifting Cart</span>
                  {totalCount > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#AD7D39] text-white">
                      {totalCount} item{totalCount > 1 ? "s" : ""}
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-[#8A8378]">Handcrafted bespoke curations in Dubai</p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-[#8A8378] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-[#AD7D39]/20 flex items-center justify-center text-[#AD7D39]">
                  <ShoppingBag className="w-8 h-8 stroke-[1.25]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-lg text-[#191611]">Your cart is empty</h3>
                  <p className="text-xs text-[#625D55] max-w-xs">
                    Explore our handcrafted luxury box collections or customize your own bespoke box.
                  </p>
                </div>
                <Link
                  href="/occasions"
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#AD7D39] to-[#7D5121] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all uppercase tracking-wider"
                >
                  Explore Occasion Boxes
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-[#8A8378] pb-2 border-b border-[#AD7D39]/15">
                  <span>Selected Gift Curations</span>
                  <button
                    onClick={clearCart}
                    className="text-[10px] font-bold text-rose-700 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Cart
                  </button>
                </div>

                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white border border-[#AD7D39]/20 shadow-sm flex items-start gap-4 hover:border-[#AD7D39]/40 transition-all"
                    >
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000"}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover border border-[#AD7D39]/20 flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif font-bold text-sm text-[#191611] truncate">{item.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-[#8A8378] hover:text-rose-600 p-1"
                            title="Remove Item"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="inline-block text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-amber-50 text-[#7D5121] border border-amber-200">
                          {item.occasion}
                        </span>

                        {(item.boxColor || item.ribbonColor) && (
                          <p className="text-[10px] text-[#625D55]">
                            {item.boxColor && `Box: ${item.boxColor}`} {item.ribbonColor && `• Ribbon: ${item.ribbonColor}`}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 border border-[#AD7D39]/30 rounded-lg p-0.5 bg-[#FBF8F3]">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-[#AD7D39]/10 rounded text-[#191611]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono font-bold px-1.5">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-[#AD7D39]/10 rounded text-[#191611]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-bold text-sm text-[#7D5121]">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-[#AD7D39]/20 space-y-4 shadow-lg">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#625D55]">
                  <span>Subtotal ({totalCount} items)</span>
                  <span className="font-mono">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#625D55]">
                  <span>White-Glove UAE Delivery</span>
                  <span className="text-emerald-700 font-semibold">Complimentary</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#191611] pt-2 border-t border-[#AD7D39]/15">
                  <span>Estimated Total</span>
                  <span className="text-[#7D5121] font-mono text-lg">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <Link
                  href="/customize/birthday"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#AD7D39] to-[#7D5121] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Custom Order Request</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Order via WhatsApp Concierge</span>
                </button>
              </div>

              <p className="text-[10px] text-center text-[#8A8378]">
                🔒 256-bit encrypted luxury gifting order. Prices in AED include UAE VAT.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
