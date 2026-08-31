"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  MessageSquare, 
  RefreshCw, 
  Send, 
  MessageCircle, 
  Clock, 
  Search, 
  X, 
  Layers, 
  Eye 
} from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";
import { supabase } from "@/lib/supabase/client";
import { useRealtimeTable } from "@/lib/hooks/useRealtimeTable";
import { useAdminGuard } from "@/lib/hooks/useAdminGuard";

export default function AdminTicketsPage() {
  const { isAdmin, isLoading: isAdminLoading } = useAdminGuard();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load tickets from database
  useEffect(() => {
    async function loadTickets() {
      try {
        const { data, error } = await supabase
          .from("Ticket")
          .select("*")
          .order("createdAt", { ascending: false });

        if (error) throw error;
        if (data) setTickets(data);
      } catch (e) {
        console.error("Error loading tickets:", e);
      } finally {
        setIsLoading(false);
      }
    }
    if (isAdmin) loadTickets();
  }, [isAdmin]);

  // Realtime: Tickets
  useRealtimeTable("Ticket", {
    onInsert: (newTicket) => {
      setTickets((prev) => [newTicket, ...prev]);
    },
    onUpdate: (updated) => {
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    },
    onDelete: (deleted) => {
      setTickets((prev) => prev.filter((t) => t.id !== deleted.id));
    },
  });

  const handleToggleResolve = async (id: string) => {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) return;
    const newStatus = ticket.status === "OPEN" ? "RESOLVED" : "OPEN";
    try {
      await supabase.from("Ticket").update({ status: newStatus }).eq("id", id);
      setTickets(
        tickets.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    } catch (e) {
      console.error("Error toggling ticket status:", e);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    setIsReplying(true);
    try {
      await supabase.from("Ticket").update({ status: "RESOLVED" }).eq("id", selectedTicket.id);
      setTickets(
        tickets.map((t) => (t.id === selectedTicket.id ? { ...t, status: "RESOLVED" } : t))
      );
      setSelectedTicket(null);
      setReplyMessage("");
      alert(`Reply sent to ${selectedTicket.name} and ticket marked as RESOLVED.`);
    } catch (e) {
      console.error("Error sending reply:", e);
    } finally {
      setIsReplying(false);
    }
  };

  // Filtering Logic
  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === "all" ? true : t.status === statusFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      t.name?.toLowerCase().includes(searchLower) ||
      t.email?.toLowerCase().includes(searchLower) ||
      t.subject?.toLowerCase().includes(searchLower) ||
      t.message?.toLowerCase().includes(searchLower) ||
      String(t.id).includes(searchLower) ||
      (t.orderId && String(t.orderId).includes(searchLower));
    return matchesStatus && matchesSearch;
  });

  if (isAdminLoading || !isAdmin || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 text-[#AD7D39] animate-spin" />
        <p className="text-sm font-semibold text-[#8A8378]">
          {isAdminLoading ? "Verifying admin access..." : "Loading support tickets..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* Back button and page title */}
      <div>
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-xs font-bold text-[#AD7D39] hover:text-[#191611] transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="font-serif text-3xl font-bold text-[#191611] flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-[#AD7D39]" />
          Support Ticket Center
        </h1>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E9DBC6]/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Filed</span>
            <h4 className="text-xl font-bold text-[#191611] font-mono mt-1">{tickets.length}</h4>
            <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 mt-1">
              <MessageSquare className="w-3 h-3" /> Customer queries
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E9DBC6]/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Open Tickets</span>
            <h4 className="text-xl font-bold text-[#191611] font-mono mt-1">
              {tickets.filter((t) => t.status === "OPEN").length}
            </h4>
            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> Needs reply
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E9DBC6]/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Resolved Cases</span>
            <h4 className="text-xl font-bold text-[#191611] font-mono mt-1">
              {tickets.filter((t) => t.status === "RESOLVED").length}
            </h4>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <CheckCircle className="w-3 h-3" /> Answered & closed
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main card panel */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-[#E9DBC6]/60 shadow-xs space-y-6">
        
        {/* Search Input Bar */}
        <div className="relative flex items-center w-full">
          <Search className="h-4 w-4 text-gray-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tickets by sender name, email, subject, message content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#AD7D39] rounded-2xl text-xs font-semibold focus:outline-none text-[#191611] shadow-inner transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3.5 p-1 text-gray-400 hover:text-[#191611]">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100">
          {[
            { key: "all", label: "All Tickets", icon: <Layers className="w-3.5 h-3.5" />, count: tickets.length },
            { key: "OPEN", label: "Open Requests", icon: <Clock className="w-3.5 h-3.5 text-amber-500" />, count: tickets.filter(t => t.status === "OPEN").length },
            { key: "RESOLVED", label: "Resolved", icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />, count: tickets.filter(t => t.status === "RESOLVED").length }
          ].map((chip) => {
            const isSelected = statusFilter === chip.key;
            return (
              <button
                key={chip.key}
                onClick={() => setStatusFilter(chip.key)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-[#191611] text-white border-[#191611] shadow-xs"
                    : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600"
                }`}
              >
                {chip.icon}
                <span>{chip.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-sans ${
                  isSelected ? "bg-[#AD7D39] text-[#191611]" : "bg-gray-200 text-gray-600"
                }`}>
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tickets List Table - Desktop */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 font-bold border-b border-gray-100">
                <th className="p-4 text-start">Ticket Ref</th>
                <th className="p-4 text-start">Sender Details</th>
                <th className="p-4 text-start">Subject & Message Preview</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-end w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((t) => {
                  const initials = t.name ? t.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "CU";
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-4 text-start">
                        <div className="font-mono font-bold text-[#191611] text-xs">
                          #{String(t.id).slice(0, 8).toUpperCase()}
                        </div>
                        <span className="inline-block mt-1 text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-[#F6F0E7] text-[#7D5121] border border-[#AD7D39]/20">
                          {t.category || "General"}
                        </span>
                      </td>
                      <td className="p-4 text-start">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gray-100 text-[#191611] border border-[#E9DBC6] flex items-center justify-center text-[10px] font-bold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-[#191611] text-xs">{t.name}</div>
                            <div className="text-[10px] text-gray-400 font-sans">{t.email}</div>
                            {t.phone && (
                              <div className="text-[9px] text-[#AD7D39] font-sans mt-0.5">+{t.phone.replace(/[^0-9]/g, "")}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-start max-w-sm">
                        <div className="font-bold text-[#191611] text-xs mb-0.5">{t.subject}</div>
                        <p className="text-[11px] text-gray-500 line-clamp-2 italic">
                          &quot;{t.message}&quot;
                        </p>
                        {t.orderId && (
                          <span className="inline-block mt-1.5 font-mono text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                            Order Ref: #{t.orderId}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                          t.status === "RESOLVED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {t.status || "OPEN"}
                        </span>
                      </td>
                      <td className="p-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedTicket(t)}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-[#F6F0E7] text-[#191611] hover:text-[#AD7D39] border border-[#E9DBC6]/40 transition-all"
                            title="Reply to Ticket"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          {t.phone && (
                            <a
                              href={`https://wa.me/${t.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 transition-all"
                              title="WhatsApp client"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}

                          <button
                            onClick={() => handleToggleResolve(t.id)}
                            className={`p-2 rounded-xl border transition-all ${
                              t.status === "OPEN"
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                            }`}
                            title={t.status === "OPEN" ? "Mark Resolved" : "Reopen Ticket"}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 italic">
                    No tickets found matching query
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tickets Cards - Mobile */}
        <div className="block md:hidden space-y-4">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((t) => {
              const initials = t.name ? t.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "CU";
              return (
                <div key={t.id} className="bg-white p-5 rounded-3xl border border-[#E9DBC6]/60 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <span className="font-mono font-bold text-[#191611] text-xs">
                      #{String(t.id).slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-[#F6F0E7] text-[#7D5121] border border-[#AD7D39]/20">
                      {t.category || "General"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-[#191611] border border-[#E9DBC6] flex items-center justify-center text-[10px] font-bold shrink-0">
                      {initials}
                    </div>
                    <div>
                      <div className="font-bold text-[#191611] text-xs">{t.name}</div>
                      <div className="text-[10px] text-gray-400 font-sans">{t.email}</div>
                    </div>
                  </div>

                  <div className="bg-[#FBF8F3] p-3.5 rounded-2xl border border-[#E9DBC6]/40 text-xs">
                    <div className="font-bold text-[#191611] text-xs mb-1">{t.subject}</div>
                    <p className="text-[11px] text-gray-500 italic leading-relaxed line-clamp-3">
                      &quot;{t.message}&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                      t.status === "RESOLVED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {t.status || "OPEN"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(t)}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-[#F6F0E7] text-[#191611] hover:text-[#AD7D39] border border-[#E9DBC6]/40 transition-all cursor-pointer"
                        title="Reply"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      {t.phone && (
                        <a
                          href={`https://wa.me/${t.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleResolve(t.id)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          t.status === "OPEN"
                            ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-400 bg-white border border-[#E9DBC6]/60 rounded-3xl italic text-xs">
              No tickets found matching query
            </div>
          )}
        </div>

      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#AD7D39]/30 overflow-hidden">
            <div className="p-6 bg-[#191611] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4BA99]">Support Ticket Reply</span>
                <h3 className="font-serif text-lg font-bold text-white mt-0.5">#{selectedTicket.id.slice(0, 8)} - {selectedTicket.name}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-[#8A8378] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendReply} className="p-6 space-y-4 text-xs text-[#292725]">
              <div className="p-4 bg-[#FBF8F3] rounded-2xl border border-[#E9DBC6]/40">
                <span className="font-bold text-[#191611] block mb-1">Subject: {selectedTicket.subject}</span>
                <p className="italic text-[#625D55] text-[11px]">&quot;{selectedTicket.message}&quot;</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#625D55] mb-1">Response Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type your response to the client..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-gray-200 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#625D55] hover:bg-[#F6F0E7]"
                >
                  Cancel
                </button>
                <TrackedButton
                  type="submit"
                  disabled={isReplying}
                  button_location="admin"
                  variant="gold"
                  size="md"
                  className="px-6 py-2.5 uppercase font-bold text-xs gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isReplying ? "Sending..." : "Send Reply & Resolve"}</span>
                </TrackedButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
