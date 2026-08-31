import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const timestamp = new Date().toISOString();

  try {
    const rawBody = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    let payload = {};

    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = { raw: rawBody };
    }

    const source = headers["x-webhook-source"] || headers["user-agent"] || "generic-webhook";

    console.log(`[Inbound Webhook Received] Source: ${source}, Time: ${timestamp}`);

    return NextResponse.json({
      received: true,
      status: "SUCCESS",
      timestamp,
      source,
      processed: true,
    });
  } catch (err: any) {
    console.error("[Inbound Webhook Error]", err);
    return NextResponse.json({ error: "Webhook Processing Failed", details: err.message }, { status: 500 });
  }
}
