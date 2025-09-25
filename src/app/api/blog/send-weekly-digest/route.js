import { connectDB } from "@/lib/mongodb";
import BlogSubscriber from "@/models/BlogSubscriber";
import { getAllPosts } from "@/lib/getMetaData";
import { renderWeeklyDigestEmail, sendEmail } from "@/lib/email";

export async function POST(req) {
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const posts = getAllPosts().filter(
      (p) => p.meta.createdAt && new Date(p.meta.createdAt).getTime() >= weekAgo
    );
    if (posts.length === 0)
      return Response.json({ ok: true, skipped: "no-posts" });
    const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const subs = await BlogSubscriber.find({ verified: true });
    let sent = 0;
    for (const sub of subs) {
      const { subject, html } = renderWeeklyDigestEmail({
        site,
        posts,
        unsubscribeUrl: `${site}/api/blog/unsubscribe?token=${sub.unsubscribeToken}`,
      });
      await sendEmail({ to: sub.email, subject, html });
      sent++;
    }
    return Response.json({ ok: true, sent, posts: posts.length });
  } catch (e) {
    console.error("Weekly digest error", e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
