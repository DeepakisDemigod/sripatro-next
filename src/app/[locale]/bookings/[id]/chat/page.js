"use client";
import { useEffect, useState, use as usePromise } from "react";
import Header from "@/components/Header";
import BookingChat from "@/components/BookingChat";

function getInitials(nameOrEmail) {
  if (!nameOrEmail) return "?";
  const parts = nameOrEmail.split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ChatPage({ params }) {
  const [booking, setBooking] = useState(null);
  const [astrologer, setAstrologer] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const actualParams = usePromise(params);

  useEffect(() => {
    async function fetchData() {
      const [bookingRes, sessionRes] = await Promise.all([
        fetch(`/api/bookings/${actualParams.id}`),
        fetch("/api/auth/session"),
      ]);
      const bookingData = await bookingRes.json();
      setBooking(bookingData.booking);
      setSession(sessionRes.ok ? await sessionRes.json() : null);
      if (bookingData.booking?.astrologerId) {
        const astroRes = await fetch(
          `/api/users/${bookingData.booking.astrologerId}`
        );
        setAstrologer((await astroRes.json()).user);
      }
      setLoading(false);
    }
    fetchData();
  }, [actualParams.id]);

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading...</div>;
  }
  if (!booking) {
    return (
      <div className="p-8 text-center text-red-600 text-xl">
        Booking not found
      </div>
    );
  }

  const isAstrologer = session?.user?.email === booking.astrologerEmail;
  const chatWithName = isAstrologer
    ? booking.userName || booking.userEmail
    : astrologer?.name || booking.astrologerEmail;
  const chatWithEmail = isAstrologer
    ? booking.userEmail
    : booking.astrologerEmail;
  const videoUrl = `https://meet.jit.si/sripatro-booking-${booking._id}`;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-base-200 flex flex-col items-center py-8">
        <div className="w-full max-w-2xl bg-base-100 shadow-md border border-base-200 rounded-2xl mb-8 px-0 py-0 flex flex-col">
          <div className="flex items-center gap-4 px-6 py-4 border-b border-base-200">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
              {getInitials(chatWithName)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">{chatWithName}</div>
              <div className="text-sm text-base-content/60">
                {chatWithEmail}
              </div>
            </div>
            {isAstrologer ? (
              <button
                className="btn btn-sm btn-primary"
                title="Start Video Call"
                onClick={async () => {
                  if (window.bookingChatSendVideoLink) {
                    await window.bookingChatSendVideoLink(videoUrl);
                  }
                  window.open(videoUrl, "_blank");
                }}
              >
                Video Call
              </button>
            ) : (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-primary"
                title="Start Video Call"
              >
                Video Call
              </a>
            )}
          </div>
          <div className="w-full px-0 py-0">
            <BookingChat
              bookingId={booking._id.toString()}
              userEmail={booking.userEmail}
              astrologerEmail={booking.astrologerEmail}
              setSendVideoLinkCallback={(cb) => {
                window.bookingChatSendVideoLink = cb;
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
