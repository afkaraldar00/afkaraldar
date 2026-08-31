import { formatCurrency } from "@/lib/dictionary";

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = from || process.env.EMAIL_FROM || "Afkar AlDar Gifting <support@afkaraldar.ae>";

  // Strict check: Fail immediately if key is missing or default placeholder
  if (!apiKey || apiKey === "re_123456789" || apiKey.includes("your_actual_key")) {
    const errorMsg = "[Resend Notice] Please add your real RESEND_API_KEY (re_...) to .env.local to send live emails.";
    console.warn(errorMsg);
    return {
      success: false,
      status: "UNCONFIGURED",
      error: "MISSING_RESEND_API_KEY",
      message: errorMsg,
    };
  }

  const recipients = Array.isArray(to)
    ? to.map((e) => e.trim()).filter(Boolean)
    : to.split(",").map((e) => e.trim()).filter(Boolean);

  if (recipients.length === 0) {
    return { success: false, error: "NO_RECIPIENTS_PROVIDED" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom,
        to: recipients,
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`[Resend API Error ${res.status}]`, data);
      return {
        success: false,
        status: res.status,
        error: data.name || "RESEND_API_ERROR",
        message: data.message || `Resend returned HTTP ${res.status}`,
        data,
      };
    }

    console.log(`[Afkar AlDar Email Delivered Live] ID: ${data.id}, To: ${recipients.join(", ")}`);
    return { success: true, status: 200, data };
  } catch (err: any) {
    console.error("[Resend Network Exception]", err);
    return { success: false, status: 500, error: err.message };
  }
}

// ----------------------------------------------------
// AFKAR ALDAR (أفكار الدار) CREATIVE EMAIL TEMPLATES
// ----------------------------------------------------

