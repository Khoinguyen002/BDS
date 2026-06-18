import { env } from "@/env";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, owner, apartmentRef, turnstileToken } = body;

    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Missing captcha token" },
        { status: 400 },
      );
    }

    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
          remoteip:
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "127.0.0.1",
        }),
      },
    );

    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return NextResponse.json(
        { error: "Invalid captcha token" },
        { status: 400 },
      );
    }

    const cmsPayload = { name, phone, email, owner, apartmentRef };
    let cmsSuccess = false;

    try {
      const cmsRes = await fetch(`${env.PAYLOAD_PUBLIC_SERVER_URL}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cmsPayload),
      });

      if (cmsRes.ok) cmsSuccess = true;
      else throw new Error(`CMS returned ${cmsRes.status}`);
    } catch (err) {
      console.error("Failed to send lead to CMS, using fallback queue", err);
      if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
        await fetch(`${env.UPSTASH_REDIS_REST_URL}/lpush/leads_fallback`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cmsPayload),
        }).catch((e) => console.error("Fallback also failed:", e));
      }
    }

    if (env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "leads@tenmiencua.com",
            to: ["agent@example.com"], // Replace with actual dynamic email from owner config
            subject: "New Lead Submission",
            html: `<p>New lead: ${name} (${phone})</p>`,
          }),
        });
      } catch (emailErr) {
        console.error("Email sending failed", emailErr);
      }
    }

    return NextResponse.json({ success: true, fallbackUsed: !cmsSuccess });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
