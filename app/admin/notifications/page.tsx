"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Filter,
  Trash2,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Search,
  Check,
  RefreshCw
} from "lucide-react";
import { formatCurrency } from "@/lib/dictionary";
import { useSystemHealth } from "@/lib/hooks/useSystemHealth";
import { supabase } from "@/lib/supabase/client";
import { useRealtimeTable } from "@/lib/hooks/useRealtimeTable";
import { useAdminGuard } from "@/lib/hooks/useAdminGuard";

interface NotificationItem {
  id: string;
  category: "ORDER" | "PAYMENT" | "TICKET" | "SYSTEM" | "INVENTORY";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  amount?: number;
}

function mapDbNotification(n: any): NotificationItem {
  let category: NotificationItem["category"] = "SYSTEM";
  const typeUpper = (n.type || "").toUpperCase();
  if (typeUpper.includes("ORDER")) category = "ORDER";
  else if (typeUpper.includes("PAYMENT")) category = "PAYMENT";
  else if (typeUpper.includes("TICKET") || typeUpper.includes("SUPPORT")) category = "TICKET";
  else if (typeUpper.includes("INVENTORY")) category = "INVENTORY";

  const minutesDiff = Math.floor((Date.now() - new Date(n.createdAt).getTime()) / 60000);
  let timeStr = "Just now";
  if (minutesDiff >= 1440) {
    const days = Math.floor(minutesDiff / 1440);
    timeStr = `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (minutesDiff >= 60) {
    const hours = Math.floor(minutesDiff / 60);
    timeStr = `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutesDiff >= 1) {
    timeStr = `${minutesDiff} min${minutesDiff > 1 ? "s" : ""} ago`;
  }

  return {
    id: n.id,
    category,
    title: n.title,
    body: n.body,
    createdAt: timeStr,
    read: n.read,
  };
}

