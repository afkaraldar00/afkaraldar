"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, ShieldCheck, User, Bell } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";
import { dictionary } from "@/lib/dictionary";
import { supabase } from "@/lib/supabase/client";
import { useRealtimeTable } from "@/lib/hooks/useRealtimeTable";
import { useCart } from "@/lib/context/CartContext";

interface NavNotif {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export default function Navbar() {
  const { toggleCart, totalCount: cartTotalCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<NavNotif[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function initUserAndNotifs() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      let idsToQuery: string[] = [];
      if (session?.user) {
        idsToQuery.push(session.user.id);
        if (session.user.email) idsToQuery.push(session.user.email);

        const { data: customer } = await supabase
          .from("Customer")
          .select("id")
          .or(`authUserId.eq.${session.user.id},email.eq.${session.user.email}`)
          .maybeSingle();

        if (customer?.id) idsToQuery.push(customer.id);
      } else {
        const storedEmail = typeof window !== "undefined" ? localStorage.getItem("afkar_customer_email") : null;
        if (storedEmail) {
          idsToQuery.push(storedEmail);
          const { data: customer } = await supabase.from("Customer").select("id").eq("email", storedEmail).maybeSingle();
          if (customer?.id) idsToQuery.push(customer.id);
        }
      }

      setUserIds(idsToQuery);

      let query = supabase.from("Notification").select("*").order("createdAt", { ascending: false }).limit(5);
      if (idsToQuery.length > 0) {
        query = query.in("userId", idsToQuery);
      } else {
        query = query.or("userId.is.null,userId.eq.guest").limit(5);
      }

      const { data } = await query;
      if (data) {
        setNotifications(data.map((n: any) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          read: n.read,
          createdAt: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionUrl: n.actionUrl || (n.orderId ? "/track" : "/notifications"),
        })));
      }
    }

