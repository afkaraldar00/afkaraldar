import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_key_for_development", {
  apiVersion: "2025-02-24.acacia" as any,
  appInfo: {
    name: "Afkar Aldar Luxury Gifting",
    version: "1.0.0",
  },
});
