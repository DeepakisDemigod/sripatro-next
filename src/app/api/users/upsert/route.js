import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const payload = await req.json();
    const { email, role, name, bio, languages, services } = payload;

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const update = {
      role: role || "user",
      name: name || undefined,
      bio: bio || undefined,
      languages: languages || [],
      services: services || [],
      profileComplete: true,
    };

    const user = await User.findOneAndUpdate(
      { email },
      { $set: update },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("User upsert error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
