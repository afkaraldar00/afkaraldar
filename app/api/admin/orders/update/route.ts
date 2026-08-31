import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { sendWhatsAppText } from "@/lib/whatsapp/client";
import { sendFcmPushNotification } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { id, status, finalPrice, paymentType, depositAmount, checkoutActive } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing order ID" }, { status: 400 });
    }

    // 1. Fetch current order
    const { data: order, error: fetchErr } = await supabase
      .from("Order")
      .select("*, Customer(*)")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // 2. Build update payload
    const updatePayload: any = {};
    if (status !== undefined) updatePayload.status = status;
    if (finalPrice !== undefined) updatePayload.finalPrice = parseFloat(finalPrice) || null;
    if (paymentType !== undefined) updatePayload.paymentType = paymentType;
    if (depositAmount !== undefined) updatePayload.depositAmount = parseFloat(depositAmount) || null;
    if (checkoutActive !== undefined) updatePayload.checkoutActive = checkoutActive;

    // 3. Perform update in Order
    const { error: updateErr } = await supabase
      .from("Order")
      .update(updatePayload)
      .eq("id", id);

    if (updateErr) throw updateErr;

    // 4. Create OrderStatusEvent record
    const statusNote = status 
      ? `Status updated to ${status.replace("_", " ")}` 
      : `Order settings updated (price: AED ${finalPrice}, checkout: ${checkoutActive ? "ACTIVE" : "INACTIVE"})`;
      
    await supabase.from("OrderStatusEvent").insert({
      orderId: id,
      status: status || order.status,
      note: statusNote,
    });

    const customerEmail = order.deliveryInfo?.customerEmail;
    const customerPhone = order.deliveryInfo?.customerPhone;
    const customerName = order.deliveryInfo?.customerName || "Valued Customer";

    // 5. Create Database in-app notification
    await supabase.from("Notification").insert({
      userId: order.customerId,
      title: `Order #${id} Updated`,
      body: statusNote,
      type: "ORDER_STATUS",
    });

    // 6. Trigger notifications depending on update type
    if (status && status !== order.status) {
      const formattedStatus = status.replace("_", " ");

      // A. Dispatch FCM Browser Push Notification to Customer
      if (order.customerId) {
        sendFcmPushNotification({
          userId: order.customerId,
          title: `📦 Order #${id} Updated: ${formattedStatus}`,
          body: `Dear ${customerName}, your gift box order #${id} status is now ${formattedStatus}.`,
          data: {
            orderId: id,
            click_action: `/track`,
          },
        }).catch(e => console.error("FCM Push Dispatch Error:", e));
      }

      // B. Awaiting Payment Notification (Checkout activated)
      if (status === "AWAITING_PAYMENT") {
        const checkoutUrl = `${new URL(request.url).origin.replace(/\/api\/admin.*/, "")}/pay/${order.checkoutSlug}`;
        
        // Email
        if (customerEmail) {
          await sendEmail({
            to: customerEmail,
            subject: `💳 Complete Your Payment — Order #${id} — Afkar AlDar`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #AD7D39; border-radius: 12px; background: #FFF;">
                <h2 style="color: #191611; font-family: serif; border-bottom: 2px solid #AD7D39; padding-bottom: 10px;">Payment Link Activated</h2>
                <p>Dear ${customerName},</p>
                <p>Your custom gift box design has been approved by our gifting advisors!</p>
                <p><strong>Final Price:</strong> AED ${(parseFloat(finalPrice) || 0).toFixed(2)}</p>
                <p>Please review and complete your payment online using the link below:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${checkoutUrl}" style="background: linear-gradient(135deg, #AD7D39 0%, #7D5121 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(173,125,57,0.3);">Complete Payment</a>
                </div>
                <p style="color: #625D55; font-size: 13px;">If you have any questions, feel free to reply to this email or chat with our team on WhatsApp.</p>
              </div>
            `
          }).catch(e => console.error("Email send failed:", e));
        }

        // WhatsApp
        if (customerPhone) {
          const bodyText = `Hello ${customerName},\n\nYour customized gift box order #${id} has been approved and is ready for payment!\n\nFinal Price: AED ${(parseFloat(finalPrice) || 0).toFixed(2)}\n\nView details & pay securely here:\n${checkoutUrl}\n\nThank you for choosing Afkar AlDar.`;
          await sendWhatsAppText({ to: customerPhone, body: bodyText }).catch(e => console.error("WhatsApp failed:", e));
        }
      } 
      // C. General Status Update Notification (Preparing, Shipped, Delivered, etc.)
      else {
        // Email
        if (customerEmail) {
          await sendEmail({
            to: customerEmail,
            subject: `📦 Order #${id} Status Update: ${formattedStatus} — Afkar AlDar`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #AD7D39; border-radius: 12px; background: #FFF;">
                <h2 style="color: #191611; font-family: serif; border-bottom: 2px solid #AD7D39; padding-bottom: 10px;">Order Status Update</h2>
                <p>Dear ${customerName},</p>
                <p>We are pleased to inform you that your bespoke gift box order <strong>#${id}</strong> has transitioned to status: <strong>${formattedStatus}</strong>.</p>
                <p>Our gifting specialists are handling every detail of your request with care.</p>
              </div>
            `
          }).catch(e => console.error("Email send failed:", e));
        }

        // WhatsApp
        if (customerPhone) {
          const bodyText = `Hello ${customerName},\n\nYour bespoke gift box order #${id} status has been updated to: ${formattedStatus}.\n\nThank you for choosing Afkar AlDar!`;
          await sendWhatsAppText({ to: customerPhone, body: bodyText }).catch(e => console.error("WhatsApp failed:", e));
        }
      }
    }

    return NextResponse.json({ success: true, message: "Order updated successfully" });
  } catch (error: any) {
    console.error("Order status update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