export default function AdminNotificationsPage() {
  const { isAdmin, isLoading: isAdminLoading } = useAdminGuard();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const systemHealth = useSystemHealth();

  useEffect(() => {
    async function loadDbNotifications() {
      try {
        const { data, error } = await supabase
          .from("Notification")
          .select("*")
          .order("createdAt", { ascending: false });

        if (error) throw error;

        if (data) {
          setNotifications(data.map(mapDbNotification));
        }
      } catch (err) {
        console.error("Error loading notifications from db:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isAdmin) loadDbNotifications();
  }, [isAdmin]);

  // ── Realtime: Notifications ──
  useRealtimeTable("Notification", {
    onInsert: (newRow) => {
      setNotifications((prev) => [mapDbNotification(newRow), ...prev]);
    },
    onUpdate: (updated) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === updated.id ? mapDbNotification(updated) : n))
      );
    },
    onDelete: (deleted) => {
      setNotifications((prev) => prev.filter((n) => n.id !== deleted.id));
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await supabase.from("Notification").update({ read: true }).eq("id", id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error("Error marking read:", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase.from("Notification").update({ read: true }).eq("read", false);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error("Error marking all read:", e);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await supabase.from("Notification").delete().eq("id", id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.error("Error deleting notification:", e);
    }
  };

  const clearAll = async () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      try {
        await supabase.from("Notification").delete().neq("id", "keep_placeholder");
        setNotifications([]);
      } catch (e) {
        console.error("Error clearing notifications:", e);
      }
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.body.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === "UNREAD") return !n.read && matchesSearch;
    if (activeFilter === "ORDERS") return n.category === "ORDER" && matchesSearch;
    if (activeFilter === "PAYMENTS") return n.category === "PAYMENT" && matchesSearch;
    if (activeFilter === "TICKETS") return n.category === "TICKET" && matchesSearch;
    if (activeFilter === "SYSTEM") return (n.category === "SYSTEM" || n.category === "INVENTORY") && matchesSearch;

    return matchesSearch;
  });

  const getCategoryBadge = (category: NotificationItem["category"]) => {
    switch (category) {
      case "ORDER":
        return { icon: ShoppingBag, color: "bg-amber-100 text-[#7D5121] border-amber-300", label: "Order" };
      case "PAYMENT":
        return { icon: CreditCard, color: "bg-emerald-100 text-emerald-800 border-emerald-300", label: "Payment" };
      case "TICKET":
        return { icon: MessageSquare, color: "bg-indigo-100 text-indigo-800 border-indigo-300", label: "Support" };
      case "INVENTORY":
        return { icon: AlertTriangle, color: "bg-rose-100 text-rose-800 border-rose-300", label: "Inventory" };
      default:
        return { icon: Bell, color: "bg-cyan-100 text-cyan-800 border-cyan-300", label: "System" };
    }
  };

  if (isAdminLoading || !isAdmin || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 text-[#AD7D39] animate-spin" />
        <p className="text-sm font-semibold text-[#8A8378]">{isAdminLoading ? "Verifying admin access..." : "Loading live notifications..."}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 text-[#191611]">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#AD7D39]/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#AD7D39] font-bold uppercase tracking-wider mb-1">
            <Link href="/admin" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <span>/</span>
            <span>Support Operations</span>
          </div>
          <h1 className="font-serif font-bold text-3xl text-[#191611] flex items-center gap-3">
            <span>Notification Center</span>
            {unreadCount > 0 && (
              <span className="text-xs font-sans font-bold px-2.5 py-1 rounded-full bg-[#AD7D39] text-white">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-xs text-[#8A8378] mt-1">
            Real-time activity log across client requests, Stripe payments, VIP tickets & FCM push events.
          </p>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#AD7D39]/30 text-xs font-bold text-[#7D5121] hover:bg-[#FBF8F3] transition-all shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* FCM Web Push Live Status Card */}
      <div className="bg-[#191611] text-white p-5 rounded-2xl border border-[#AD7D39]/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 flex items-center justify-center font-bold">
            <Bell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-white">Firebase FCM Web Push Status</h3>
              <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                VAPID Active
              </span>
            </div>
            <p className="text-xs text-[#8A8378] mt-0.5 font-mono text-[11px]">
              VAPID Key: BEi6aAsuk9ccn4uJ_M8rWotgufFBanaP8QVCoa5H5PXjlrzJqWMrC1L1ayKxka2NdlvKcC04vBwfuMUnEgF7dKc
            </p>
          </div>
        </div>

        <button
          onClick={systemHealth.requestFcmPermission}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#AD7D39] to-[#7D5121] text-white text-xs font-bold shadow hover:opacity-90 transition-all flex items-center gap-2 w-fit"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Test FCM Push Alert</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#AD7D39]/20 shadow-sm">
        
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {[
            { id: "ALL", label: `All (${notifications.length})` },
            { id: "UNREAD", label: `Unread (${unreadCount})` },
            { id: "ORDERS", label: "Orders" },
            { id: "PAYMENTS", label: "Payments" },
            { id: "TICKETS", label: "Support" },
            { id: "SYSTEM", label: "System" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === tab.id
                  ? "bg-[#AD7D39] text-white shadow-sm"
                  : "bg-[#F6F0E7]/60 text-[#625D55] hover:bg-[#F6F0E7]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8378]" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 rounded-xl text-xs bg-[#FBF8F3] border border-[#AD7D39]/20 focus:outline-none focus:border-[#AD7D39]"
          />
        </div>

      </div>

      {/* Notification Items List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#AD7D39]/20 p-12 text-center space-y-3">
            <Bell className="w-10 h-10 text-[#AD7D39]/40 mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[#191611]">No Notifications Found</h3>
            <p className="text-xs text-[#8A8378] max-w-sm mx-auto">
              There are no alerts matching your current filter criteria. New curation requests and payments will appear here.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const badge = getCategoryBadge(notif.category);
            const Icon = badge.icon;

            return (
              <div
                key={notif.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  notif.read
                    ? "bg-white border-[#AD7D39]/15 opacity-90"
                    : "bg-white border-[#AD7D39]/40 shadow-sm ring-1 ring-[#AD7D39]/10"
                }`}
              >
                {/* Left Content */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl border flex-shrink-0 mt-0.5 ${badge.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#191611]">{notif.title}</span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#AD7D39] inline-block animate-pulse" />
                      )}
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs text-[#625D55] leading-relaxed max-w-2xl">{notif.body}</p>

                    <div className="flex items-center gap-4 text-[10px] text-[#8A8378] pt-1">
                      <span>{notif.createdAt}</span>
                      {notif.amount && (
                        <span className="font-bold text-[#7D5121] bg-[#F6F0E7] px-2 py-0.5 rounded">
                          Amount: {formatCurrency(notif.amount)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0 pt-2 md:pt-0">
                  {notif.actionUrl && (
                    <Link
                      href={notif.actionUrl}
                      onClick={() => markAsRead(notif.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#AD7D39] text-white text-xs font-bold hover:bg-[#7D5121] transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span>{notif.actionText || "View"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      title="Mark as Read"
                      className="p-2 rounded-xl bg-[#F6F0E7] text-[#7D5121] hover:bg-[#AD7D39] hover:text-white transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(notif.id)}
                    title="Delete Notification"
                    className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
