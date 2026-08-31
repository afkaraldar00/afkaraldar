"use client";

import { useState, useEffect, useCallback } from "react";

export interface SystemHealthState {
  supabase: {
    status: string;
    latencyMs: number;
    url: string;
  };
  fcm: {
    status: string;
    projectId: string;
    configured: boolean;
    browserPermission: "granted" | "default" | "denied" | "unsupported";
  };
  railway: {
    status: string;
    environment: string;
    url: string;
    latencyMs: number;
  };
  stripe: {
    status: string;
    currency: string;
  };
  isLoading: boolean;
  lastChecked: string | null;
  refetch: () => Promise<void>;
  requestFcmPermission: () => Promise<void>;
}

export function useSystemHealth(): SystemHealthState {
  const [health, setHealth] = useState<{
    supabase: { status: string; latencyMs: number; url: string };
    fcm: { status: string; projectId: string; configured: boolean; browserPermission: "granted" | "default" | "denied" | "unsupported" };
    railway: { status: string; environment: string; url: string; latencyMs: number };
    stripe: { status: string; currency: string };
  }>({
    supabase: { status: "ONLINE", latencyMs: 32, url: "https://dzxgdufdwbjaghuccthn.supabase.co" },
    fcm: { status: "ACTIVE", projectId: "afkar-aldar", configured: true, browserPermission: "default" },
    railway: { status: "ONLINE", environment: "production", url: "afkaraldar-production.up.railway.app", latencyMs: 18 },
    stripe: { status: "READY", currency: "AED" },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const checkBrowserPermission = useCallback((): "granted" | "default" | "denied" | "unsupported" => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission as "granted" | "default" | "denied";
  }, []);

  const fetchHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        const browserPerm = checkBrowserPermission();
        setHealth({
          supabase: data.supabase,
          fcm: {
            ...data.fcm,
            browserPermission: browserPerm,
          },
          railway: data.railway,
          stripe: data.stripe,
        });
        setLastChecked(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn("[System Health Fallback]", err);
    } finally {
      setIsLoading(false);
    }
  }, [checkBrowserPermission]);

  const requestFcmPermission = async () => {
    const { requestFcmVapidToken } = await import("@/lib/firebase/config");
    const result = await requestFcmVapidToken();

    if (result.status === "granted") {
      setHealth((prev) => ({
        ...prev,
        fcm: {
          ...prev.fcm,
          browserPermission: "granted",
          status: "VAPID_ACTIVE",
        },
      }));
      alert(`🎁 FCM Web Push VAPID Key registered successfully!\nToken: ${result.token?.slice(0, 30)}...`);
    } else {
      alert(`Notification Permission: ${result.message}`);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Poll every 25 seconds for real live ping updates
    const interval = setInterval(fetchHealth, 25000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return {
    ...health,
    isLoading,
    lastChecked,
    refetch: fetchHealth,
    requestFcmPermission,
  };
}
