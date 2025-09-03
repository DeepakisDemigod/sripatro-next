"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function AstrologerStatusSwitcher({ onStatusChange }) {
  const { data: session } = useSession();
  const [status, setStatus] = useState("offline");
  const [astrologersOnline, setAstrologersOnline] = useState(0);

  useEffect(() => {
    async function pollAstrologers() {
      const res = await fetch("/api/users/profile");
      if (res.ok) {
        const data = await res.json();
        setAstrologersOnline(data.users.filter((u) => u.isOnline).length);
      }
    }
    pollAstrologers();
    const interval = setInterval(pollAstrologers, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (session?.user?.role === "astrologer") {
      fetch("/api/users/set-online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          isOnline: status === "online",
        }),
      });
      if (onStatusChange) onStatusChange(status);
    }
  }, [status, session, onStatusChange]);

  if (!session?.user?.role || session.user.role !== "astrologer") return null;

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border rounded px-2 py-1 text-sm font-semibold"
      >
        <option value="offline">Offline</option>
        <option value="online">Online</option>
      </select>
      <span className="ml-2 text-xs text-green-600 font-semibold">
        {astrologersOnline} astrologer{astrologersOnline === 1 ? "" : "s"}{" "}
        online
      </span>
    </div>
  );
}
