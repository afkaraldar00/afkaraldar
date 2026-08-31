"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingCTA from "@/components/layout/FloatingCTA";
import { CartProvider } from "@/lib/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";

export default function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminOrCheckout = pathname.startsWith("/admin") || pathname.startsWith("/pay");

  if (isAdminOrCheckout) {
    return <main className="min-h-screen bg-[#F6F0E7]/60">{children}</main>;
  }

  const isHomepage = pathname === "/";

  return (
    <CartProvider>
      <Navbar />
      <main className={`flex-grow ${isHomepage ? "" : "pt-24"}`}>{children}</main>
      <Footer />
      <FloatingCTA />
      <CartDrawer />
    </CartProvider>
  );
}

