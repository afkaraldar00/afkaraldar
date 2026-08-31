import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { occasionSlug, customization, deliveryInfo } = body;

    if (!deliveryInfo?.customerName || !deliveryInfo?.customerEmail || !deliveryInfo?.customerPhone) {
      return NextResponse.json({ success: false, error: "Missing required contact details" }, { status: 400 });
    }

    const orderId = `AFK-${Date.now().toString().slice(-6)}`;
    const checkoutSlug = `pay-${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;

    let newOrder;

    try {
      // 1. Find or create customer in Supabase
      let { data: customer, error: findCustError } = await supabase
        .from("Customer")
        .select("*")
        .eq("email", deliveryInfo.customerEmail)
        .maybeSingle();

      if (findCustError) throw findCustError;

      if (!customer) {
        const generatedCustId = `cust_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
        const { data: createdCust, error: createCustError } = await supabase
          .from("Customer")
          .insert({
            id: generatedCustId,
            name: deliveryInfo.customerName,
            email: deliveryInfo.customerEmail,
            phone: deliveryInfo.customerPhone,
          })
          .select()
          .single();

        if (createCustError) throw createCustError;
        customer = createdCust;
      }

      // 2. Find or create Occasion
      let { data: occasion, error: findOccError } = await supabase
        .from("Occasion")
        .select("*")
        .eq("slug", occasionSlug || "birthday")
        .maybeSingle();

      if (findOccError) throw findOccError;

      if (!occasion) {
        const generatedOccId = `occ_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
        const { data: newOcc, error: createOccError } = await supabase
          .from("Occasion")
          .insert({
            id: generatedOccId,
            slug: occasionSlug || "birthday",
            name: occasionSlug || "Birthday Celebrations"
          })
          .select()
          .single();

        if (createOccError) throw createOccError;
        occasion = newOcc;
      }

      // 3. Find or create GiftBox
      let { data: giftBox, error: findBoxError } = await supabase
        .from("GiftBox")
        .select("*")
        .eq("occasionId", occasion.id)
        .maybeSingle();

      if (findBoxError) throw findBoxError;

      if (!giftBox) {
        const generatedBoxId = `box_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
        const { data: newBox, error: createBoxError } = await supabase
          .from("GiftBox")
          .insert({
            id: generatedBoxId,
            slug: `${occasionSlug || "birthday"}-custom-box-${Date.now()}`,
            name: `Custom ${occasionSlug || "Birthday"} Gift Box`,
            description: "Bespoke gift box tailored via interactive customizer",
            images: ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000"],
            occasionId: occasion.id,
          })
          .select()
          .single();

        if (createBoxError) throw createBoxError;
        giftBox = newBox;
      }

      // 4. Create the order
      const { data: createdOrder, error: createOrderError } = await supabase
        .from("Order")
        .insert({
          id: orderId,
          customerId: customer.id,
          giftBoxId: giftBox.id,
          occasionSlug: occasionSlug || "birthday",
          customization,
          deliveryInfo,
          status: "NEW_REQUEST",
          checkoutSlug,
        })
        .select()
        .single();

      if (createOrderError) throw createOrderError;

      // 4. Record order status history event
      await supabase.from("OrderStatusEvent").insert({
        orderId: orderId,
        status: "NEW_REQUEST",
        note: "Order request submitted via interactive customizer",
      });

      // 5. Create In-App Notification records for Customer & Admin
      const { error: notifErr } = await supabase.from("Notification").insert([
        {
          userId: customer.id,
          title: `Curation Request Received #${orderId}`,
          body: `Your custom gift box request for ${occasionSlug || "birthday"} has been received. Our advisors are reviewing your design.`,
          type: "ORDER_STATUS",
          orderId: orderId,
        },
        {
          userId: "admin",
          title: `🎁 New Order Request #${orderId}`,
          body: `New ${occasionSlug || "birthday"} gift box request from ${deliveryInfo.customerName} (${deliveryInfo.emirate || "Dubai"}).`,
          type: "ORDER_STATUS",
          orderId: orderId,
          actionUrl: `/admin/orders`,
          actionText: "Review Order",
        }
      ]);
      if (notifErr) console.warn("[Notification Insert Warning]", notifErr);

      // 6. Send Resend Transactional Confirmation Email to Customer & Alert Email to Admin
      const { sendOrderConfirmationEmail, sendAdminNewOrderNotificationEmail } = await import("@/lib/email/resend");
      await sendOrderConfirmationEmail({
        customerEmail: deliveryInfo.customerEmail,
        customerName: deliveryInfo.customerName,
        orderId,
        occasionSlug: occasionSlug || "birthday",
        estimatedPrice: customization?.totalPrice || 1720,
        boxColor: customization?.boxColor?.name || customization?.boxColor,
      }).catch((emailErr) => {
        console.warn("[Email Notification Warning]", emailErr);
      });

      // Send instant Admin Email Alert
      await sendAdminNewOrderNotificationEmail({
        orderId,
        customerName: deliveryInfo.customerName,
        customerEmail: deliveryInfo.customerEmail,
        customerPhone: deliveryInfo.customerPhone,
        occasionSlug: occasionSlug || "birthday",
        emirate: deliveryInfo.emirate || "Dubai",
        customization,
      }).catch((adminEmailErr) => {
        console.warn("[Admin Email Notification Warning]", adminEmailErr);
      });

      // 7. Send WhatsApp API Order Confirmation Notification (Meta Cloud API)
      const { sendWhatsAppTemplate } = await import("@/lib/whatsapp/client");
      await sendWhatsAppTemplate({
        to: deliveryInfo.customerPhone,
        customerName: deliveryInfo.customerName,
        orderId,
        deliveryDetail: deliveryInfo.emirate || "Dubai",
      }).catch((waErr) => {
        console.warn("[WhatsApp Notification Warning]", waErr);
      });

      newOrder = createdOrder;
    } catch (dbErr: any) {
      console.error("[Database insertion failed]", dbErr);
      return NextResponse.json({
        success: false,
        error: "Database insertion failed: " + (dbErr?.message || JSON.stringify(dbErr)),
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: "Order request submitted successfully",
    });
  } catch (error) {
    console.error("Submit request error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
