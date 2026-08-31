import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (e) {
      console.error("OAuth exchange failed:", e);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/admin`);
}
