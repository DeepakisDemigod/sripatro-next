import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const { body } = await req.json();
    if (!body)
      return NextResponse.json({ error: "Missing body" }, { status: 400 });
    await connectDB();
    const doc = await Comment.findById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const isOwner = doc.userId === (session.user.id || session.user.email);
    if (!isOwner && session.user.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    doc.body = body;
    await doc.save();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/comments/[id] error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    await connectDB();
    const doc = await Comment.findById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const isOwner = doc.userId === (session.user.id || session.user.email);
    if (!isOwner && session.user.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // soft-delete
    doc.isDeleted = true;
    await doc.save();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/comments/[id] error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
