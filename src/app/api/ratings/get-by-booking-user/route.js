import { connectDB } from "@/lib/mongodb";
import Rating from "@/models/Rating";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId");
  const userEmail = searchParams.get("userEmail");
  if (!bookingId || !userEmail) {
    return NextResponse.json(
      { error: "Missing bookingId or userEmail" },
      { status: 400 }
    );
  }
  const rating = await Rating.findOne({ bookingId, userEmail }).lean();
  return NextResponse.json({ rating });
}
