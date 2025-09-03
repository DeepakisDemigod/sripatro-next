import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request, { params }) {
  await connectDB();
  const { id } = params;
  try {
    const user = await User.findById(id).lean();
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ user }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
