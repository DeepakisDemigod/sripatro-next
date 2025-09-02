import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    let query = {};
    if (email) {
      query.email = email;
    }
    // Only show astrologers if no email is provided
    if (!email) {
      query.role = "astrologer";
    }
    const users = await User.find(query).lean();
    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
