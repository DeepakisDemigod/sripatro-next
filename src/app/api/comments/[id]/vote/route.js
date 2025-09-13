import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const { value } = await req.json();
    if (![1, 0, -1].includes(value))
      return NextResponse.json({ error: "Invalid value" }, { status: 400 });
    const voter = session.user.id || session.user.email;
    await connectDB();
    const doc = await Comment.findById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // remove from both first
    doc.upvoters = (doc.upvoters || []).filter((u) => u !== voter);
    doc.downvoters = (doc.downvoters || []).filter((u) => u !== voter);
    if (value === 1) doc.upvoters.push(voter);
    if (value === -1) doc.downvoters.push(voter);
    await doc.save();
    return NextResponse.json({
      ok: true,
      upvoteCount: doc.upvoters.length,
      downvoteCount: doc.downvoters.length,
      currentUserVote: value,
    });
  } catch (err) {
    console.error("POST /api/comments/[id]/vote error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
