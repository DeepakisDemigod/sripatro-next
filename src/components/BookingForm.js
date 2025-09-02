"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function BookingForm({
  astrologerId,
  service,
  astrologerEmail,
}) {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequest() {
    if (!session) return alert("Please sign in first");
    setLoading(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail: session.user.email,
        astrologerId,
        astrologerEmail,
        service,
        message,
      }),
    });
    if (res.ok) {
      alert(
        "Booking requested. Astrologer will get notified (in later versions)"
      );
    } else {
      alert("Error creating booking");
    }
    setLoading(false);
  }

  return (
    <div className="mt-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message for astrologer (date/time etc.)"
        className="w-full p-2 border"
      />
      <button
        disabled={loading}
        onClick={handleRequest}
        className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
      >
        {loading ? "Requesting..." : `Request (${service.title})`}
      </button>
    </div>
  );
}
