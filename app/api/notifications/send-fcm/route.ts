import { NextResponse } from "next/server";
import { sendFcmPushNotification } from "@/lib/firebase/admin";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: "INVALID_JSON_BODY" }, { status: 400 });
    }

    const { userId, tokens, title, body: msgBody, data, category } = body;

    if (!title || !msgBody) {
      return NextResponse.json({ success: false, error: "MISSING_TITLE_OR_BODY" }, { status: 400 });
    }

    // 1. Save Notification record to Supabase database using Service Role (Bypasses RLS)
    let dbSaved = false;
    try {
      const targetUserId = (userId && userId !== "ALL" && userId !== "admin") ? userId : null;
      const { error: dbError } = await supabase.from("Notification").insert({
        userId: targetUserId,
        title,
        body: msgBody,
        type: category || data?.category || "SYSTEM",
      });

      if (!dbError) {
        dbSaved = true;
      } else {
        console.warn("[Send-FCM Database Insert Warning]", dbError);
      }
    } catch (dbEx) {
      console.warn("[Send-FCM Database Exception]", dbEx);
    }

    // 2. Dispatch FCM Web Push Notification safely
    let fcmResult: any = { success: true, delivered: false, message: "Saved to database." };
    try {
      fcmResult = await sendFcmPushNotification({
        userId,
        tokens,
        title,
        body: msgBody,
        data,
      });
    } catch (fcmEx: any) {
      console.warn("[FCM Dispatch Exception]", fcmEx);
      fcmResult = { success: true, delivered: false, error: fcmEx.message };
    }

    return NextResponse.json({
      ...fcmResult,
      dbSaved,
    }, { status: 200 });
  } catch (err: any) {
    console.error("[FCM API Route Exception]", err);
    return NextResponse.json({ success: true, dbSaved: false, error: err.message }, { status: 200 });
  }
}
