import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { name, email, subject, message, orderId } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    let ticket;
    try {
      const { data: createdTicket, error } = await supabase
        .from("Ticket")
        .insert({
          name,
          email,
          subject,
          message,
          orderId,
          status: "OPEN",
        })
        .select()
        .single();

      if (error) throw error;
      ticket = createdTicket;
    } catch (dbErr: any) {
      console.error("[Database Ticket insertion failed]", dbErr);
      return NextResponse.json({
        success: false,
        error: "Database ticket insertion failed: " + (dbErr?.message || JSON.stringify(dbErr)),
      }, { status: 500 });
    }

    // Insert In-App Notification records for Admin & Customer
    const { error: notifErr } = await supabase.from("Notification").insert([
      {
        userId: "admin",
        title: `💬 New Support Ticket #${ticket.id}`,
        body: `Support inquiry from ${name} (${email}): "${subject}"`,
        type: "TICKET",
        actionUrl: "/admin/tickets",
        actionText: "View Ticket",
      },
      {
        userId: email,
        title: `Support Ticket Opened #${ticket.id}`,
        body: `Your ticket regarding "${subject}" has been received. Our team will get back to you shortly.`,
        type: "TICKET",
      }
    ]);
    if (notifErr) console.warn("[Ticket Notification Insert Warning]", notifErr);

    // Send Resend VIP Ticket Confirmation Email & Admin Alert Email
    const { sendTicketConfirmationEmail, sendAdminGeneralNotificationEmail } = await import("@/lib/email/resend");
    await sendTicketConfirmationEmail({
      customerEmail: email,
      customerName: name,
      ticketId: ticket.id,
      subject,
    }).catch((emailErr) => {
      console.warn("[Ticket Email Warning]", emailErr);
    });

    await sendAdminGeneralNotificationEmail({
      title: `💬 New Support Ticket #${ticket.id}`,
      body: `Support inquiry from ${name} (${email}): "${subject}"\n\nMessage: "${message}"`,
      category: "SUPPORT",
      actionUrl: "/admin/tickets",
    }).catch((adminErr) => console.warn("[Admin Ticket Email Warning]", adminErr));

    // Send WhatsApp Support Ticket Confirmation (Meta Cloud API)
    let customerPhone = null;
    try {
      const { data: customer } = await supabase
        .from("Customer")
        .select("phone")
        .eq("email", email)
        .maybeSingle();
      if (customer?.phone) {
        customerPhone = customer.phone;
      }
    } catch (e) {
      console.warn("[Support WhatsApp Lookup Error]", e);
    }

    if (customerPhone) {
      const { sendWhatsAppText } = await import("@/lib/whatsapp/client");
      await sendWhatsAppText({
        to: customerPhone,
        body: `Hello ${name},\n\nWe have received your support ticket #${ticket.id} regarding "${subject}".\n\nOur team is reviewing your message and a gifting advisor will respond shortly. Thank you!`,
      }).catch((waErr) => {
        console.warn("[Support Ticket WhatsApp Warning]", waErr);
      });
    }

    return NextResponse.json({
      success: true,
      ticket,
      message: "Support ticket submitted successfully",
    });
  } catch (error) {
    console.error("Submit support ticket error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
