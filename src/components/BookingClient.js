"use client";
import { useSession } from "next-auth/react";
import RatingForm from "@/components/RatingForm";
import { useState, useEffect } from "react";

export default function BookingClient({ booking }) {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);
  useEffect(() => {
    async function checkRating() {
      if (
        booking.status === "completed" &&
        session?.user?.email === booking.userEmail
      ) {
        // Check if rating exists for this booking and user
        const res = await fetch(
          `/api/ratings/get-by-booking-user?bookingId=${booking._id}&userEmail=${session.user.email}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.rating) {
            setAlreadyRated(true);
            setShowModal(false);
          } else {
            setAlreadyRated(false);
            setShowModal(true);
          }
        }
      } else {
        setShowModal(false);
      }
    }
    checkRating();
  }, [booking.status, session, booking._id, booking.userEmail]);

  if (!booking)
    return (
      <div className="p-8 text-center text-red-600 text-xl">
        Booking not found
      </div>
    );

  return (
    <>
      {showModal && !alreadyRated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-base-100 rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-xl font-bold"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <RatingForm
              astrologerId={booking.astrologerId.toString()}
              bookingId={booking._id.toString()}
              onRated={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
