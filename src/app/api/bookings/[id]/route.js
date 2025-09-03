import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET(request, { params }) {
  await connectDB();
  const { id } = params;
  try {
    const booking = await Booking.findById(id).lean();
    if (!booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ booking }), {
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
