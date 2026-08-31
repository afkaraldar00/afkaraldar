export interface SendTemplateParams {
  to: string;
  customerName: string;
  orderId: string;
  deliveryDetail: string; // e.g. "August 30, 2026" or "in 24-48 hours"
}

export interface SendTextParams {
  to: string;
  body: string;
}

/**
 * Clean phone number to WhatsApp international format (only digits, no symbols/plus/spaces)
 * e.g. "+971 50 123 4567" -> "971501234567"
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

/**
 * Sends a template message (jaspers_market_order_confirmation_v1 by default) via Meta WhatsApp Cloud API
 */
export async function sendWhatsAppTemplate({
  to,
  customerName,
  orderId,
  deliveryDetail,
}: SendTemplateParams) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "1322783207583784";
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v25.0";
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "jaspers_market_order_confirmation_v1";

  if (!accessToken || accessToken === "your_whatsapp_access_token") {
    console.warn("[WhatsApp API] Missing Access Token. Message delivery simulated.");
    return { success: false, error: "MISSING_ACCESS_TOKEN" };
  }

  const cleanPhone = cleanPhoneNumber(to);
  if (!cleanPhone) {
    console.error("[WhatsApp API] Recipient phone number is empty or invalid.");
    return { success: false, error: "INVALID_PHONE_NUMBER" };
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: cleanPhone,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: "en_US",
      },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: customerName },
            { type: "text", text: orderId },
            { type: "text", text: deliveryDetail },
          ],
        },
      ],
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`[WhatsApp API Error ${res.status}]`, data);
      return { success: false, status: res.status, error: data.error };
    }

    console.log(`[WhatsApp API Success] Sent template ${templateName} to ${cleanPhone}`);
    return { success: true, data };
  } catch (err: any) {
    console.error("[WhatsApp Network Error]", err);
    return { success: false, error: err.message };
  }
}

/**
 * Sends a free-form text message via Meta WhatsApp Cloud API.
 * Note: Business-initiated text messages to users who haven't messaged you in the last 24h will be rejected by Meta.
 */
export async function sendWhatsAppText({ to, body }: SendTextParams) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "1322783207583784";
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v25.0";

  if (!accessToken || accessToken === "your_whatsapp_access_token") {
    console.warn("[WhatsApp API] Missing Access Token. Message delivery simulated.");
    return { success: false, error: "MISSING_ACCESS_TOKEN" };
  }

  const cleanPhone = cleanPhoneNumber(to);
  if (!cleanPhone) {
    console.error("[WhatsApp API] Recipient phone number is empty or invalid.");
    return { success: false, error: "INVALID_PHONE_NUMBER" };
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "text",
    text: {
      preview_url: false,
      body: body,
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`[WhatsApp API Error ${res.status}]`, data);
      return { success: false, status: res.status, error: data.error };
    }

    console.log(`[WhatsApp API Success] Sent text message to ${cleanPhone}`);
    return { success: true, data };
  } catch (err: any) {
    console.error("[WhatsApp Network Error]", err);
    return { success: false, error: err.message };
  }
}
