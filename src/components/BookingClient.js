"use client";
import { useSession } from "next-auth/react";
import RatingForm from "@/components/RatingForm";
import BookingChat from "@/components/BookingChat";

export default function BookingClient({ booking }) {
  const { data: session } = useSession();
  if (!booking)
    return (
      <div className="p-8 text-center text-red-600 text-xl">
        Booking not found
      </div>
    );
  return (
    <>
      <BookingChat
        bookingId={booking._id.toString()}
        userEmail={booking.userEmail}
        astrologerEmail={booking.astrologerEmail}
      />
      {/* Show rating form if booking is completed and user is the one who booked */}
      {booking.status === "completed" &&
        session?.user?.email === booking.userEmail && (
          <RatingForm
            astrologerId={booking.astrologerId.toString()}
            bookingId={booking._id.toString()}
          />
        )}
    </>
  );
}