    initUserAndNotifs();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Realtime In-App Notification Broadcast ──
  useRealtimeTable("Notification", {
    onInsert: (newNotif) => {
      if (userIds.length === 0 || userIds.includes(newNotif.userId) || newNotif.userId === "guest") {
        const formatted: NavNotif = {
          id: newNotif.id,
          title: newNotif.title,
          body: newNotif.body,
          read: newNotif.read,
          createdAt: "Just now",
          actionUrl: newNotif.actionUrl || (newNotif.orderId ? "/track" : "/notifications"),
        };
        setNotifications((prev) => [formatted, ...prev.slice(0, 4)]);
      }
    },
    onUpdate: (updated) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === updated.id ? { ...n, read: updated.read } : n))
      );
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { href: "/", label: dictionary.navigation.home },
    { href: "/occasions", label: dictionary.navigation.occasions },
    { href: "/#how-it-works", label: dictionary.navigation.howItWorks },
    { href: "/inspiration", label: dictionary.navigation.inspiration },
    { href: "/about", label: dictionary.navigation.about },
    { href: "/faq", label: dictionary.navigation.faq },
  ];

  const isGhost = !scrolled && pathname === "/";

  return (
    <header
      className={`fixed top-0 z-40 w-full transition-all duration-500 ${
        isGhost
          ? "bg-gradient-to-b from-black/60 via-black/30 to-transparent border-transparent text-white"
          : "bg-[#FBF8F3]/95 backdrop-blur-md border-b border-[#3C2D1E]/10 shadow-sm text-[#191611]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group transition-transform duration-300 hover:scale-105">
            <div className="flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                <span className="font-serif text-4xl font-light text-[#AD7D39] leading-none select-none group-hover:text-[#C3944D] transition-colors">A</span>
                <div className="absolute w-6 h-6 border-b border-[#AD7D39] rotate-45 translate-x-2 -translate-y-1 opacity-70 group-hover:rotate-[55deg] transition-transform duration-500" />
              </div>
              <span className={`font-serif text-sm tracking-[0.25em] font-bold uppercase mt-1 leading-none text-center transition-colors duration-300 ${
                isGhost ? "text-white drop-shadow-sm" : "text-[#191611]"
              }`}>
                Afkar AlDar
              </span>
              <span className="text-[7px] tracking-[0.3em] uppercase text-[#AD7D39] font-medium mt-1">
                Bespoke Luxury Gifting
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs tracking-widest font-semibold transition-colors relative py-1 group ${
                    isActive
                      ? "text-[#AD7D39] font-bold"
                      : isGhost
                      ? "text-white/90 hover:text-[#AD7D39]"
                      : "text-[#292725] hover:text-[#AD7D39]"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-[#AD7D39] rounded-full transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* Customer Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={`transition-all duration-300 relative focus:outline-none hover:scale-110 active:scale-95 ${
                  isGhost ? "text-white/90 hover:text-[#AD7D39]" : "text-[#292725] hover:text-[#AD7D39]"
                }`}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 stroke-[1.5] transition-transform duration-300 hover:rotate-12" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#AD7D39] text-[#FBF8F3] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-gold-glow">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Customer Popover Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-[#AD7D39]/30 shadow-2xl p-4 z-50 animate-scale-in text-[#191611]">
                  <div className="flex items-center justify-between border-b border-[#AD7D39]/15 pb-2 mb-3">
                    <span className="font-serif font-bold text-sm text-[#191611]">My Notifications</span>
                    <Link
                      href="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="text-[10px] font-bold text-[#AD7D39] hover:underline"
                    >
                      View All
                    </Link>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#8A8378]">
                      No new alerts right now.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto">
                      {notifications.map((notif) => (
                        <Link
                          key={notif.id}
                          href={notif.actionUrl || "/notifications"}
                          onClick={async () => {
                            setNotifOpen(false);
                            if (!notif.read) {
                              await supabase.from("Notification").update({ read: true }).eq("id", notif.id);
                              setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, read: true } : n));
                            }
                          }}
                          className={`p-2.5 rounded-xl transition-all block group border ${
                            notif.read ? "bg-white border-[#AD7D39]/10" : "bg-[#F6F0E7]/60 border-[#AD7D39]/30 shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-[#191611]">
                            <span>{notif.title}</span>
                            {!notif.read && <span className="w-2 h-2 rounded-full bg-[#AD7D39]" />}
                          </div>
                          <p className="text-[11px] text-[#625D55] mt-0.5 leading-snug">{notif.body}</p>
                          <span className="text-[9px] text-[#8A8378] block mt-1">{notif.createdAt}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 mt-2 border-t border-[#AD7D39]/10 text-center">
                    <Link
                      href="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs font-bold text-[#AD7D39] hover:underline"
                    >
                      Open Notification Center →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Icon with Dynamic Badge */}
            <button
              onClick={toggleCart}
              className={`flex items-center gap-1.5 cursor-pointer group transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none ${
                isGhost ? "text-white/90 hover:text-[#AD7D39]" : "text-[#292725] hover:text-[#AD7D39]"
              }`}
              title="Shopping Cart"
              aria-label="View Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 stroke-[1.5] group-hover:-translate-y-0.5 transition-transform" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#AD7D39] text-[#FBF8F3] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    {cartTotalCount}
                  </span>
                )}
              </div>
            </button>

            {/* Profile Link */}
            <Link
              href={user ? "/profile" : "/auth"}
              className={`transition-all duration-300 hover:scale-110 active:scale-95 ${
                isGhost ? "text-white/90 hover:text-[#AD7D39]" : "text-[#292725] hover:text-[#AD7D39]"
              }`}
              title="My Account"
            >
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>

            <Link href="/customize/birthday">
              <TrackedButton
                button_location="navbar"
                variant="gold"
                size="md"
                eventName="start_customization"
                className="gap-2 px-6 py-3 font-semibold uppercase tracking-wider text-xs rounded-md shadow-md"
              >
                {dictionary.navigation.orderNow}
              </TrackedButton>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-4">
            <button
              onClick={toggleCart}
              className={`relative cursor-pointer focus:outline-none ${
                isGhost ? "text-white/90" : "text-[#292725]"
              }`}
              title="Shopping Cart"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#AD7D39] text-[#FBF8F3] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartTotalCount}
                </span>
              )}
            </button>

            <Link href={user ? "/profile" : "/auth"} className={isGhost ? "text-white/90" : "text-[#292725]"} title="My Account">
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 focus:outline-none ${isGhost ? "text-white" : "text-[#292725]"}`}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FBF8F3] border-b border-[#3C2D1E]/10 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-xs font-semibold tracking-wider rounded-lg transition-colors ${
                  pathname === link.href ? "bg-[#F6F0E7] text-[#AD7D39]" : "text-[#292725] hover:bg-[#F6F0E7]/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/customize/birthday"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 block"
            >
              <TrackedButton
                button_location="navbar"
                variant="gold"
                size="sm"
                className="w-full uppercase font-bold text-xs"
              >
                {dictionary.navigation.orderNow}
              </TrackedButton>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
