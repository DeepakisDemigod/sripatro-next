"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function RatingForm({ astrologerId, bookingId, onRated }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        astrologerId,
        bookingId,
        rating,
        comment,
        userEmail: session?.user?.email,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setSubmitted(true);
      onRated && onRated();
    } else {
      alert("Failed to submit rating");
    }
  }

  if (submitted)
    return (
      <div className="text-green-600 font-bold">Thank you for your rating!</div>
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 p-4 bg-base-100 rounded-lg border border-red-600 max-w-md"
    >
      <h3 className="text-lg font-bold mb-2 text-red-600">
        Rate your experience
      </h3>
      <div className="flex gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            className={`text-2xl ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => setRating(star)}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        className="textarea textarea-bordered w-full mb-2 border-red-600"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a comment (optional)"
      />
      <button
        type="submit"
        className="btn btn-error bg-red-600 text-white"
        disabled={loading || rating === 0}
      >
        {loading ? "Submitting..." : "Submit Rating"}
      </button>
    </form>
  );
}
