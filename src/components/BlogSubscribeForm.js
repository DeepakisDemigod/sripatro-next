"use client";
import { useState } from "react";

export default function BlogSubscribeForm({ locale = "en", compact = false }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | duplicate | error | pending
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/blog/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Subscription failed");
      }
      if (data.duplicated) {
        if (data.verified) {
          setStatus("duplicate");
          setMessage("You are already subscribed.");
        } else {
          setStatus("pending");
          setMessage("Check your email to confirm your subscription.");
        }
      } else if (data.pending) {
        setStatus("pending");
        setMessage("Check your email to confirm your subscription.");
      } else {
        setStatus("success");
        setMessage("Subscription successful!");
      }
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Something went wrong");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-lg border border-base-300 bg-base-100/70 p-4 sm:p-6 ${compact ? "flex flex-col sm:flex-row gap-3 items-start sm:items-end" : "space-y-4"}`}
    >
      {!compact && (
        <div>
          <h3 className="text-lg font-semibold mb-1">
            Subscribe to our newsletter
          </h3>
          <p className="text-sm text-base-content/60">
            Get the latest posts delivered weekly.
          </p>
        </div>
      )}
      <div
        className={`flex w-full ${compact ? "flex-col sm:flex-row gap-3" : "flex-col sm:flex-row gap-3"}`}
      >
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input input-bordered w-full sm:flex-1"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </div>
      {status !== "idle" && message && (
        <p
          className={`text-sm ${status === "error" ? "text-error" : status === "duplicate" ? "text-warning" : status === "pending" ? "text-info" : "text-success"}`}
        >
          {message}
        </p>
      )}
      <p className="text-[10px] text-base-content/50 mt-1">
        We respect your privacy. Unsubscribe anytime.
      </p>
    </form>
  );
}
