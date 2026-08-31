import * as admin from "firebase-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  try {
    if (serviceAccountJson) {
      const parsedAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(parsedAccount),
      });
    } else if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      console.warn("[Firebase Admin Notice] Firebase Admin SDK is missing service account credentials in .env.local.");
    }
  } catch (err) {
    console.error("[Firebase Admin Initialization Error]", err);
  }
}

export interface SendFcmPushPayload {
  userId?: string;
  tokens?: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendFcmPushNotification(payload: SendFcmPushPayload) {
  const { userId, tokens: providedTokens, title, body, data = {} } = payload;

  if (!admin.apps.length) {
    console.warn("[FCM Warning] Firebase Admin SDK not initialized. Skipping push notification.");
    return { success: false, error: "FIREBASE_ADMIN_UNINITIALIZED" };
  }

  let targetTokens: string[] = providedTokens || [];

  // If userId provided, fetch active FCM tokens from Supabase table `FcmToken`
  if (userId && targetTokens.length === 0) {
    try {
      const { data: dbTokens, error } = await supabaseAdmin
        .from("FcmToken")
        .select("token")
        .eq("userId", userId);

      if (!error && dbTokens && dbTokens.length > 0) {
        targetTokens = dbTokens.map((t: any) => t.token);
      }
    } catch (e) {
      console.warn("[FcmToken Lookup Warning]", e);
    }
  }

  if (targetTokens.length === 0) {
    console.warn(`[FCM Notice] No active FCM tokens found for target userId: ${userId || "general"}`);
    return { success: false, message: "NO_TOKENS_FOUND" };
  }

  try {
    const messaging = admin.messaging();

    const response = await messaging.sendEachForMulticast({
      tokens: targetTokens,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        click_action: data.click_action || data.actionUrl || "https://afkaraldar.ae/notifications",
      },
      webpush: {
        notification: {
          title,
          body,
          icon: "/hero-bg.png",
          badge: "/favicon.ico",
        },
        fcmOptions: {
          link: data.click_action || data.actionUrl || "https://afkaraldar.ae/notifications",
        },
      },
    });

    console.log(`[FCM Multicast Live Success] Sent: ${response.successCount}, Failed: ${response.failureCount}`);
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (err: any) {
    console.error("[FCM Push Notification Exception]", err);
    return { success: false, error: err.message };
  }
}