// 1. Order Curation Request Confirmation Email
export async function sendOrderConfirmationEmail(params: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  occasionSlug: string;
  estimatedPrice: number;
  boxColor?: string;
}) {
  const { customerEmail, customerName, orderId, occasionSlug, estimatedPrice, boxColor } = params;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Afkar AlDar — Curation Request #${orderId}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FBF8F3; color: #191611; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #FBF8F3; padding: 40px 10px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid rgba(173, 125, 57, 0.3); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
        .header { background: #191611; padding: 36px 20px; text-align: center; border-bottom: 3px solid #AD7D39; }
        .arabic-title { font-size: 26px; font-weight: bold; color: #AD7D39; letter-spacing: 2px; margin: 0 0 4px 0; font-family: 'Traditional Arabic', Georgia, serif; }
        .english-title { font-size: 14px; font-weight: 700; color: #ffffff; letter-spacing: 5px; text-transform: uppercase; margin: 0; }
        .tagline { font-size: 9px; color: #D4BA99; letter-spacing: 3px; text-transform: uppercase; margin-top: 6px; }
        .content { padding: 36px 32px; }
        .greeting { font-size: 20px; font-weight: 700; color: #191611; margin-bottom: 12px; }
        .intro-text { font-size: 14px; color: #625D55; line-height: 1.6; margin-bottom: 24px; }
        .card { background: #F6F0E7; padding: 24px; border-radius: 16px; border: 1px solid #E9DBC6; margin: 24px 0; }
        .badge { display: inline-block; background: linear-gradient(135deg, #AD7D39 0%, #7D5121 100%); color: #ffffff; padding: 5px 12px; font-size: 9px; font-weight: 800; border-radius: 6px; text-transform: uppercase; letter-spacing: 1.5px; }
        .order-title { font-size: 18px; font-weight: 700; color: #191611; margin: 14px 0 8px 0; }
        .detail-row { display: flex; justify-content: space-between; font-size: 13px; color: #625D55; padding: 6px 0; border-bottom: 1px border; border-color: rgba(173,125,57,0.15); }
        .price-tag { font-size: 22px; font-weight: 800; color: #7D5121; margin-top: 14px; }
        .btn-container { text-align: center; margin-top: 32px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #AD7D39 0%, #7D5121 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; box-shadow: 0 4px 15px rgba(173, 125, 57, 0.3); }
        .footer { background: #191611; padding: 24px 20px; text-align: center; color: #8A8378; font-size: 11px; }
        .footer a { color: #AD7D39; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <!-- Emblem Header -->
          <div class="header">
            <div class="arabic-title">أفكار الدار</div>
            <div class="english-title">AFKAR ALDAR</div>
            <div class="tagline">Bespoke Luxury Gift Boxes • Dubai & UAE</div>
          </div>

          <!-- Body Content -->
          <div class="content">
            <div class="greeting">Dear ${customerName || "Valued VIP Client"},</div>
            <div class="intro-text">
              Thank you for choosing <strong>Afkar AlDar (أفكار الدار)</strong> for your celebration. Your bespoke gift box curation request has been received by our master gifting artisans in Dubai.
            </div>
            
            <!-- Box Details Luxury Card -->
            <div class="card">
              <span class="badge">أفكار الدار • REQUEST CONFIRMED</span>
              <div class="order-title">Order Reference: #${orderId}</div>
              
              <table width="100%" style="font-size: 13px; color: #625D55; border-collapse: collapse; margin-top: 12px;">
                <tr>
                  <td style="padding: 6px 0; font-weight: 600;">Occasion:</td>
                  <td style="padding: 6px 0; text-align: right; color: #191611; font-weight: 700;">${occasionSlug.toUpperCase()}</td>
                </tr>
                ${boxColor ? `
                <tr>
                  <td style="padding: 6px 0; font-weight: 600;">Velvet Box Color:</td>
                  <td style="padding: 6px 0; text-align: right; color: #191611; font-weight: 700;">${boxColor}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding: 6px 0; font-weight: 600;">Gifting Service:</td>
                  <td style="padding: 6px 0; text-align: right; color: #AD7D39; font-weight: 700;">White-Glove Express UAE</td>
                </tr>
              </table>

              <div class="price-tag">
                Estimated Value: ${formatCurrency(estimatedPrice)}
              </div>
            </div>

            <div class="intro-text">
              Our luxury gifting team is reviewing your bespoke specifications. You will receive a direct WhatsApp update and payment link as soon as your design is approved.
            </div>

            <!-- CTA Button -->
            <div class="btn-container">
              <a href="https://afkaraldar.ae/track" class="btn">Track Your Afkar AlDar Box</a>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0 0 6px 0; color: #D4BA99; font-weight: bold; font-size: 12px;">Afkar AlDar Support Operations</p>
            <p style="margin: 0 0 10px 0;">WhatsApp Support: <a href="https://wa.me/971501234567">+971 50 123 4567</a> | Email: <a href="mailto:support@afkaraldar.ae">support@afkaraldar.ae</a></p>
            <p style="margin: 0; font-size: 10px;">© 2026 Afkar AlDar (أفكار الدار). All Rights Reserved. Crafted with ❤️ in Dubai, UAE</p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `🎁 Curation Request Confirmed #${orderId} — Afkar AlDar (أفكار الدار)`,
    html,
  });
}

// 2. Stripe Deposit & Payment Receipt Email
export async function sendPaymentReceiptEmail(params: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  amountPaid: number;
  paymentType: "DEPOSIT" | "FULL";
  providerRef: string;
}) {
  const { customerEmail, customerName, orderId, amountPaid, paymentType, providerRef } = params;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt #${orderId} — Afkar AlDar</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FBF8F3; color: #191611; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #AD7D39; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
        .header { background: #191611; padding: 30px; text-align: center; border-bottom: 3px solid #AD7D39; }
        .arabic-title { font-size: 24px; font-weight: bold; color: #AD7D39; }
        .english-title { font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 4px; }
        .content { padding: 32px; }
        .card { background: #F6F0E7; padding: 24px; border-radius: 16px; border: 1px solid #E9DBC6; margin: 20px 0; }
        .badge { background: #059669; color: #ffffff; padding: 5px 12px; font-size: 9px; font-weight: bold; border-radius: 6px; text-transform: uppercase; }
        .price { font-size: 24px; font-weight: bold; color: #059669; }
        .footer { background: #191611; padding: 20px; text-align: center; color: #8A8378; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="arabic-title">أفكار الدار</div>
          <div class="english-title">AFKAR ALDAR</div>
          <p style="font-size: 10px; color: #D4BA99; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px;">Official Payment Receipt • Dubai, UAE</p>
        </div>
        <div class="content">
          <h2 style="margin-top: 0; color: #191611;">Payment Receipt</h2>
          <p>Dear ${customerName || "Valued VIP Client"},</p>
          <p>We have successfully received your payment for bespoke order <strong>#${orderId}</strong> via Stripe UAE.</p>
          
          <div class="card">
            <span class="badge">PAYMENT CONFIRMED</span>
            <h3 style="margin-top: 12px; margin-bottom: 6px;">Amount Received: <span class="price">${formatCurrency(amountPaid)}</span></h3>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Payment Tier:</strong> ${paymentType === "DEPOSIT" ? "50% Curation Booking Deposit" : "Full Payment"}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Stripe Transaction Ref:</strong> <code style="background: #ffffff; padding: 3px 8px; border-radius: 4px; font-family: monospace;">${providerRef}</code></p>
          </div>

          <p style="font-size: 13px; color: #625D55;">Your bespoke velvet gift box is now officially queued for handcrafted packaging and gold foil ribbon embellishment.</p>
        </div>
        <div class="footer">
          <p style="margin: 0; color: #D4BA99;">© 2026 Afkar AlDar (أفكار الدار). All Rights Reserved. Crafted with ❤️ in Dubai, UAE</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `💳 Payment Receipt #${orderId} — Afkar AlDar (أفكار الدار)`,
    html,
  });
}

// 3. VIP Support Ticket Confirmation Email
export async function sendTicketConfirmationEmail(params: {
  customerEmail: string;
  customerName: string;
  ticketId: string;
  subject: string;
}) {
  const { customerEmail, customerName, ticketId, subject } = params;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>VIP Support Ticket #${ticketId} — Afkar AlDar</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FBF8F3; color: #191611; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #AD7D39; overflow: hidden; }
        .header { background: #191611; padding: 24px; text-align: center; border-bottom: 2px solid #AD7D39; }
        .arabic-title { font-size: 22px; font-weight: bold; color: #AD7D39; }
        .english-title { font-size: 11px; font-weight: 700; color: #ffffff; letter-spacing: 3px; }
        .content { padding: 28px; }
        .footer { background: #191611; padding: 18px; text-align: center; color: #8A8378; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="arabic-title">أفكار الدار</div>
          <div class="english-title">AFKAR ALDAR SUPPORT</div>
        </div>
        <div class="content">
          <h2 style="margin-top: 0;">VIP Support Ticket Created</h2>
          <p>Dear ${customerName || "Valued Client"},</p>
          <p>Your inquiry has been assigned to a dedicated Support Advisor at Afkar AlDar in Dubai.</p>
          <div style="background: #F6F0E7; padding: 18px; border-radius: 12px; border: 1px solid #E9DBC6; margin: 18px 0;">
            <p style="margin: 0; font-size: 13px;"><strong>Ticket Reference:</strong> #${ticketId}</p>
            <p style="margin: 6px 0 0 0; font-size: 13px;"><strong>Subject:</strong> ${subject}</p>
          </div>
          <p style="font-size: 13px; color: #625D55;">We aim to respond to all VIP inquiries within 2 hours during business hours (Mon-Sat, 9AM-8PM GST).</p>
        </div>
        <div class="footer">
          <p style="margin: 0; color: #D4BA99;">© 2026 Afkar AlDar (أفكار الدار) Support • Dubai, UAE</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `💬 Support Ticket Opened #${ticketId} — Afkar AlDar (أفكار الدار)`,
    html,
  });
}

// Helper to collect all Admin Emails from DB & Env
export async function getAdminRecipients(): Promise<string[]> {
  const envAdmins = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || "support@afkaraldar.ae")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/admin");
    const { data: adminUsers } = await supabaseAdmin.from("AdminUser").select("authUserId");
    if (adminUsers && adminUsers.length > 0) {
      const authUserIds = adminUsers.map((a: any) => a.authUserId).filter(Boolean);
      if (authUserIds.length > 0) {
        const { data: custAdmins } = await supabaseAdmin
          .from("Customer")
          .select("email")
          .in("authUserId", authUserIds);
        if (custAdmins) {
          custAdmins.forEach((c: any) => {
            if (c.email) envAdmins.push(c.email);
          });
        }
      }
    }
  } catch (e) {
    console.warn("[getAdminRecipients Warning]", e);
  }

  return Array.from(new Set(envAdmins));
}

// 4. Admin Alert: New Gift Box Order Submitted Email
export async function sendAdminNewOrderNotificationEmail(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  occasionSlug: string;
  emirate?: string;
  customization?: any;
}) {
  const { orderId, customerName, customerEmail, customerPhone, occasionSlug, emirate, customization } = params;

  const adminRecipients = await getAdminRecipients();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>🚨 NEW ORDER ALERT #${orderId} — Afkar AlDar Admin</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #191611; color: #ffffff; margin: 0; padding: 20px; }
        .container { max-width: 650px; margin: 0 auto; background: #24201B; border-radius: 20px; border: 2px solid #AD7D39; overflow: hidden; }
        .header { background: #191611; padding: 28px; text-align: center; border-bottom: 2px solid #AD7D39; }
        .alert-badge { display: inline-block; background: #AD7D39; color: #191611; padding: 6px 14px; font-weight: 800; font-size: 11px; border-radius: 6px; text-transform: uppercase; letter-spacing: 2px; }
        .title { font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 10px; }
        .content { padding: 30px; font-size: 14px; color: #D4BA99; }
        .card { background: #191611; padding: 20px; border-radius: 14px; border: 1px solid rgba(173,125,57,0.3); margin: 20px 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(173,125,57,0.15); font-size: 13px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #AD7D39 0%, #7D5121 100%); color: #ffffff !important; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 1.5px; }
        .footer { background: #191611; padding: 20px; text-align: center; font-size: 11px; color: #8A8378; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="alert-badge">🎁 CONCIERGE ALERT • NEW ORDER</span>
          <div class="title">Order Request #${orderId} Received</div>
        </div>
        <div class="content">
          <p style="color: #ffffff; font-size: 16px;">Hello Admin Concierge Team,</p>
          <p>A new luxury gift box curation request has just been submitted via the Afkar AlDar store interactive customizer.</p>

          <div class="card">
            <h3 style="color: #AD7D39; margin-top: 0;">Customer Contact Information</h3>
            <table width="100%" style="color: #ffffff; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Customer Name:</td>
                <td style="padding: 6px 0; text-align: right; color: #D4BA99;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Email:</td>
                <td style="padding: 6px 0; text-align: right; color: #D4BA99;">${customerEmail}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Phone / WhatsApp:</td>
                <td style="padding: 6px 0; text-align: right; color: #AD7D39; font-weight: bold;">${customerPhone}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Destination Emirate:</td>
                <td style="padding: 6px 0; text-align: right; color: #D4BA99;">${emirate || "Dubai"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Occasion Theme:</td>
                <td style="padding: 6px 0; text-align: right; color: #AD7D39; font-weight: bold;">${occasionSlug.toUpperCase()}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://afkaraldar.ae/admin/orders" class="btn">Open Admin Operations Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0;">Afkar AlDar Concierge Operations • Dubai, UAE</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminRecipients,
    subject: `🚨 NEW ORDER #${orderId} — ${customerName} (${emirate || "Dubai"}) — Afkar AlDar Admin`,
    html,
  });
}

// 5. Admin Alert: General System & Support Notification Email
export async function sendAdminGeneralNotificationEmail(params: {
  title: string;
  body: string;
  category?: string;
  actionUrl?: string;
}) {
  const { title, body, category = "SYSTEM", actionUrl } = params;
  const adminRecipients = await getAdminRecipients();

  const targetUrl = actionUrl
    ? (actionUrl.startsWith("http") ? actionUrl : `https://afkaraldar.ae${actionUrl}`)
    : "https://afkaraldar.ae/admin/notifications";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>🔔 ${title} — Afkar AlDar Admin</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #191611; color: #ffffff; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #24201B; border-radius: 20px; border: 2px solid #AD7D39; overflow: hidden; }
        .header { background: #191611; padding: 24px; text-align: center; border-bottom: 2px solid #AD7D39; }
        .badge { display: inline-block; background: #AD7D39; color: #191611; padding: 5px 12px; font-weight: 800; font-size: 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 2px; }
        .content { padding: 28px; font-size: 14px; color: #D4BA99; }
        .card { background: #191611; padding: 20px; border-radius: 14px; border: 1px solid rgba(173,125,57,0.3); margin: 18px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #AD7D39 0%, #7D5121 100%); color: #ffffff !important; padding: 12px 26px; text-decoration: none; font-weight: bold; border-radius: 10px; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; }
        .footer { background: #191611; padding: 18px; text-align: center; font-size: 10px; color: #8A8378; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="badge">🔔 ADMIN NOTIFICATION • ${category}</span>
          <h2 style="color: #ffffff; margin: 10px 0 0 0; font-size: 20px;">${title}</h2>
        </div>
        <div class="content">
          <p style="color: #ffffff;">Hello Admin Team,</p>
          <div class="card">
            <p style="margin: 0; color: #ffffff; line-height: 1.6;">${body}</p>
          </div>
          <div style="text-align: center; margin: 26px 0;">
            <a href="${targetUrl}" class="btn">View in Admin Center</a>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0;">Afkar AlDar Support Operations • Dubai, UAE</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminRecipients,
    subject: `🔔 ${title} — Afkar AlDar Admin Alert`,
    html,
  });
}


