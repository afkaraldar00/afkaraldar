import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  // Handle successful payment event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as any;
    const checkoutSlug = paymentIntent.metadata?.checkoutSlug;

    console.log(`[Stripe Webhook Succeeded] Intent ID: ${paymentIntent.id}, Slug: ${checkoutSlug}`);

    try {
      if (checkoutSlug) {
        // Query Order + relation via Supabase
        const { data: order, error: findOrderError } = await supabase
          .from("Order")
          .select("*, payment(*)")
          .eq("checkoutSlug", checkoutSlug)
          .maybeSingle();

        if (findOrderError) throw findOrderError;

        if (order) {
          const isDeposit = order.paymentType === "DEPOSIT";
          const newOrderStatus = isDeposit ? "DEPOSIT_PAID" : "PAID";
          const newPaymentStatus = isDeposit ? "PARTIALLY_PAID" : "PAID";

          // 1. Update Order status
          const { error: updateOrderError } = await supabase
            .from("Order")
            .update({ status: newOrderStatus })
            .eq("id", order.id);

          if (updateOrderError) throw updateOrderError;

          // 2. Add Order status history event
          await supabase.from("OrderStatusEvent").insert({
            orderId: order.id,
            status: newOrderStatus,
            note: `Payment received via Stripe UAE (${paymentIntent.id}). Amount: ${paymentIntent.amount / 100} AED`,
          });

          // 3. Upsert Payment record
          const { error: upsertPayError } = await supabase
            .from("Payment")
            .upsert({
              orderId: order.id,
              status: newPaymentStatus,
              amountPaid: paymentIntent.amount / 100,
              providerRef: paymentIntent.id,
              paidAt: new Date().toISOString(),
              type: order.paymentType || "FULL",
              amountDue: order.paymentType === "DEPOSIT" ? Number(order.depositAmount || 0) : Number(order.finalPrice || 0)
            }, { onConflict: "orderId" });

          if (upsertPayError) throw upsertPayError;

          // 4. Create In-App Notification records for Customer & Admin
          const { error: notifErr } = await supabase.from("Notification").insert([
            {
              userId: order.customerId,
              title: `Payment Received #${order.id}`,
              body: `Payment of AED ${(paymentIntent.amount / 100).toFixed(2)} received for order #${order.id}. Order status updated to ${newOrderStatus}.`,
              type: "PAYMENT",
              amount: paymentIntent.amount / 100,
              orderId: order.id,
            },
            {
              userId: "admin",
              title: `💳 Stripe Payment #${order.id}`,
              body: `Received AED ${(paymentIntent.amount / 100).toFixed(2)} from ${order.deliveryInfo?.customerName || "Customer"}. Status: ${newOrderStatus}.`,
              type: "PAYMENT",
              amount: paymentIntent.amount / 100,
              orderId: order.id,
              actionUrl: `/admin/orders`,
              actionText: "View Order",
            }
          ]);
          if (notifErr) console.warn("[Payment Notification Warning]", notifErr);

          // 5. Send Resend Payment Receipt Email & Admin Alert
          const { sendPaymentReceiptEmail, sendAdminGeneralNotificationEmail } = await import("@/lib/email/resend");
          if (order.deliveryInfo?.customerEmail) {
            await sendPaymentReceiptEmail({
              customerEmail: order.deliveryInfo.customerEmail,
              customerName: order.deliveryInfo.customerName || "Valued Client",
              orderId: order.id,
              amountPaid: paymentIntent.amount / 100,
              paymentType: order.paymentType || "FULL",
              providerRef: paymentIntent.id,
            }).catch((emailErr) => {
              console.warn("[Stripe Payment Email Warning]", emailErr);
            });
          }

          await sendAdminGeneralNotificationEmail({
            title: `💳 Stripe Payment Received #${order.id}`,
            body: `Received AED ${(paymentIntent.amount / 100).toFixed(2)} from ${order.deliveryInfo?.customerName || "Customer"} (${order.deliveryInfo?.customerEmail || "N/A"}). Order Status: ${newOrderStatus}.`,
            category: "PAYMENT",
            actionUrl: "/admin/orders",
          }).catch((adminErr) => console.warn("[Admin Payment Email Warning]", adminErr));

          // 5. Send WhatsApp Payment Confirmation Notification (Meta Cloud API)
          if (order.deliveryInfo?.customerPhone) {
            const { sendWhatsAppText } = await import("@/lib/whatsapp/client");
            const currencySymbol = order.currency || "AED";
            const amountStr = `${currencySymbol} ${(paymentIntent.amount / 100).toFixed(2)}`;
            await sendWhatsAppText({
              to: order.deliveryInfo.customerPhone,
              body: `Hello ${order.deliveryInfo.customerName || "Valued Client"},\n\nWe have successfully received your payment of ${amountStr} for order #${order.id}.\n\nYour bespoke gift box has been added to our hand-assembly queue. Thank you for choosing Afkar AlDar!`,
            }).catch((waErr) => {
              console.warn("[Stripe Payment WhatsApp Warning]", waErr);
            });
          }
        }
      }
    } catch (dbErr) {
      console.error("[Webhook DB Update Error]", dbErr);
    }
  }

  return NextResponse.json({ received: true });
}
