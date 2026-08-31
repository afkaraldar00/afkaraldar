import { NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/email/resend";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Recipient email is required" }, { status: 400 });
    }

    const result = await sendOrderConfirmationEmail({
      customerEmail: email,
      customerName: "Test VIP Client",
      orderId: `TEST-${Date.now().toString().slice(-4)}`,
      occasionSlug: "anniversary",
      estimatedPrice: 1720,
      boxColor: "Royal Navy Velvet",
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          status: result.status || "UNCONFIGURED",
          error: result.error || "EMAIL_DISPATCH_FAILED",
          message: result.message || "Failed to dispatch email via Resend API",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: 200,
      id: result.data?.id,
      message: `Real test email successfully dispatched via Resend to ${email}!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
