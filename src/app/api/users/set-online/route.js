import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

let totalOnline = 0;

export async function POST(request) {
  await connectDB();
  const { email, isOnline } = await request.json();
  if (!email) {
    return new Response(JSON.stringify({ error: "Email required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  await User.findOneAndUpdate({ email }, { $set: { isOnline } });
  // Count total online astrologers and save to DB (or cache)
  const onlineCount = await User.countDocuments({
    role: "astrologer",
    isOnline: true,
  });
  // Optionally, save this count somewhere (e.g., a separate collection or cache)
  // For now, just return it
  return new Response(JSON.stringify({ success: true, onlineCount }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
