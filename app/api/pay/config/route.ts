import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  });
}
