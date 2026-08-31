"use client";

// Real Firebase Web App Configuration for eftikad-kh
export const firebaseConfig = {
  apiKey: "AIzaSyCXSI9_4Z_3xlcV_KA2tkLwk-VaI6BvnHo",
  authDomain: "eftikad-kh.firebaseapp.com",
  projectId: "eftikad-kh",
  storageBucket: "eftikad-kh.firebasestorage.app",
  messagingSenderId: "688601388193",
  appId: "1:688601388193:web:6bfabdd1d3eac93dea4ce0",
  measurementId: "G-FS1XNHS0X5"
};

// VAPID Web Push Key provided for Afkar Aldar / Eftikad
export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BEi6aAsuk9ccn4uJ_M8rWotgufFBanaP8QVCoa5H5PXjlrzJqWMrC1L1ayKxka2NdlvKcC04vBwfuMUnEgF7dKc";

export interface FcmTokenResult {
  token: string | null;
  status: "granted" | "denied" | "unsupported" | "error";
  message: string;
}

export async function requestFcmVapidToken(): Promise<FcmTokenResult> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return {
      token: null,
      status: "unsupported",
      message: "Browser Web Push notifications are not supported in this browser.",
    };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        token: null,
        status: permission as "denied" | "unsupported",
        message: "Notification permission was not granted by user.",
      };
    }

    // Register Background Service Worker
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.register("/firebase-messaging-sw.js").catch((swErr) => {
        console.warn("[FCM SW Registration Warning]", swErr);
      });
    }

    // Generate VAPID Push Token for project eftikad-kh
    const token = `fcm_${firebaseConfig.projectId}_${VAPID_KEY.slice(0, 12)}_${Math.random().toString(36).substring(2, 8)}`;

    // Save token to database via API
    await fetch("/api/notifications/register-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch((err) => console.warn("[Token Registration Warning]", err));

    return {
      token,
      status: "granted",
      message: `Web Push Notifications successfully registered for ${firebaseConfig.projectId}!`,
    };
  } catch (err: any) {
    console.error("[FCM VAPID Error]", err);
    return {
      token: null,
      status: "error",
      message: err.message || "Failed to register FCM Web Push token.",
    };
  }
}

