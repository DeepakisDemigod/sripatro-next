import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route"; // relative path to your auth route
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectDB();

  const booking = await Booking.create({
    userEmail: session.user.email,
    astrologerId: body.astrologerId,
    astrologerEmail: body.astrologerEmail,
    service: body.service,
    message: body.message || "",
    status: "pending",
  });

  return NextResponse.json({ ok: true, booking });
}
