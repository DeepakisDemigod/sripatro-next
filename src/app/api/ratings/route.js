import { connectDB } from "@/lib/mongodb";
import Rating from "@/models/Rating";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const { astrologerId, userEmail, bookingId, rating, comment } = body;
  if (!astrologerId || !userEmail || !bookingId || !rating) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const newRating = await Rating.create({
    astrologerId,
    userEmail,
    bookingId,
    rating,
    comment,
  });
  return NextResponse.json({ ok: true, rating: newRating });
}

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const astrologerId = searchParams.get("astrologerId");
  if (!astrologerId) {
    return NextResponse.json(
      { error: "Missing astrologerId" },
      { status: 400 }
    );
  }
  const ratings = await Rating.find({ astrologerId }).lean();
  const avgRating =
    ratings.length > 0
      ? (
          ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        ).toFixed(2)
      : null;
  return NextResponse.json({ ratings, avgRating });
}
