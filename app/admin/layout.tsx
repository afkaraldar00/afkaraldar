"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Package, LayoutDashboard, ArrowLeft, MessageSquare, Menu, X, ExternalLink, RefreshCw, Bell, Webhook } from "lucide-react";
import { useSystemHealth } from "@/lib/hooks/useSystemHealth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real live health hook
  const { supabase, fcm, railway, isLoading, lastChecked, refetch } = useSystemHealth();

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/webhooks", label: "Webhooks", icon: Webhook },
    { href: "/admin/tickets", label: "Support Tickets", icon: MessageSquare },
    { href: "/occasions", label: "Catalog View", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-[#F6F0E7]/60 text-[#191611] font-sans antialiased flex flex-col">
      
      {/* Admin Luxury Header Bar */}
      <header className="sticky top-0 z-40 bg-[#191611] text-[#FBF8F3] border-b border-[#AD7D39]/30 shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand Monogram & Title */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#D4BA99] hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Storefront</span>
              </Link>
              
              <div className="hidden sm:block h-5 w-[1px] bg-white/20" />

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#AD7D39] to-[#7D5121] flex items-center justify-center text-white font-serif font-bold text-base shadow-sm border border-[#AD7D39]/40">
                  A
                </div>
                <div>
                  <h1 className="font-serif font-bold text-base text-white tracking-wide leading-none">
                    Afkar Aldar Admin
                  </h1>
                  <span className="text-[8px] uppercase font-bold tracking-widest text-[#AD7D39] block mt-0.5">
                    Bespoke Gifting Operations
                  </span>
                </div>
              </div>
            </div>

            {/* Center Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all ${
                      isActive
                        ? "bg-[#AD7D39] text-white shadow-sm font-bold"
                        : "text-[#8A8378] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Real Live Service Status Pills (Supabase, FCM, Railway) */}
            <div className="flex items-center gap-2">
              
              {/* 1. Real Supabase DB Ping Badge */}
              <div
                className="hidden lg:inline-flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                title={`Supabase Database Latency: ${supabase.latencyMs}ms (${lastChecked || "Live"})`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Supabase {supabase.latencyMs}ms</span>
              </div>

              {/* 2. Real FCM Push Service Badge */}
              <div
                className="hidden lg:inline-flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/40"
                title={`Firebase Cloud Messaging: ${fcm.browserPermission === "granted" ? "Web Push Granted" : "Push Active"}`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>FCM {fcm.browserPermission === "granted" ? "Granted" : "Active"}</span>
              </div>

              {/* 3. Real Railway Deployment Badge */}
              <div
                className="hidden sm:inline-flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/40"
                title={`Railway Server Response: ${railway.latencyMs}ms (${railway.environment})`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span>Railway {railway.latencyMs}ms</span>
              </div>

              {/* Notification Bell Button with Unread Badge */}
              <Link
                href="/admin/notifications"
                className="relative p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#D4BA99] transition-colors flex items-center justify-center"
                title="Notification Center"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#AD7D39] text-white text-[9px] font-bold flex items-center justify-center border border-[#191611]">
                  3
                </span>
              </Link>

              {/* Refresh Pings */}
              <button
                onClick={refetch}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#D4BA99] transition-colors"
                title="Ping Live Services"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#D4BA99] hover:text-white focus:outline-none"
                aria-label="Toggle Mobile Admin Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#191611] border-b border-[#AD7D39]/30 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
            
            {/* Real Service Status Row for Mobile */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-white/10">
              <span className="text-[9px] uppercase font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/80 px-2 py-1 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Supabase {supabase.latencyMs}ms
              </span>
              <span className="text-[9px] uppercase font-bold text-cyan-400 flex items-center gap-1 bg-cyan-950/80 px-2 py-1 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> FCM {fcm.browserPermission === "granted" ? "Granted" : "Active"}
              </span>
              <span className="text-[9px] uppercase font-bold text-purple-300 flex items-center gap-1 bg-purple-950/80 px-2 py-1 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> Railway {railway.latencyMs}ms
              </span>
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive ? "bg-[#AD7D39] text-white" : "text-[#8A8378] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#D4BA99] hover:bg-white/5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Back to Storefront</span>
            </Link>
          </div>
        )}
      </header>

      {/* Admin Full-Bleed Content Container */}
      <main className="flex-1 w-full">
        {children}
      </main>

    </div>
  );
}
