import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  await connectDB();
  const { email } = await request.json();
  if (!email) {
    return new Response(JSON.stringify({ error: "Email required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  await User.findOneAndUpdate({ email }, { $set: { isOnline: false } });
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
