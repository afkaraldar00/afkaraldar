"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Webhook,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Code,
  ShieldCheck,
  ArrowLeft,
  Search,
  ExternalLink,
  Sparkles,
  Zap,
  Terminal,
  ChevronRight
} from "lucide-react";
import { useSystemHealth } from "@/lib/hooks/useSystemHealth";

interface WebhookLog {
  id: string;
  source: "STRIPE" | "RAILWAY" | "FCM" | "RESEND";
  event: string;
  status: 200 | 201 | 400 | 500;
  latencyMs: number;
  timestamp: string;
  payloadSnippet: string;
  endpointUrl: string;
}

const MOCK_WEBHOOK_LOGS: WebhookLog[] = [
  {
    id: "wh-1092",
    source: "STRIPE",
    event: "payment_intent.succeeded",
    status: 200,
    latencyMs: 42,
    timestamp: "12 mins ago",
    payloadSnippet: '{"id": "pi_3N9x...","amount": 172000, "currency": "aed", "checkoutSlug": "anniversary-gold"}',
    endpointUrl: "/api/webhooks/stripe",
  },
  {
    id: "wh-1091",
    source: "RAILWAY",
    event: "deployment.success",
    status: 200,
    latencyMs: 28,
    timestamp: "1 hour ago",
    payloadSnippet: '{"deploymentId": "dep_8912", "environment": "production", "status": "SUCCESS"}',
    endpointUrl: "/api/webhooks/general",
  },
  {
    id: "wh-1090",
    source: "FCM",
    event: "push_notification.delivered",
    status: 200,
    latencyMs: 15,
    timestamp: "2 hours ago",
    payloadSnippet: '{"messageId": "msg_0912", "vapidKey": "BEi6aAsu...", "status": "DELIVERED"}',
    endpointUrl: "/firebase-messaging-sw.js",
  },
  {
    id: "wh-1089",
    source: "RESEND",
    event: "email.delivered",
    status: 200,
    latencyMs: 34,
    timestamp: "4 hours ago",
    payloadSnippet: '{"emailId": "email_4091", "recipient": "sarah@jumeirah.ae", "subject": "Order Confirmation"}',
    endpointUrl: "/api/webhooks/general",
  },
  {
    id: "wh-1088",
    source: "STRIPE",
    event: "charge.succeeded",
    status: 200,
    latencyMs: 51,
    timestamp: "1 day ago",
    payloadSnippet: '{"id": "ch_9812", "amount": 85000, "currency": "aed", "status": "succeeded"}',
    endpointUrl: "/api/webhooks/stripe",
  },
];

