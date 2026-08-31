import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { supabaseAdmin } from "@/lib/supabase/admin";
import fs from "fs";

function formatPrivateKeyString(keyStr: string): string {
  if (!keyStr) return "";
  let res = keyStr.trim();
  if ((res.startsWith('"') && res.endsWith('"')) || (res.startsWith("'") && res.endsWith("'"))) {
    res = res.slice(1, -1);
  }
  if (!res.includes("-----BEGIN PRIVATE KEY-----") && res.length > 50) {
    try {
      const decoded = Buffer.from(res, "base64").toString("utf8");
      if (decoded.includes("-----BEGIN PRIVATE KEY-----")) {
        res = decoded;
      }
    } catch (e) {}
  }
  return res.replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
}

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  let initialized = false;

  // Option 1: Try reading local JSON file if present on disk
  const localJsonPath = "C:\\Users\\koky\\Downloads\\eftikad-kh-firebase-adminsdk-fbsvc-4e4a0d00ac.json";
  if (fs.existsSync(localJsonPath)) {
    try {
      const fileData = JSON.parse(fs.readFileSync(localJsonPath, "utf-8"));
      if (fileData.private_key) {
        fileData.private_key = formatPrivateKeyString(fileData.private_key);
      }
      initializeApp({ credential: cert(fileData) });
      initialized = true;
    } catch (e) {
      console.warn("[Firebase Admin Local JSON Read Warning]", e);
    }
  }

  // Option 2: Service Account JSON string from environment
  if (!initialized && serviceAccountJson) {
    try {
      let rawJson = serviceAccountJson.trim();
      if ((rawJson.startsWith('"') && rawJson.endsWith('"')) || (rawJson.startsWith("'") && rawJson.endsWith("'"))) {
        rawJson = rawJson.slice(1, -1);
      }
      if (!rawJson.startsWith("{") && rawJson.length > 50) {
        try {
          const decodedJson = Buffer.from(rawJson, "base64").toString("utf8");
          if (decodedJson.startsWith("{")) rawJson = decodedJson;
        } catch (e) {}
      }

      const parsedAccount = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
      if (parsedAccount.private_key) {
        parsedAccount.private_key = formatPrivateKeyString(parsedAccount.private_key);
      }
      initializeApp({ credential: cert(parsedAccount) });
      initialized = true;
    } catch (err) {
      console.warn("[Firebase Admin Service Account JSON Error]", err);
    }
  }

  // Option 3: Individual environment variables
  if (!initialized && projectId && clientEmail && rawKey) {
    try {
      const cleanKey = formatPrivateKeyString(rawKey);
      if (cleanKey && cleanKey.includes("MII")) {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: cleanKey,
          }),
        });
        initialized = true;
      } else {
        console.warn("[Firebase Admin Notice] FIREBASE_PRIVATE_KEY is a placeholder or invalid RSA key. Skipping initialization.");
      }
    } catch (err) {
      console.warn("[Firebase Admin Credentials Error]", err);
    }
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

  if (!getApps().length) {
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
    const messaging = getMessaging();

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
