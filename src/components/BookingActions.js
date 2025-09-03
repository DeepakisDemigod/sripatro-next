"use client";
import { useState } from "react";

export default function BookingActions({ bookingId, status, onStatusChange }) {
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus) {
    setLoading(true);
    const res = await fetch(`/api/bookings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookingId, status: newStatus }),
    });
    setLoading(false);
    if (res.ok) {
      onStatusChange && onStatusChange(newStatus);
    } else {
      alert("Failed to update booking status");
    }
  }

  return (
    <div className="flex gap-2 mt-4">
      {status === "pending" && (
        <>
          <button
            className="btn btn-success btn-sm"
            disabled={loading}
            onClick={() => updateStatus("approved")}
          >
            Approve
          </button>
          <button
            className="btn btn-warning btn-sm"
            disabled={loading}
            onClick={() => updateStatus("rejected")}
          >
            Reject
          </button>
        </>
      )}
      {status === "approved" && (
        <button
          className="btn btn-info btn-sm"
          disabled={loading}
          onClick={() => updateStatus("completed")}
        >
          Mark as Completed
        </button>
      )}
    </div>
  );
}
