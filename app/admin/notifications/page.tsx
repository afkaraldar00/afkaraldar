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
  RefreshCw,
  Send,
  Users,
  User,
  Radio,
  ExternalLink,
  Layers
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

  // FCM Dispatch Modal State
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [pushTarget, setPushTarget] = useState<"ALL" | "USER">("ALL");
  const [targetUserId, setTargetUserId] = useState("");
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushActionUrl, setPushActionUrl] = useState("/customize/birthday");
  const [pushCategory, setPushCategory] = useState("ORDER");
  const [isSendingPush, setIsSendingPush] = useState(false);
  const [pushFeedback, setPushFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

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

  const handleSendPushBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle || !pushBody) {
      setPushFeedback({ type: "error", msg: "Please fill in title and message body." });
      return;
    }

    setIsSendingPush(true);
    setPushFeedback(null);

    try {
      // 1. Dispatch Web Push via FCM API (Server also saves to database)
      const res = await fetch("/api/notifications/send-fcm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: pushTarget === "USER" ? targetUserId : "ALL",
          title: pushTitle,
          body: pushBody,
          category: pushCategory,
          data: {
            actionUrl: pushActionUrl,
            category: pushCategory,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        let msg = "Notification saved to database log!";
        if (data.delivered && data.successCount > 0) {
          msg = `Delivered Web Push alert to ${data.successCount} active device(s)!`;
        } else if (data.message) {
          msg = `Saved to database! (${data.message})`;
        }

        setPushFeedback({
          type: "success",
          msg,
        });
        setPushTitle("");
        setPushBody("");
        setTimeout(() => setShowDispatchModal(false), 2500);
      } else {
        setPushFeedback({
          type: "error",
          msg: data.error || data.message || "Failed to dispatch FCM push notification.",
        });
      }
    } catch (err: any) {
      setPushFeedback({ type: "error", msg: err.message || "Error sending push notification." });
    } finally {
      setIsSendingPush(false);
    }
  };

  const applyTemplate = (title: string, body: string, actionUrl: string) => {
    setPushTitle(title);
    setPushBody(body);
    setPushActionUrl(actionUrl);
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

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowDispatchModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#AD7D39] to-[#7D5121] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Push Message</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#AD7D39]/30 text-xs font-bold text-[#7D5121] hover:bg-[#FBF8F3] transition-all shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* FCM Web Push Live Status Banner */}
      <div className="bg-[#191611] text-white p-5 rounded-2xl border border-[#AD7D39]/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 flex items-center justify-center font-bold">
            <Bell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-white">Firebase FCM Web Push Engine</h3>
              <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                Live Active
              </span>
            </div>
            <p className="text-xs text-[#8A8378] mt-0.5 font-mono text-[11px]">
              VAPID: BEi6aAsuk9ccn4uJ_M8rWotgufFBanaP8QVCoa5H5PXjlrzJqWMrC1L...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDispatchModal(true)}
            className="px-4 py-2 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-bold hover:bg-cyan-900/60 transition-all flex items-center gap-2"
          >
            <Radio className="w-3.5 h-3.5 animate-ping" />
            <span>Broadcast FCM Alert</span>
          </button>

          <button
            onClick={systemHealth.requestFcmPermission}
            className="px-4 py-2 rounded-xl bg-[#AD7D39]/20 border border-[#AD7D39]/40 text-[#E0C097] text-xs font-bold hover:bg-[#AD7D39]/30 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enable My Device</span>
          </button>
        </div>
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

      {/* FCM Push Notification Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 border border-[#AD7D39]/30 shadow-2xl animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-[#AD7D39]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#AD7D39]/10 text-[#AD7D39] border border-[#AD7D39]/20">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl text-[#191611]">Dispatch FCM Push Alert</h2>
                  <p className="text-xs text-[#8A8378]">Send a live Web Push notification to client browsers & devices.</p>
                </div>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-[#8A8378] hover:text-[#191611] font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendPushBroadcast} className="space-y-4">
              
              {/* Target Selector */}
              <div>
                <label className="block text-xs font-bold text-[#625D55] uppercase tracking-wider mb-2">
                  Target Audience
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPushTarget("ALL")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      pushTarget === "ALL"
                        ? "bg-[#AD7D39] text-white border-[#AD7D39] shadow-sm"
                        : "bg-[#FBF8F3] text-[#625D55] border-[#AD7D39]/20 hover:bg-[#F6F0E7]"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>All Subscribers</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPushTarget("USER")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      pushTarget === "USER"
                        ? "bg-[#AD7D39] text-white border-[#AD7D39] shadow-sm"
                        : "bg-[#FBF8F3] text-[#625D55] border-[#AD7D39]/20 hover:bg-[#F6F0E7]"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Specific User / Customer</span>
                  </button>
                </div>
              </div>

              {pushTarget === "USER" && (
                <div>
                  <label className="block text-xs font-bold text-[#625D55] uppercase tracking-wider mb-1">
                    Customer ID or Email
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. customer_id_123 or user@example.com"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#FBF8F3] border border-[#AD7D39]/30 focus:outline-none focus:border-[#AD7D39]"
                  />
                </div>
              )}

              {/* Quick Template Selector */}
              <div>
                <label className="block text-xs font-bold text-[#625D55] uppercase tracking-wider mb-1">
                  Quick Push Templates
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyTemplate("🎉 Special Weekend Offer", "Enjoy 15% off customized luxury gift boxes this weekend across Dubai & UAE!", "/customize/birthday")}
                    className="text-[11px] font-bold px-3 py-1 rounded-lg bg-[#F6F0E7] text-[#7D5121] border border-[#AD7D39]/20 hover:bg-[#AD7D39] hover:text-white transition-all"
                  >
                    🎁 Weekend Discount
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate("🚚 Order Shipped!", "Your bespoke gift box has been dispatched for delivery across Dubai & UAE.", "/track")}
                    className="text-[11px] font-bold px-3 py-1 rounded-lg bg-[#F6F0E7] text-[#7D5121] border border-[#AD7D39]/20 hover:bg-[#AD7D39] hover:text-white transition-all"
                  >
                    🚚 Order Shipped
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate("💬 VIP Support Reply", "Our gifting advisor replied to your support ticket.", "/support")}
                    className="text-[11px] font-bold px-3 py-1 rounded-lg bg-[#F6F0E7] text-[#7D5121] border border-[#AD7D39]/20 hover:bg-[#AD7D39] hover:text-white transition-all"
                  >
                    💬 Support Reply
                  </button>
                </div>
              </div>

              {/* Title & Body */}
              <div>
                <label className="block text-xs font-bold text-[#625D55] uppercase tracking-wider mb-1">
                  Push Notification Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. 🎁 Order Status Updated!"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#FBF8F3] border border-[#AD7D39]/30 focus:outline-none focus:border-[#AD7D39]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#625D55] uppercase tracking-wider mb-1">
                  Message Body
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Your customized box design has been approved and is being prepared for delivery."
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#FBF8F3] border border-[#AD7D39]/30 focus:outline-none focus:border-[#AD7D39]"
                  required
                />
              </div>

              {/* Action URL */}
              <div>
                <label className="block text-xs font-bold text-[#625D55] uppercase tracking-wider mb-1">
                  Click Target Action Link
                </label>
                <input
                  type="text"
                  placeholder="/customize/birthday or /track"
                  value={pushActionUrl}
                  onChange={(e) => setPushActionUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#FBF8F3] border border-[#AD7D39]/30 focus:outline-none focus:border-[#AD7D39]"
                />
              </div>

              {/* Feedback Message */}
              {pushFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    pushFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {pushFeedback.msg}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#AD7D39]/20">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingPush}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#AD7D39] to-[#7D5121] text-white text-xs font-bold hover:opacity-95 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSendingPush ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Push...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Push Now</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