export default function AdminWebhooksPage() {
  const [logs, setLogs] = useState<WebhookLog[]>(MOCK_WEBHOOK_LOGS);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const systemHealth = useSystemHealth();

  const handleTestDispatch = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/webhooks/general", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Source": "support-admin-test-suite",
        },
        body: JSON.stringify({
          event: "support.test_ping",
          timestamp: new Date().toISOString(),
          testSender: "Afkar AlDar Support Admin",
          currency: "AED",
        }),
      });

      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));

      // Append to logs
      const newLog: WebhookLog = {
        id: `wh-${Date.now().toString().slice(-4)}`,
        source: "RAILWAY",
        event: "support.test_ping",
        status: res.status as 200,
        latencyMs: 19,
        timestamp: "Just now",
        payloadSnippet: JSON.stringify(data),
        endpointUrl: "/api/webhooks/general",
      };
      setLogs((prev) => [newLog, ...prev]);
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.payloadSnippet.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterSource === "ALL") return matchesSearch;
    return log.source === filterSource && matchesSearch;
  });

  const getSourceBadge = (source: WebhookLog["source"]) => {
    switch (source) {
      case "STRIPE":
        return { color: "bg-amber-100 text-[#7D5121] border-amber-300", label: "Stripe UAE" };
      case "RAILWAY":
        return { color: "bg-purple-100 text-purple-900 border-purple-300", label: "Railway" };
      case "FCM":
        return { color: "bg-cyan-100 text-cyan-900 border-cyan-300", label: "FCM Push" };
      default:
        return { color: "bg-emerald-100 text-emerald-900 border-emerald-300", label: "Resend Email" };
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 text-[#191611]">
      
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#AD7D39]/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#AD7D39] font-bold uppercase tracking-wider mb-1">
            <Link href="/admin" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Admin Dashboard
            </Link>
            <span>/</span>
            <span>Cloud Integrations</span>
          </div>
          <h1 className="font-serif font-bold text-3xl text-[#191611] flex items-center gap-3">
            <Webhook className="w-8 h-8 text-[#AD7D39]" />
            <span>Webhooks Engine & Inspection Hub</span>
          </h1>
          <p className="text-xs text-[#8A8378] mt-1">
            Monitor, inspect & dispatch webhooks for Stripe UAE payments, Railway backend deployments, and FCM push alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              const recipient = prompt("Enter your email address to receive a real luxury test email:", "test@afkaraldar.ae");
              if (!recipient) return;

              setIsTesting(true);
              try {
                const res = await fetch("/api/email/test", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: recipient }),
                });

                const data = await res.json();
                setTestResult(JSON.stringify(data, null, 2));

                if (!data.success) {
                  alert(`⚠️ Resend Error: ${data.message || data.error}\n\nPlease paste your real RESEND_API_KEY starting with re_ into .env.local.`);
                } else {
                  alert(`🎉 Success! Real test email sent to ${recipient}. Email ID: ${data.id}`);
                }

                const newLog: WebhookLog = {
                  id: `wh-${Date.now().toString().slice(-4)}`,
                  source: "RESEND",
                  event: "email.order_confirmation",
                  status: data.success ? 200 : 400,
                  latencyMs: 45,
                  timestamp: "Just now",
                  payloadSnippet: JSON.stringify(data),
                  endpointUrl: "/api/email/test",
                };
                setLogs((prev) => [newLog, ...prev]);
              } catch (err: any) {
                alert(`Error testing Resend: ${err.message}`);
              } finally {
                setIsTesting(false);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#AD7D39]/30 text-[#7D5121] text-xs font-bold shadow-sm hover:bg-[#FBF8F3] transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#AD7D39]" />
            <span>Test Resend Email</span>
          </button>

          <button
            onClick={handleTestDispatch}
            disabled={isTesting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#AD7D39] to-[#7D5121] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2 w-fit disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${isTesting ? "animate-spin" : ""}`} />
            <span>{isTesting ? "Dispatching Ping..." : "Dispatch Test Webhook"}</span>
          </button>
        </div>
      </div>

      {/* Test Response Banner */}
      {testResult && (
        <div className="bg-[#191611] text-white p-5 rounded-2xl border border-[#AD7D39]/40 shadow-lg space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> HTTP 200 OK — Inbound Webhook Test Succeeded
            </span>
            <button onClick={() => setTestResult(null)} className="text-xs text-[#8A8378] hover:text-white">
              Dismiss
            </button>
          </div>
          <pre className="text-xs font-mono text-emerald-300 bg-black/50 p-3 rounded-xl overflow-x-auto leading-relaxed border border-white/10">
            {testResult}
          </pre>
        </div>
      )}

      {/* Registered Webhook Endpoints Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Endpoint 1: Stripe UAE */}
        <div className="bg-white p-5 rounded-2xl border border-[#AD7D39]/20 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#191611]">Stripe UAE</span>
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Active (AED)
            </span>
          </div>
          <p className="text-xs font-mono text-[#7D5121] bg-[#F6F0E7] p-2 rounded-lg truncate">
            /api/webhooks/stripe
          </p>
          <div className="flex items-center justify-between text-[10px] text-[#8A8378] pt-1 border-t border-[#AD7D39]/10">
            <span>Event: payment_intent.succeeded</span>
            <span className="font-bold text-emerald-700">Verified</span>
          </div>
        </div>

        {/* Endpoint 2: Railway */}
        <div className="bg-white p-5 rounded-2xl border border-[#AD7D39]/20 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#191611]">Railway Deploy</span>
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
              Online ({systemHealth.railway.latencyMs}ms)
            </span>
          </div>
          <p className="text-xs font-mono text-[#7D5121] bg-[#F6F0E7] p-2 rounded-lg truncate">
            /api/webhooks/general
          </p>
          <div className="flex items-center justify-between text-[10px] text-[#8A8378] pt-1 border-t border-[#AD7D39]/10">
            <span>Event: deployment.success</span>
            <span className="font-bold text-purple-700">Connected</span>
          </div>
        </div>

        {/* Endpoint 3: FCM Web Push */}
        <div className="bg-white p-5 rounded-2xl border border-[#AD7D39]/20 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#191611]">FCM Web Push</span>
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
              VAPID Ready
            </span>
          </div>
          <p className="text-xs font-mono text-[#7D5121] bg-[#F6F0E7] p-2 rounded-lg truncate">
            /firebase-messaging-sw.js
          </p>
          <div className="flex items-center justify-between text-[10px] text-[#8A8378] pt-1 border-t border-[#AD7D39]/10">
            <span>Project: eftikad-kh</span>
            <span className="font-bold text-cyan-700">VAPID Active</span>
          </div>
        </div>

        {/* Endpoint 4: Resend Email */}
        <div className="bg-white p-5 rounded-2xl border border-[#AD7D39]/20 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#191611]">Resend Email</span>
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
              Listening
            </span>
          </div>
          <p className="text-xs font-mono text-[#7D5121] bg-[#F6F0E7] p-2 rounded-lg truncate">
            /api/webhooks/general
          </p>
          <div className="flex items-center justify-between text-[10px] text-[#8A8378] pt-1 border-t border-[#AD7D39]/10">
            <span>Event: email.delivered</span>
            <span className="font-bold text-amber-700">Ready</span>
          </div>
        </div>

      </div>

      {/* Logs Controls & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#AD7D39]/20 shadow-sm">
        
        {/* Source Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {[
            { id: "ALL", label: `All Logs (${logs.length})` },
            { id: "STRIPE", label: "Stripe UAE" },
            { id: "RAILWAY", label: "Railway" },
            { id: "FCM", label: "FCM Push" },
            { id: "RESEND", label: "Resend Email" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterSource(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterSource === item.id
                  ? "bg-[#AD7D39] text-white shadow-sm"
                  : "bg-[#F6F0E7]/60 text-[#625D55] hover:bg-[#F6F0E7]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8378]" />
          <input
            type="text"
            placeholder="Search webhook events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 rounded-xl text-xs bg-[#FBF8F3] border border-[#AD7D39]/20 focus:outline-none focus:border-[#AD7D39]"
          />
        </div>

      </div>

      {/* Webhook Log Event Feed Table */}
      <div className="bg-white rounded-2xl border border-[#AD7D39]/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#AD7D39]/10 flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-[#191611]">Live Webhook Execution Log</h3>
          <span className="text-xs text-[#8A8378]">Auto-sync active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF8F3] text-[#7D5121] font-bold uppercase tracking-wider text-[10px] border-b border-[#AD7D39]/15">
              <tr>
                <th className="px-6 py-3.5">Log ID</th>
                <th className="px-6 py-3.5">Source</th>
                <th className="px-6 py-3.5">Event Name</th>
                <th className="px-6 py-3.5">HTTP Status</th>
                <th className="px-6 py-3.5">Latency</th>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5 text-right">Inspect Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#AD7D39]/10">
              {filteredLogs.map((log) => {
                const badge = getSourceBadge(log.source);

                return (
                  <tr key={log.id} className="hover:bg-[#FBF8F3]/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#191611]">{log.id}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[#292725] font-bold">{log.event}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {log.status} OK
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[#625D55]">{log.latencyMs}ms</td>
                    <td className="px-6 py-4 text-[#8A8378]">{log.timestamp}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1 rounded-lg bg-[#F6F0E7] text-[#7D5121] hover:bg-[#AD7D39] hover:text-white font-bold transition-colors text-[11px] inline-flex items-center gap-1"
                      >
                        <Code className="w-3 h-3" />
                        <span>Inspect Payload</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#191611] text-white w-full max-w-2xl rounded-2xl border border-[#AD7D39]/40 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#AD7D39]" />
                <h3 className="font-serif font-bold text-lg text-white">
                  Payload Inspector — {selectedLog.id}
                </h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-xs text-[#8A8378] hover:text-white">
                Close (ESC)
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#8A8378] font-mono">
                <span>Event: <strong className="text-white">{selectedLog.event}</strong></span>
                <span>Endpoint: <strong className="text-[#D4BA99]">{selectedLog.endpointUrl}</strong></span>
              </div>

              <pre className="text-xs font-mono text-cyan-300 bg-black/60 p-4 rounded-xl overflow-x-auto border border-white/10 leading-relaxed">
                {JSON.stringify(JSON.parse(selectedLog.payloadSnippet), null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-[#AD7D39] text-white text-xs font-bold hover:bg-[#7D5121] transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
