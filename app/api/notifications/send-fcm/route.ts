import { NextResponse } from "next/server";
import { sendFcmPushNotification } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, tokens, title, body: msgBody, data } = body;

    if (!title || !msgBody) {
      return NextResponse.json({ success: false, error: "MISSING_TITLE_OR_BODY" }, { status: 400 });
    }

    const result = await sendFcmPushNotification({
      userId,
      tokens,
      title,
      body: msgBody,
      data,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("[FCM API Route Exception]", err);
    return NextResponse.json({ success: true, delivered: false, error: err.message }, { status: 200 });
  }
}
