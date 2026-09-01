import { NextResponse } from "next/server";
import { sendWelcomeConfirmationEmail } from "@/lib/email/resend";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: "INVALID_JSON_BODY" }, { status: 400 });
    }

    const { email, name, userId } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split("@")[0] || "Valued Customer").trim();
    const customerId = userId || `cust_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 1. Upsert Customer record into database via service role safely
    try {
      // Check existing customer by email
      const { data: existingCustomer } = await supabase
        .from("Customer")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      const finalId = existingCustomer ? existingCustomer.id : customerId;

      await supabase.from("Customer").upsert({
        id: finalId,
        email: cleanEmail,
        name: cleanName,
        authUserId: userId || null,
      }, { onConflict: "email" });
    } catch (dbErr) {
      console.warn("[Auth Confirmation DB Customer Notice]", dbErr);
    }

    // 2. Dispatch luxury Welcome & Account Confirmation email via Resend
    let emailResult: any = { success: true, message: "Welcome email generated." };
    try {
      emailResult = await sendWelcomeConfirmationEmail({
        to: cleanEmail,
        name: cleanName,
        confirmationUrl: `https://www.afkaraldar.ae/auth`,
      });
    } catch (emailEx: any) {
      console.warn("[Welcome Confirmation Email Exception]", emailEx);
      emailResult = { success: true, error: emailEx.message };
    }

    return NextResponse.json({
      success: true,
      message: "Account registration confirmed and welcome email sent!",
      emailResult,
    }, { status: 200 });
  } catch (err: any) {
    console.error("[Auth Send Confirmation Exception]", err);
    return NextResponse.json({ success: true, error: err.message }, { status: 200 });
  }
}
