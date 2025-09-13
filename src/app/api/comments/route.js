import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const viewer = session?.user?.id || session?.user?.email || null;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("path");
    if (!page)
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    await connectDB();
    const rows = await Comment.find({ page }).sort({ createdAt: 1 }).lean();
    const data = rows.map((c) => ({
      id: c._id.toString(),
      body: c.isDeleted ? "[deleted]" : c.body,
      parentId: c.parentId ? c.parentId.toString() : null,
      userId: c.userId,
      username: c.username,
      isDeleted: !!c.isDeleted,
      upvoteCount: Array.isArray(c.upvoters) ? c.upvoters.length : 0,
      downvoteCount: Array.isArray(c.downvoters) ? c.downvoters.length : 0,
      currentUserVote: viewer
        ? c.upvoters?.includes(viewer)
          ? 1
          : c.downvoters?.includes(viewer)
            ? -1
            : 0
        : 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
    return NextResponse.json({ comments: data });
  } catch (err) {
    console.error("GET /api/comments error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// duplicate import removed

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { page, parentId, body } = await req.json();
    if (!page || !body)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    await connectDB();
    const doc = await Comment.create({
      page,
      parentId: parentId || null,
      userId: session.user.id || session.user.email,
      username: session.user.name || session.user.email,
      body,
    });
    return NextResponse.json(
      {
        id: doc._id.toString(),
        parentId: doc.parentId ? doc.parentId.toString() : null,
        userId: doc.userId,
        username: doc.username,
        body: doc.body,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/comments error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
