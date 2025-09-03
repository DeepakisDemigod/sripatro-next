import { connectDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId");
  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
  }
  const messages = await Chat.find({ bookingId }).sort({ createdAt: 1 }).lean();
  return NextResponse.json({ messages });
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const { bookingId, sender, receiver, message } = body;
  if (!bookingId || !sender || !receiver || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const chat = await Chat.create({ bookingId, sender, receiver, message });
  return NextResponse.json({ ok: true, chat });
}
