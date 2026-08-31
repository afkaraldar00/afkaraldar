import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { userId, token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: "Token is required" }, { status: 400 });
    }

    // Upsert into FcmToken table
    const { data, error } = await supabase
      .from("FcmToken")
      .upsert({
        userId: userId || "guest",
        token,
      }, { onConflict: "token" })
      .select()
      .single();

    if (error) {
      console.error("[FcmToken Registration Error]", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, token: data });
  } catch (err: any) {
    console.error("[FcmToken Exception]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
