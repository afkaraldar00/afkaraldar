"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Gift,
  Heart,
  HelpCircle,
  ShieldCheck,
  LogOut,
  Clock,
  ExternalLink,
  Edit2,
  CheckCircle2,
  Calendar as CalendarIcon,
  MapPin,
  Sparkles,
  Plus,
  Trash2,
  Bell,
  Sliders,
  ChevronRight,
  RotateCcw,
  Award,
  Crown,
  CreditCard,
  MessageSquare
} from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/dictionary";
import { isAdminEmail } from "@/lib/hooks/useAdminGuard";

// Subcomponents
import OrderDetailModal, { OrderDetail } from "@/components/profile/OrderDetailModal";
import AddressBookModal, { AddressItem } from "@/components/profile/AddressBookModal";
import GiftingCalendarModal, { GiftingOccasionItem } from "@/components/profile/GiftingCalendarModal";
import NewTicketModal, { TicketItem } from "@/components/profile/NewTicketModal";

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "calendar" | "addresses" | "wishlist" | "tickets" | "notifications" | "settings">("orders");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // VIP Tier Modal state
  const [showVipModal, setShowVipModal] = useState<boolean>(false);

  // Edit form state
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [altEmail, setAltEmail] = useState<string>("");
  const [preferredCurrency, setPreferredCurrency] = useState<string>("AED");
  const [preferredLanguage, setPreferredLanguage] = useState<string>("EN");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Notification toggles state
  const [notifications, setNotifications] = useState({
    whatsappUpdates: true,
    emailPaymentLinks: true,
    calendarReminders: true,
    vipPreviews: true,
  });

  // Modal active selections
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);

  const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);

  const [selectedCalendarOccasion, setSelectedCalendarOccasion] = useState<GiftingOccasionItem | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);

  const [isTicketModalOpen, setIsTicketModalOpen] = useState<boolean>(false);

  // Filter state for Orders
  const [orderFilter, setOrderFilter] = useState<"ALL" | "ACTIVE" | "PAYMENT" | "DELIVERED">("ALL");

  // Orders State (Real + Demo Fallback)
  // Orders State
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [vipTier, setVipTier] = useState<string>("Emerald VIP Client");
  const [showAdminConsole, setShowAdminConsole] = useState<boolean>(false);

  // Saved Addresses State
  const [addresses, setAddresses] = useState<AddressItem[]>([]);

  // Gifting Calendar Reminders State
  const [calendarItems, setCalendarItems] = useState<GiftingOccasionItem[]>([]);

  // Wishlist State
  const [wishlist, setWishlist] = useState<any[]>([]);

  // Tickets State
  const [tickets, setTickets] = useState<TicketItem[]>([]);

  useEffect(() => {
    async function loadSession() {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setCurrentUser(session.user);
        setAltEmail(session.user.email || "");

        let customerIdForOrders = session.user.id;

        // Check if user is in AdminUser table
        try {
          const { data: adminCheck } = await supabase
            .from("AdminUser")
            .select("id")
            .eq("email", session.user.email?.toLowerCase())
            .maybeSingle();

          if (adminCheck || session.user.email?.toLowerCase() === "minamakr1234@gmail.com") {
            setShowAdminConsole(true);
          }
        } catch (e) {
          console.warn("Error checking admin status", e);
        }

        // 1. Load customer profile info
        try {
          let { data: customer } = await supabase
            .from("Customer")
            .select("*")
            .or(`authUserId.eq.${session.user.id},email.eq.${session.user.email}`)
            .maybeSingle();

          // Link authUserId if email matches but account is not linked
          if (customer && !customer.authUserId) {
            const { data: updatedCustomer } = await supabase
              .from("Customer")
              .update({ authUserId: session.user.id })
              .eq("id", customer.id)
              .select()
              .maybeSingle();
            if (updatedCustomer) {
              customer = updatedCustomer;
            }
          }

          // If no customer record exists, create one
          if (!customer) {
            const generatedCustId = `cust_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
            const { data: createdCust } = await supabase
              .from("Customer")
              .insert({
                id: generatedCustId,
                authUserId: session.user.id,
                name: session.user.user_metadata?.full_name || "Valued Client",
                email: session.user.email,
                phone: session.user.phone || "",
              })
              .select()
              .maybeSingle();
            customer = createdCust;
          }

          if (customer) {
            customerIdForOrders = customer.id;
            setFullName(customer.name || session.user.user_metadata?.full_name || "Valued Client");
            setPhone(customer.phone || session.user.phone || "");
            setTotalSpent(Number(customer.totalSpent) || 0);
            setVipTier(customer.tier || "Emerald VIP Client");
          } else {
            setFullName(session.user.user_metadata?.full_name || "Valued Client");
            setPhone(session.user.phone || "");
          }
        } catch (e) {
          console.warn("Error loading customer profile", e);
        }

        // 2. Load real orders from Supabase DB
        try {
          const { data: dbOrders } = await supabase
            .from("Order")
            .select("*, GiftBox(*)")
            .eq("customerId", customerIdForOrders);
          if (dbOrders && dbOrders.length > 0) {
            const formatted: OrderDetail[] = dbOrders.map((o: any) => ({
              id: o.id,
              boxName: o.GiftBox?.name || "Custom Afkar AlDar Gift Box",
              occasionSlug: o.occasionSlug,
              status: o.status,
              createdAt: new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              finalPrice: o.finalPrice ? Number(o.finalPrice) : null,
              currency: o.currency || "AED",
              checkoutActive: o.checkoutActive,
              checkoutSlug: o.checkoutSlug,
              customization: o.customization,
              deliveryInfo: o.deliveryInfo,
            }));
            setOrders(formatted);
          }
        } catch (e) {
          console.warn("Error loading orders from database", e);
        }

        // 3. Load Addresses from Supabase DB
        try {
          const { data: dbAddresses } = await supabase
            .from("Address")
            .select("*")
            .eq("userId", session.user.id)
            .order("isDefault", { ascending: false });
          if (dbAddresses) {
            setAddresses(dbAddresses);
          }
        } catch (e) {
          console.warn("Error loading addresses from database", e);
        }

        // 4. Load Gifting Calendar from Supabase DB
        try {
          const { data: dbCalendar } = await supabase
            .from("CalendarReminder")
            .select("*")
            .eq("userId", session.user.id)
            .order("occasionDate", { ascending: true });
          if (dbCalendar) {
            const formatted = dbCalendar.map((item: any) => ({
              id: item.id,
              title: item.title,
              recipientName: item.recipientName,
              occasionDate: item.occasionDate,
              occasionSlug: item.occasionSlug,
              reminderDaysBefore: item.reminderDaysBefore,
              notes: item.notes || "",
            }));
            setCalendarItems(formatted);
          }
        } catch (e) {
          console.warn("Error loading calendar reminders", e);
        }

        // 5. Load Support Tickets from Supabase DB
        try {
          const { data: dbTickets } = await supabase
            .from("Ticket")
            .select("*")
            .eq("email", session.user.email)
            .order("createdAt", { ascending: false });
          if (dbTickets) {
            const formatted = dbTickets.map((t: any) => ({
              id: t.id,
              orderId: t.orderId || undefined,
              category: t.category,
              subject: t.subject,
              message: t.message,
              status: t.status,
              createdAt: new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            }));
            setTickets(formatted);
          }
        } catch (e) {
          console.warn("Error loading support tickets", e);
        }

        // 6. Load user preference toggles from Supabase DB
        try {
          let { data: dbPrefs } = await supabase
            .from("UserPreference")
            .select("*")
            .eq("userId", session.user.id)
            .maybeSingle();

          if (!dbPrefs) {
            const { data: createdPrefs } = await supabase
              .from("UserPreference")
              .insert({
                userId: session.user.id,
                preferredCurrency: "AED",
                preferredLanguage: "EN",
                whatsappUpdates: true,
                emailPaymentLinks: true,
                calendarReminders: true,
                vipPreviews: true,
              })
              .select()
              .single();
            dbPrefs = createdPrefs;
          }

          if (dbPrefs) {
            setPreferredCurrency(dbPrefs.preferredCurrency);
            setPreferredLanguage(dbPrefs.preferredLanguage);
            setNotifications({
              whatsappUpdates: dbPrefs.whatsappUpdates,
              emailPaymentLinks: dbPrefs.emailPaymentLinks,
              calendarReminders: dbPrefs.calendarReminders,
              vipPreviews: dbPrefs.vipPreviews,
            });
          }
        } catch (e) {
          console.warn("Error loading preference toggles", e);
        }

      } else {
        router.push("/auth");
      }

      // Load Wishlist from LocalStorage
      if (typeof window !== "undefined") {
        const savedWishlist = localStorage.getItem("afkaraldar_wishlist");
        if (savedWishlist) {
          try {
            setWishlist(JSON.parse(savedWishlist));
          } catch (e) {
            console.error(e);
          }
        }
      }

      setIsLoading(false);
    }

    loadSession();
  }, []);

  // Address handlers
  const handleSaveAddress = async (item: AddressItem) => {
    if (!currentUser) return;
    try {
      const payload = {
        label: item.label,
        recipientName: item.recipientName,
        phone: item.phone,
        emirate: item.emirate,
        street: item.street,
        buildingVilla: item.buildingVilla,
        notes: item.notes || "",
        isDefault: item.isDefault || false,
        userId: currentUser.id,
      };

      if (item.isDefault) {
        await supabase
          .from("Address")
          .update({ isDefault: false })
          .eq("userId", currentUser.id);
      }

      const isNew = item.id.startsWith("addr_");
      if (isNew) {
        const { error } = await supabase
          .from("Address")
          .insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("Address")
          .update(payload)
          .eq("id", item.id);
        if (error) throw error;
      }

      // Refetch
      const { data: dbAddresses } = await supabase
        .from("Address")
        .select("*")
        .eq("userId", currentUser.id)
        .order("isDefault", { ascending: false });
      if (dbAddresses) setAddresses(dbAddresses);
    } catch (e: any) {
      console.error(e);
      alert("Failed to save address: " + e.message);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!currentUser) return;
    try {
      const { error } = await supabase
        .from("Address")
        .delete()
        .eq("id", id);
      if (error) throw error;

      // Refetch
      const { data: dbAddresses } = await supabase
        .from("Address")
        .select("*")
        .eq("userId", currentUser.id)
        .order("isDefault", { ascending: false });
      if (dbAddresses) setAddresses(dbAddresses);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    if (!currentUser) return;
    try {
      await supabase
        .from("Address")
        .update({ isDefault: false })
        .eq("userId", currentUser.id);

      await supabase
        .from("Address")
        .update({ isDefault: true })
        .eq("id", id);

      // Refetch
      const { data: dbAddresses } = await supabase
        .from("Address")
        .select("*")
        .eq("userId", currentUser.id)
        .order("isDefault", { ascending: false });
      if (dbAddresses) setAddresses(dbAddresses);
    } catch (e: any) {
      console.error(e);
    }
  };

  // Gifting Calendar Handlers
  const handleSaveCalendarItem = async (item: GiftingOccasionItem) => {
    if (!currentUser) return;
    try {
      const payload = {
        title: item.title,
        recipientName: item.recipientName,
        occasionDate: item.occasionDate,
        occasionSlug: item.occasionSlug,
        reminderDaysBefore: item.reminderDaysBefore,
        notes: item.notes || "",
        userId: currentUser.id,
      };

      const isNew = item.id.startsWith("occ_");
      if (isNew) {
        const { error } = await supabase
          .from("CalendarReminder")
          .insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("CalendarReminder")
          .update(payload)
          .eq("id", item.id);
        if (error) throw error;
      }

      // Refetch
      const { data: dbCalendar } = await supabase
        .from("CalendarReminder")
        .select("*")
        .eq("userId", currentUser.id)
        .order("occasionDate", { ascending: true });
      if (dbCalendar) {
        const formatted = dbCalendar.map((i: any) => ({
          id: i.id,
          title: i.title,
          recipientName: i.recipientName,
          occasionDate: i.occasionDate,
          occasionSlug: i.occasionSlug,
          reminderDaysBefore: i.reminderDaysBefore,
          notes: i.notes || "",
        }));
        setCalendarItems(formatted);
      }
    } catch (e: any) {
      console.error(e);
      alert("Failed to save calendar item: " + e.message);
    }
  };

  const handleDeleteCalendarItem = async (id: string) => {
    if (!currentUser) return;
    try {
      const { error } = await supabase
        .from("CalendarReminder")
        .delete()
        .eq("id", id);
      if (error) throw error;

      // Refetch
      const { data: dbCalendar } = await supabase
        .from("CalendarReminder")
        .select("*")
        .eq("userId", currentUser.id)
        .order("occasionDate", { ascending: true });
      if (dbCalendar) {
        const formatted = dbCalendar.map((i: any) => ({
          id: i.id,
          title: i.title,
          recipientName: i.recipientName,
          occasionDate: i.occasionDate,
          occasionSlug: i.occasionSlug,
          reminderDaysBefore: i.reminderDaysBefore,
          notes: i.notes || "",
        }));
        setCalendarItems(formatted);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  // Support Ticket Handler
  const handleAddTicket = async (ticket: TicketItem) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/support/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: currentUser.email,
          orderId: ticket.orderId || null,
          subject: ticket.subject,
          message: ticket.message,
          category: ticket.category,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Refetch
        const { data: dbTickets } = await supabase
          .from("Ticket")
          .select("*")
          .eq("email", currentUser.email)
          .order("createdAt", { ascending: false });
        if (dbTickets) {
          const formatted = dbTickets.map((t: any) => ({
            id: t.id,
            orderId: t.orderId || undefined,
            category: t.category,
            subject: t.subject,
            message: t.message,
            status: t.status,
            createdAt: new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          }));
          setTickets(formatted);
        }
        alert("Support ticket submitted successfully!");
      } else {
        alert("Failed to submit support ticket.");
      }
    } catch (err: any) {
      console.error(err);
      alert("An error occurred: " + err.message);
    }
  };

  // Update Profile Info
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const { error: authErr } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
      if (authErr) throw authErr;

      const { error: custErr } = await supabase
        .from("Customer")
        .upsert({
          id: currentUser.id,
          authUserId: currentUser.id,
          name: fullName,
          email: currentUser.email,
          phone: phone,
        });
      if (custErr) throw custErr;

      const { error: prefErr } = await supabase
        .from("UserPreference")
        .upsert({
          userId: currentUser.id,
          preferredCurrency,
          preferredLanguage,
          whatsappUpdates: notifications.whatsappUpdates,
          emailPaymentLinks: notifications.emailPaymentLinks,
          calendarReminders: notifications.calendarReminders,
          vipPreviews: notifications.vipPreviews,
        });
      if (prefErr) throw prefErr;

      alert("Profile details and notification preferences saved successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to save changes: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  // Helper for computing countdown days
  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 3600 * 24));
    return diff;
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "ACTIVE") return ["NEW_REQUEST", "CONTACTED", "PREPARING", "SHIPPED"].includes(o.status);
    if (orderFilter === "PAYMENT") return o.status === "AWAITING_PAYMENT" || o.checkoutActive;
    if (orderFilter === "DELIVERED") return o.status === "DELIVERED";
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-xs text-[#8A8378] space-y-3">
        <div className="w-8 h-8 border-2 border-[#AD7D39] border-t-transparent rounded-full animate-spin" />
        <span className="font-serif text-sm font-semibold tracking-wider text-[#191611]">Opening Afkar AlDar Client Portal...</span>
      </div>
    );
  }

  // Get User Initials for Monogram Avatar
  const userInitials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AB";

  const nextTierName = totalSpent < 5000 ? "Afkar AlDar Privé" : totalSpent < 15000 ? "Royal Patron" : "Ultimate Luxury Patron";
  const nextTierGoal = totalSpent < 5000 ? 5000 : totalSpent < 15000 ? 15000 : 30000;
  const progressPercent = Math.min((totalSpent / nextTierGoal) * 100, 100);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* 1. LUXURY VIP CLIENT HEADER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#191611] via-[#29231C] to-[#191611] p-6 sm:p-8 text-white shadow-xl border border-[#AD7D39]/30">
        
        {/* Subtle Decorative Background Monogram */}
        <div className="absolute right-[-20px] bottom-[-30px] font-serif text-[180px] font-light text-[#AD7D39]/10 select-none pointer-events-none">
          A
        </div>
        
        {/* Monogram Badge & Info Column */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => setShowVipModal(true)}>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#AD7D39] to-[#7D5121] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-lg border border-[#AD7D39]/40 group-hover:scale-105 transition-all">
                {userInitials}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#AD7D39] text-[#191611] p-1 rounded-full border-2 border-[#191611]" title="VIP Royal Member">
                <Crown className="w-3 h-3" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-wide">{fullName || "Valued Client"}</span>
                <span className="inline-flex items-center gap-1 text-[9px] uppercase font-extrabold tracking-wider bg-[#AD7D39]/20 text-[#D4BA99] border border-[#AD7D39]/30 px-2 py-0.5 rounded-md cursor-pointer hover:bg-[#AD7D39]/35" onClick={() => setShowVipModal(true)}>
                  <Award className="w-2.5 h-2.5" />
                  <span>{vipTier}</span>
                </span>
              </div>
              <p className="text-xs text-[#8A8378] flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#AD7D39]" />
                <span>Afkar AlDar Member • Priority VIP Support & Dedicated Gifting Advisor</span>
              </p>
            </div>
          </div>

          {/* Quick Platform Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowVipModal(true)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#D4BA99] bg-[#AD7D39]/15 hover:bg-[#AD7D39]/25 border border-[#AD7D39]/30 px-4 py-2.5 rounded-xl transition-all"
            >
              <Award className="w-4 h-4 text-[#AD7D39]" />
              <span>VIP Privilege Overview</span>
            </button>

            {showAdminConsole && (
              <Link href="/admin">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2.5 rounded-xl transition-all">
                  <ShieldCheck className="w-4 h-4 text-[#AD7D39]" />
                  <span>Admin Console</span>
                </span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 px-3.5 py-2.5 rounded-xl border border-red-800/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>

        {/* Lifetime Gifting Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#D4BA99] font-medium">VIP Tier Spend Progress</span>
              <span className="text-[#8A8378] font-mono">AED {totalSpent.toLocaleString()} / AED {nextTierGoal.toLocaleString()} to {nextTierName}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#AD7D39] to-[#D4BA99] rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>

          <div className="md:col-span-4 text-left md:text-right">
            <span className="text-[10px] text-[#8A8378] block">Next Perk Unlocks at AED {nextTierGoal.toLocaleString()}:</span>
            <span className="text-xs font-semibold text-[#D4BA99]">
              {totalSpent < 5000 
                ? "Complimentary Hand-Embossed Leather Tags & Express 3-Hour Delivery" 
                : "Royal Velvet Personalized Ribbons & Free GCC Gifting Courier"}
            </span>
          </div>
        </div>

      </div>

      {/* 2. PORTAL NAVIGATION TABS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: "orders", label: "My Custom Orders", icon: Gift, count: orders.length },
            { id: "calendar", label: "Gifting Calendar", icon: CalendarIcon, count: calendarItems.length },
            { id: "addresses", label: "Recipient Address Book", icon: MapPin, count: addresses.length },
            { id: "wishlist", label: "Saved Box Drafts", icon: Heart, count: wishlist.length },
            { id: "tickets", label: "Support Tickets", icon: HelpCircle, count: tickets.length },
            { id: "notifications", label: "Notification Alerts", icon: Bell, count: 2 },
            { id: "settings", label: "Account & Preferences", icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full p-4 rounded-xl text-left text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all ${
                  isSelected
                    ? "bg-[#191611] text-[#D4BA99] shadow-lg border-transparent"
                    : "bg-[#F6F0E7]/60 text-[#625D55] hover:bg-[#E9DBC6]/40 border border-[#3C2D1E]/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#AD7D39]" : "text-[#8A8378]"}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-[#AD7D39] text-[#191611]" : "bg-[#3C2D1E]/10 text-[#625D55]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="lg:col-span-9">
          
          {/* TAB 1: ORDERS CENTER */}
          {activeTab === "orders" && (
            <div className="luxury-card p-6 bg-white space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3C2D1E]/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#191611]">Active Gift Requests</h3>
                  <p className="text-xs text-[#625D55]">Track order progress, view customization specs, and review payment links.</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-[#F6F0E7] p-1 rounded-xl border border-[#3C2D1E]/10 text-[10px] font-bold uppercase">
                  {(["ALL", "ACTIVE", "PAYMENT", "DELIVERED"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        orderFilter === f
                          ? "bg-[#191611] text-[#D4BA99] shadow-sm"
                          : "text-[#625D55] hover:text-[#191611]"
                      }`}
                    >
                      {f === "PAYMENT" ? "Pay Ready" : f}
                    </button>
                  ))}
                </div>
              </div>

              {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders.map((o) => (
                    <div
                      key={o.id}
                      className="p-5 rounded-2xl border border-[#3C2D1E]/10 hover:border-[#AD7D39]/30 transition-all bg-[#FBF8F3] space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#191611]">#{o.id}</span>
                            <span
                              className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                                o.status === "AWAITING_PAYMENT"
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : o.status === "DELIVERED"
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-[#F6F0E7] text-[#7D5121] border-[#AD7D39]/30"
                              }`}
                            >
                              {o.status.replace("_", " ")}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-base text-[#191611] mt-1">{o.boxName}</h4>
                          <span className="text-[11px] text-[#8A8378]">Submitted on {o.createdAt}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          {o.checkoutActive && (
                            <Link href={`/pay/${o.checkoutSlug}`}>
                              <TrackedButton
                                button_location="profile_orders"
                                variant="gold"
                                size="sm"
                                className="gap-1.5 text-[10px] font-bold uppercase tracking-wider py-2"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Review & Pay ({formatCurrency(o.finalPrice || 0, o.currency || "AED")})</span>
                              </TrackedButton>
                            </Link>
                          )}

                          <button
                            onClick={() => {
                              setSelectedOrder(o);
                              setIsOrderModalOpen(true);
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#191611] bg-white border border-[#3C2D1E]/15 hover:border-[#AD7D39] hover:text-[#AD7D39] transition-all"
                          >
                            Details & Progress
                          </button>
                        </div>
                      </div>

                      {/* Customization Teaser */}
                      {o.customization && (
                        <div className="p-3 rounded-xl bg-white border border-[#3C2D1E]/10 text-[11px] text-[#625D55] flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#191611]">Specs:</span>
                            <span>{o.customization.boxColor || "Custom Velvet"}</span>
                            <span>•</span>
                            <span>{o.customization.ribbonColor || "Silk Ribbon"}</span>
                          </div>
                          {o.deliveryInfo?.address && (
                            <div className="flex items-center gap-1 text-[10px] text-[#8A8378]">
                              <MapPin className="w-3 h-3 text-[#AD7D39]" />
                              <span>{o.deliveryInfo.emirate || "Dubai"} delivery</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <Gift className="w-10 h-10 text-[#8A8378] mx-auto stroke-[1.25]" />
                  <p className="text-xs text-[#8A8378]">No gift requests found under this filter.</p>
                  <Link href="/customize/birthday">
                    <TrackedButton button_location="profile_orders" variant="gold" size="sm" className="uppercase font-bold text-xs">
                      Create Custom Request
                    </TrackedButton>
                  </Link>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: GIFTING CALENDAR */}
          {activeTab === "calendar" && (
            <div className="luxury-card p-6 bg-white space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3C2D1E]/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#191611]">Gifting Advisor Calendar</h3>
                  <p className="text-xs text-[#625D55]">Never miss a loved one&apos;s special occasion. Reminder notifications sent before your date.</p>
                </div>

                <TrackedButton
                  onClick={() => {
                    setSelectedCalendarOccasion(null);
                    setIsCalendarModalOpen(true);
                  }}
                  button_location="profile_calendar"
                  variant="gold"
                  size="sm"
                  className="gap-2 text-xs uppercase font-bold py-2.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Gifting Date</span>
                </TrackedButton>
              </div>

              {calendarItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {calendarItems.map((c) => {
                    const daysLeft = getDaysUntil(c.occasionDate);
                    return (
                      <div key={c.id} className="p-5 rounded-2xl border border-[#3C2D1E]/10 bg-[#FBF8F3] space-y-3 relative overflow-hidden">
                        
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#AD7D39] block">
                              {c.occasionSlug.replace("-", " ")}
                            </span>
                            <h4 className="font-serif font-bold text-base text-[#191611] mt-0.5">{c.title}</h4>
                            <p className="text-xs text-[#625D55] font-medium">For: {c.recipientName}</p>
                          </div>

                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                              daysLeft <= 14
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : "bg-[#F6F0E7] text-[#7D5121] border-[#AD7D39]/30"
                            }`}
                          >
                            {daysLeft > 0 ? `In ${daysLeft} Days` : "Today!"}
                          </span>
                        </div>

                        <div className="text-xs text-[#625D55] space-y-1 pt-2 border-t border-[#3C2D1E]/10">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-3.5 h-3.5 text-[#AD7D39]" />
                            <span>Date: {c.occasionDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bell className="w-3.5 h-3.5 text-[#AD7D39]" />
                            <span>Reminder set for {c.reminderDaysBefore} days before</span>
                          </div>
                          {c.notes && <p className="italic text-[11px] text-[#8A8378] pt-1">&quot;{c.notes}&quot;</p>}
                        </div>

                        {/* Card Actions */}
                        <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#3C2D1E]/10">
                          <Link href={`/customize/${c.occasionSlug}`}>
                            <span className="text-[11px] font-bold text-[#AD7D39] hover:underline uppercase tracking-wider flex items-center gap-1">
                              Customize Box Now <ChevronRight className="w-3 h-3" />
                            </span>
                          </Link>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedCalendarOccasion(c);
                                setIsCalendarModalOpen(true);
                              }}
                              className="p-1.5 text-[#625D55] hover:text-[#AD7D39] transition-colors"
                              title="Edit Reminder"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCalendarItem(c.id)}
                              className="p-1.5 text-[#625D55] hover:text-red-600 transition-colors"
                              title="Delete Reminder"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#8A8378] italic py-8 text-center">No upcoming gifting reminders added yet.</p>
              )}

            </div>
          )}

          {/* TAB 3: RECIPIENT ADDRESS BOOK */}
          {activeTab === "addresses" && (
            <div className="luxury-card p-6 bg-white space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3C2D1E]/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#191611]">Recipient Address Book</h3>
                  <p className="text-xs text-[#625D55]">Store delivery addresses for smooth one-click custom gift checkout.</p>
                </div>

                <TrackedButton
                  onClick={() => {
                    setSelectedAddress(null);
                    setIsAddressModalOpen(true);
                  }}
                  button_location="profile_address_book"
                  variant="gold"
                  size="sm"
                  className="gap-2 text-xs uppercase font-bold py-2.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Delivery Address</span>
                </TrackedButton>
              </div>

              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-5 rounded-2xl border transition-all space-y-3 relative ${
                        addr.isDefault
                          ? "bg-white border-[#AD7D39] shadow-md ring-1 ring-[#AD7D39]/30"
                          : "bg-[#FBF8F3] border-[#3C2D1E]/10 hover:border-[#3C2D1E]/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-base text-[#191611]">{addr.label}</h4>
                            {addr.isDefault && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#AD7D39] text-white">
                                Primary Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-[#292725] mt-1">{addr.recipientName}</p>
                          <p className="text-[11px] text-[#625D55] font-mono">{addr.phone}</p>
                        </div>
                      </div>

                      <div className="text-xs text-[#625D55] space-y-0.5 pt-2 border-t border-[#3C2D1E]/10">
                        <p className="font-medium text-[#191611]">{addr.buildingVilla}, {addr.street}</p>
                        <p className="text-[11px]">{addr.emirate}, UAE</p>
                        {addr.notes && <p className="italic text-[10px] text-[#8A8378] pt-1">Notes: &quot;{addr.notes}&quot;</p>}
                      </div>

                      {/* Actions */}
                      <div className="pt-2 flex items-center justify-between border-t border-[#3C2D1E]/10 text-xs">
                        {!addr.isDefault ? (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[10px] font-bold text-[#AD7D39] hover:underline uppercase tracking-wider"
                          >
                            Set as Primary Default
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Selected for Express Delivery
                          </span>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedAddress(addr);
                              setIsAddressModalOpen(true);
                            }}
                            className="p-1.5 text-[#625D55] hover:text-[#AD7D39] transition-colors"
                            title="Edit Address"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1.5 text-[#625D55] hover:text-red-600 transition-colors"
                            title="Delete Address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8A8378] italic py-8 text-center">No saved delivery addresses yet.</p>
              )}

            </div>
          )}

          {/* TAB 4: WISHLIST & DRAFTS */}
          {activeTab === "wishlist" && (
            <div className="luxury-card p-6 bg-white space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#191611] border-b border-[#3C2D1E]/10 pb-3">
                Saved Box Designs & Gifting Wishlist
              </h3>

              {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                    <div key={item.slug} className="p-4 rounded-xl border border-[#3C2D1E]/10 flex gap-4 items-center bg-[#FBF8F3]">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#191611] shrink-0">
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-serif font-bold text-sm text-[#191611]">{item.name}</h4>
                        <Link
                          href={`/box/${item.slug}`}
                          className="text-[10px] uppercase font-bold text-[#AD7D39] hover:underline flex items-center gap-1"
                        >
                          View & Customize <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <Heart className="w-10 h-10 text-[#8A8378] mx-auto stroke-[1.25]" />
                  <p className="text-xs text-[#8A8378]">Your gifting wishlist is currently empty.</p>
                  <Link href="/occasions">
                    <TrackedButton button_location="profile_wishlist" variant="gold" size="sm" className="uppercase font-bold text-xs">
                      Explore Box Collections
                    </TrackedButton>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SUPPORT TICKETS */}
          {activeTab === "tickets" && (
            <div className="luxury-card p-6 bg-white space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3C2D1E]/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#191611]">Customer Support Hub</h3>
                  <p className="text-xs text-[#625D55]">Direct messaging line with your personal Afkar AlDar gifting advisor.</p>
                </div>

                <TrackedButton
                  onClick={() => setIsTicketModalOpen(true)}
                  button_location="profile_tickets"
                  variant="gold"
                  size="sm"
                  className="gap-2 text-xs uppercase font-bold py-2.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open Ticket</span>
                </TrackedButton>
              </div>

              {tickets.length > 0 ? (
                <div className="space-y-4 text-xs">
                  {tickets.map((t) => (
                    <div key={t.id} className="p-5 rounded-2xl border border-[#3C2D1E]/10 bg-[#FBF8F3] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#AD7D39] text-sm">#{t.id}</span>
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-[#F6F0E7] text-[#625D55]">
                            {t.category}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            t.status === "OPEN"
                              ? "bg-amber-100 text-amber-800"
                              : t.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-base text-[#191611] pt-1">{t.subject}</h4>
                      <p className="text-xs text-[#625D55] bg-white p-3 rounded-xl border border-[#3C2D1E]/10">&quot;{t.message}&quot;</p>
                      
                      <div className="flex justify-between items-center text-[10px] text-[#8A8378] pt-1">
                        <span>Filed on {t.createdAt}</span>
                        <span>Support expected response within 2 hours</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8A8378] italic py-8 text-center">No active support tickets.</p>
              )}

            </div>
          )}

          {/* TAB 6: NOTIFICATION ALERTS */}
          {activeTab === "notifications" && (
            <div className="luxury-card p-6 bg-white space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3C2D1E]/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#191611]">Personal Notification Feed</h3>
                  <p className="text-xs text-[#625D55]">Live Web Push alerts & gifting calendar notifications.</p>
                </div>

                <button
                  onClick={async () => {
                    try {
                      const { requestFcmVapidToken } = await import("@/lib/firebase/config");
                      const token = await requestFcmVapidToken();
                      if (token) {
                        alert("🔔 Web Push Notifications Enabled! You will now receive instant live alerts on your device when your gift box status updates.");
                      } else {
                        alert("⚠️ Push Notification Permission was denied or unsupported in your browser.");
                      }
                    } catch (e: any) {
                      alert(`Notification status: ${e.message}`);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#AD7D39] to-[#7D5121] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <Bell className="w-4 h-4 animate-bounce" />
                  <span>Enable Web Push Alerts</span>
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#F6F0E7]/60 border border-[#AD7D39]/20 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#191611]">Order #AFK-9820 Delivered 🎁</span>
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Delivered</span>
                    </div>
                    <p className="text-xs text-[#625D55] mt-1">Your velvet box has been hand-delivered in Jumeirah, Dubai.</p>
                    <span className="text-[10px] text-[#8A8378] block mt-1">2 hours ago</span>
                  </div>
                  <Link href="/track" className="px-3 py-1.5 rounded-lg bg-[#AD7D39] text-white text-xs font-bold hover:bg-[#7D5121]">
                    Track
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#3C2D1E]/10 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#191611]">Stripe UAE Deposit Receipt 💳</span>
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Confirmed</span>
                    </div>
                    <p className="text-xs text-[#625D55] mt-1">AED 850.00 deposit confirmed for Order #AFK-9820.</p>
                    <span className="text-[10px] text-[#8A8378] block mt-1">Yesterday</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ACCOUNT SETTINGS & PREFERENCES */}
          {activeTab === "settings" && (
            <form onSubmit={handleUpdateProfile} className="luxury-card p-6 bg-white space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#191611] border-b border-[#3C2D1E]/10 pb-3">
                Account Details & Preferences
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#625D55] uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#625D55] uppercase mb-1">
                    Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#625D55] uppercase mb-1">
                    Preferred Currency
                  </label>
                  <select
                    value={preferredCurrency}
                    onChange={(e) => setPreferredCurrency(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none bg-white"
                  >
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#625D55] uppercase mb-1">
                    Interface Language
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/15 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none bg-white"
                  >
                    <option value="EN">English</option>
                    <option value="AR">العربية (Arabic - Coming Soon)</option>
                  </select>
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="pt-4 border-t border-[#3C2D1E]/10 space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#191611]">Support Notification Channels</h4>
                
                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-[#3C2D1E]/10 bg-[#FBF8F3] cursor-pointer">
                    <div>
                      <span className="font-semibold text-[#191611] block">WhatsApp Order Status Updates</span>
                      <span className="text-[11px] text-[#625D55]">Receive direct WhatsApp alerts when your custom gift design price is ready</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.whatsappUpdates}
                      onChange={(e) => setNotifications({ ...notifications, whatsappUpdates: e.target.checked })}
                      className="w-4 h-4 text-[#AD7D39] rounded focus:ring-[#AD7D39]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-[#3C2D1E]/10 bg-[#FBF8F3] cursor-pointer">
                    <div>
                      <span className="font-semibold text-[#191611] block">Email Payment & Dispatch Links</span>
                      <span className="text-[11px] text-[#625D55]">Receive invoice & live tracking updates via email</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailPaymentLinks}
                      onChange={(e) => setNotifications({ ...notifications, emailPaymentLinks: e.target.checked })}
                      className="w-4 h-4 text-[#AD7D39] rounded focus:ring-[#AD7D39]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-[#3C2D1E]/10 bg-[#FBF8F3] cursor-pointer">
                    <div>
                      <span className="font-semibold text-[#191611] block">Gifting Calendar Reminder Alerts</span>
                      <span className="text-[11px] text-[#625D55]">Get early alerts before saved birthdays and anniversary dates</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.calendarReminders}
                      onChange={(e) => setNotifications({ ...notifications, calendarReminders: e.target.checked })}
                      className="w-4 h-4 text-[#AD7D39] rounded focus:ring-[#AD7D39]"
                    />
                  </label>
                </div>
              </div>

              <TrackedButton
                type="submit"
                disabled={isSaving}
                button_location="profile_settings"
                variant="gold"
                size="md"
                className="w-full uppercase font-bold text-xs py-3.5 mt-4"
              >
                <span>{isSaving ? "Saving Settings..." : "Save Profile Details & Preferences"}</span>
              </TrackedButton>
            </form>
          )}

        </div>

      </div>

      {/* 3. MODALS */}
      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
      />

      {/* Address Book Modal */}
      <AddressBookModal
        address={selectedAddress}
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setSelectedAddress(null);
        }}
        onSave={handleSaveAddress}
      />

      {/* Gifting Calendar Modal */}
      <GiftingCalendarModal
        occasion={selectedCalendarOccasion}
        isOpen={isCalendarModalOpen}
        onClose={() => {
          setIsCalendarModalOpen(false);
          setSelectedCalendarOccasion(null);
        }}
        onSave={handleSaveCalendarItem}
      />

      {/* New Ticket Modal */}
      <NewTicketModal
        ordersList={orders.map((o) => ({ id: o.id, boxName: o.boxName }))}
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSubmit={handleAddTicket}
      />

      {/* VIP Perks Modal */}
      {showVipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#AD7D39]/30 overflow-hidden">
            <div className="p-6 bg-[#191611] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#AD7D39]" />
                <h3 className="font-serif text-xl font-bold text-[#D4BA99]">Emerald VIP Client Privileges</h3>
              </div>
              <button onClick={() => setShowVipModal(false)} className="text-[#8A8378] hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-[#292725]">
              <p className="text-[#625D55]">
                As an Emerald VIP Client with Afkar AlDar, you enjoy bespoke gifting services:
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-[#AD7D39] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#191611] block">Complimentary Gold Calligraphy</span>
                    <span className="text-[#625D55]">Hand-written gold ink calligraphy on all greeting cards.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-[#AD7D39] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#191611] block">Priority VIP Support Line</span>
                    <span className="text-[#625D55]">Direct WhatsApp & phone line to senior box design consultants.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-[#AD7D39] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#191611] block">Express Dubai 3-Hour Delivery</span>
                    <span className="text-[#625D55]">Same-day white-glove courier delivery across Dubai & Abu Dhabi.</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-[#F6F0E7] border-t border-[#3C2D1E]/10 text-right">
              <TrackedButton
                onClick={() => setShowVipModal(false)}
                button_location="vip_modal"
                variant="gold"
                size="sm"
                className="uppercase font-bold text-xs px-6"
              >
                Got It
              </TrackedButton>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
