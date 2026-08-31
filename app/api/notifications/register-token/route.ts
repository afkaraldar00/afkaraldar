import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { userId, token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: "Token is required" }, { status: 400 });
    }

    let targetUserId: string | null = null;

    if (userId && userId !== "guest") {
      // 1. Try finding matching Customer record by ID, authUserId, or email
      const { data: customer } = await supabase
        .from("Customer")
        .select("id")
        .or(`id.eq.${userId},authUserId.eq.${userId},email.eq.${userId}`)
        .maybeSingle();

      if (customer) {
        targetUserId = customer.id;
      }
    }

    // Attempt upsert with resolved targetUserId
    let insertPayload: any = { token };
    if (targetUserId) {
      insertPayload.userId = targetUserId;
    }

    const { data, error } = await supabase
      .from("FcmToken")
      .upsert(insertPayload, { onConflict: "token" })
      .select()
      .maybeSingle();

    if (error) {
      console.warn("[FcmToken Primary Upsert Notice]", error);
      // Fallback: If foreign key constraint failed on userId, insert token without foreign key binding
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("FcmToken")
        .upsert({ token }, { onConflict: "token" })
        .select()
        .maybeSingle();

      if (fallbackError) {
        console.error("[FcmToken Fallback Error]", fallbackError);
        return NextResponse.json({ success: false, error: fallbackError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, token: fallbackData });
    }

    return NextResponse.json({ success: true, token: data });
  } catch (err: any) {
    console.error("[FcmToken Exception]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
