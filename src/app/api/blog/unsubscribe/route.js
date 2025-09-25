import { connectDB } from "@/lib/mongodb";
import BlogSubscriber from "@/models/BlogSubscriber";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }
    await BlogSubscriber.deleteOne({ email });
    return Response.json({ ok: true });
  } catch (e) {
    console.error("Unsubscribe error", e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token)
      return Response.json({ error: "Token required" }, { status: 400 });
    const sub = await BlogSubscriber.findOne({ unsubscribeToken: token });
    if (sub) {
      await BlogSubscriber.deleteOne({ _id: sub._id });
      return new Response(
        `<!DOCTYPE html><html><body><h1>Unsubscribed</h1><p>${sub.email} has been removed.</p></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }
    return new Response(
      `<!DOCTYPE html><html><body><h1>Already Removed</h1><p>This link is no longer active.</p></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (e) {
    console.error("Unsubscribe GET error", e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
