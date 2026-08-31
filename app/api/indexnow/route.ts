import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { urlList, apiKey } = body;

    const host = process.env.NEXT_PUBLIC_SITE_HOST || "afkaraldar.ae";
    const key = apiKey || process.env.INDEXNOW_API_KEY || "afkaraldarindexnowkey2026";

    if (!urlList || !Array.isArray(urlList) || urlList.length === 0) {
      return NextResponse.json(
        { success: false, error: "urlList must be a non-empty array of URLs" },
        { status: 400 }
      );
    }

    const payload = {
      host,
      key,
      keyLocation: `https://${host}/${key}.txt`,
      urlList,
    };

    // IndexNow endpoint (Bing/Yandex/Seznam)
    const indexNowRes = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (!indexNowRes.ok) {
      const errorText = await indexNowRes.text();
      return NextResponse.json(
        { success: false, status: indexNowRes.status, error: errorText },
        { status: indexNowRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully submitted ${urlList.length} URLs to IndexNow`,
      urlList,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
