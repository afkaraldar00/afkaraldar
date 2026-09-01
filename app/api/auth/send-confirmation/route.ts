import { NextResponse } from "next/server";
import { sendWelcomeConfirmationEmail } from "@/lib/email/resend";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { email, name, userId } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split("@")[0] || "Valued Customer").trim();

    // 1. Upsert Customer record into database via service role
    try {
      await supabase.from("Customer").upsert({
        email: cleanEmail,
        name: cleanName,
        authUserId: userId || null,
      }, { onConflict: "email" });
    } catch (dbErr) {
      console.warn("[Auth Confirmation DB Customer Notice]", dbErr);
    }

    // 2. Dispatch luxury Welcome & Account Confirmation email via Resend
    const emailResult = await sendWelcomeConfirmationEmail({
      to: cleanEmail,
      name: cleanName,
      confirmationUrl: `https://www.afkaraldar.ae/auth`,
    });

    return NextResponse.json({
      success: true,
      message: "Account confirmation and welcome email dispatched successfully!",
      emailResult,
    });
  } catch (err: any) {
    console.error("[Auth Send Confirmation Exception]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
