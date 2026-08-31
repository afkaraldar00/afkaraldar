import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";

export async function POST(request: Request) {
  try {
    const { checkoutSlug, amount, currency = "AED", customerEmail } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid payment amount" }, { status: 400 });
    }

    // Amount in Stripe is in smallest currency unit (e.g. fils for AED, 100 fils = 1 AED)
    const amountInSubunits = Math.round(parseFloat(amount) * 100);

    let clientSecret = "";
    let paymentIntentId = "";

    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey || stripeKey.includes("sk_test_mock")) {
        clientSecret = "mock_client_secret_for_dev";
        paymentIntentId = "pi_mock_123456789";
      } else {
        const paymentParams: any = {
          amount: amountInSubunits,
          currency: currency.toLowerCase(),
          metadata: { checkoutSlug },
          automatic_payment_methods: {
            enabled: true,
          },
        };

        if (customerEmail && customerEmail.includes("@")) {
          paymentParams.receipt_email = customerEmail.trim();
        }

        const paymentIntent = await stripe.paymentIntents.create(paymentParams);

        clientSecret = paymentIntent.client_secret || "";
        paymentIntentId = paymentIntent.id;
      }
    } catch (stripeErr: any) {
      console.error("[Stripe error creating PaymentIntent]", stripeErr);
      return NextResponse.json({
        success: false,
        error: "Stripe error: " + (stripeErr?.message || JSON.stringify(stripeErr)),
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      clientSecret,
      paymentIntentId,
      amount,
      currency,
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
