import { connectDB } from "@/lib/mongodb";
import BlogSubscriber from "@/models/BlogSubscriber";
import crypto from "crypto";
// email util may not yet exist if removed; recreate later if missing
import { sendEmail, renderVerificationEmail } from "@/lib/email";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const locale = (body.locale || "en").trim();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }
    let existing = await BlogSubscriber.findOne({ email });
    const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    if (existing && existing.verified) {
      return Response.json({ ok: true, duplicated: true, verified: true });
    }
    const verifyToken = crypto.randomBytes(24).toString("hex");
    const unsubscribeToken =
      existing?.unsubscribeToken || crypto.randomBytes(20).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (!existing) {
      existing = await BlogSubscriber.create({
        email,
        locale,
        verifyToken,
        verifyTokenExpires: expires,
        unsubscribeToken,
      });
    } else {
      existing.verifyToken = verifyToken;
      existing.verifyTokenExpires = expires;
      existing.unsubscribeToken = unsubscribeToken;
      await existing.save();
    }
    try {
      const { subject, html } = renderVerificationEmail({
        site,
        token: verifyToken,
        locale,
      });
      await sendEmail({ to: email, subject, html });
    } catch (e) {
      console.error("Email send failed (verification)", e);
    }
    return Response.json({ ok: true, pending: true });
  } catch (e) {
    console.error("Subscribe error", e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
