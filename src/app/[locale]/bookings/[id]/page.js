import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import BookingChat from "@/components/BookingChat";
import BookingActions from "@/components/BookingActions";
import Header from "@/components/Header";
import BookingClient from "@/components/BookingClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Page({ params }) {
  await connectDB();
  const booking = await Booking.findById(params.id).lean();
  if (!booking)
    return (
      <div className="p-8 text-center text-red-600 text-xl">
        Booking not found
      </div>
    );
  const astrologer = await User.findById(booking.astrologerId).lean();
  const session = await getServerSession(authOptions);
  const isAstrologer = session?.user?.email === booking.astrologerEmail;
  return (
    <>
      <Header />
      <div className="p-8 min-h-screen bg-base-200 flex flex-col items-center">
        <div className="card bg-base-100 shadow-lg border border-red-600 rounded-xl p-8 w-full max-w-2xl mb-8">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Booking Details
          </h1>
          <div className="mb-2">
            <strong>Service:</strong> {booking.service.title} - ₹
            {booking.service.price}
          </div>
          <div className="mb-2">
            <strong>Astrologer:</strong>{" "}
            {astrologer?.name || booking.astrologerEmail}
          </div>
          <div className="mb-2">
            <strong>User:</strong> {booking.userEmail}
          </div>
          <div className="mb-2">
            <strong>Status:</strong>{" "}
            <span
              className={`badge badge-outline ${booking.status === "pending" ? "badge-error" : booking.status === "approved" ? "badge-success" : booking.status === "rejected" ? "badge-warning" : "badge-info"} border-red-600 text-red-600`}
            >
              {booking.status}
            </span>
          </div>
          <div className="mb-2">
            <strong>Message:</strong> {booking.message || "-"}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            Booked at: {new Date(booking.createdAt).toLocaleString()}
          </div>
          {/* Booking management actions for astrologer */}
          {isAstrologer && (
            <BookingActions
              bookingId={booking._id.toString()}
              status={booking.status}
            />
          )}
        </div>
        <BookingClient booking={JSON.parse(JSON.stringify(booking))} />
      </div>
    </>
  );
}
