"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  PackageCheck,
  Calendar,
  CreditCard,
  Gift,
  ArrowLeft,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { formatCurrency } from "@/lib/dictionary";
import { supabase } from "@/lib/supabase/client";
import { useRealtimeTable } from "@/lib/hooks/useRealtimeTable";

interface CustomerNotification {
  id: string;
  type: "ORDER_STATUS" | "PAYMENT" | "GIFTING_REMINDER" | "PROMO";
  title: string;
  message: string;
  time: string;
  read: boolean;
  orderId?: string;
}

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userIds, setUserIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
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
          // Check local stored email if user previously submitted order
          const storedEmail = typeof window !== "undefined" ? localStorage.getItem("afkar_customer_email") : null;
          if (storedEmail) {
            idsToQuery.push(storedEmail);
            const { data: customer } = await supabase.from("Customer").select("id").eq("email", storedEmail).maybeSingle();
            if (customer?.id) idsToQuery.push(customer.id);
          }
        }

        setUserIds(idsToQuery);

        let query = supabase.from("Notification").select("*").order("createdAt", { ascending: false });
        if (idsToQuery.length > 0) {
          query = query.in("userId", idsToQuery);
        } else {
          // Limit to recent non-private system updates if unauthenticated
          query = query.or("userId.is.null,userId.eq.guest").limit(10);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data) {
          const formatted = data.map((n: any) => ({
            id: n.id,
            type: n.type || "ORDER_STATUS",
            title: n.title,
            message: n.body,
            time: new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            read: n.read,
            orderId: n.orderId || undefined,
          }));
          setNotifications(formatted);
        }
      } catch (err) {
        console.error("Error loading notifications:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadNotifications();
  }, []);

  // ── Realtime: Customer Notifications ──
  useRealtimeTable("Notification", {
    onInsert: (newNotif) => {
      if (userIds.includes(newNotif.userId)) {
        const formatted: CustomerNotification = {
          id: newNotif.id,
          type: newNotif.type || "ORDER_STATUS",
          title: newNotif.title,
          message: newNotif.body,
          time: "Just now",
          read: newNotif.read,
          orderId: newNotif.orderId || undefined,
        };
        setNotifications((prev) => [formatted, ...prev]);
      }
    },
    onUpdate: (updated) => {
      if (userIds.includes(updated.userId)) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === updated.id ? { ...n, read: updated.read } : n))
        );
      }
    },
    onDelete: (deleted) => {
      setNotifications((prev) => prev.filter((n) => n.id !== deleted.id));
    },
  });

  const markRead = async (id: string) => {
    try {
      await supabase
        .from("Notification")
        .update({ read: true })
        .eq("id", id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const getIcon = (type: CustomerNotification["type"]) => {
    switch (type) {
      case "ORDER_STATUS":
        return PackageCheck;
      case "PAYMENT":
        return CreditCard;
      case "GIFTING_REMINDER":
        return Calendar;
      default:
        return Gift;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-xs text-[#8A8378] space-y-3">
        <div className="w-8 h-8 border-2 border-[#AD7D39] border-t-transparent rounded-full animate-spin" />
        <span className="font-serif text-sm font-semibold tracking-wider text-[#191611]">Retrieving notifications...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#292725] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-[#AD7D39]/20 pb-6 flex items-center justify-between">
          <div>
            <Link href="/profile" className="inline-flex items-center gap-1.5 text-xs text-[#AD7D39] font-bold hover:underline mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to VIP Profile
            </Link>
            <h1 className="font-serif font-bold text-3xl text-[#191611] flex items-center gap-3">
              <Bell className="w-7 h-7 text-[#AD7D39]" />
              <span>Personal Notifications</span>
            </h1>
            <p className="text-xs text-[#8A8378] mt-1">
              Live updates on your custom box curations, delivery tracking & gifting calendar reminders.
            </p>
          </div>

          {/* Web Push Subscription Banner */}
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

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-[#AD7D39]/15 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-[#AD7D39] flex items-center justify-center mx-auto border border-amber-200">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#191611]">All caught up!</h3>
              <p className="text-xs text-[#625D55] max-w-sm mx-auto leading-relaxed">
                You have no new alerts. Real-time updates on your customized box orders and occasions will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const Icon = getIcon(notif.type);

              return (
                <div
                  key={notif.id}
                  className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    notif.read
                      ? "bg-white/80 border-[#AD7D39]/15"
                      : "bg-white border-[#AD7D39]/40 shadow-sm ring-1 ring-[#AD7D39]/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#AD7D39] border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[#191611]">{notif.title}</h3>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#AD7D39] animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-[#625D55] mt-1 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-[#8A8378] block mt-2">{notif.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {notif.orderId && (
                      <Link
                        href="/track"
                        onClick={() => markRead(notif.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#AD7D39] text-white text-xs font-bold hover:bg-[#7D5121] transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <span>Track Order</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {!notif.read && (
                      <button
                        onClick={() => markRead(notif.id)}
                        className="p-1.5 rounded-lg text-[#AD7D39] hover:bg-amber-50"
                        title="Mark Read"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
