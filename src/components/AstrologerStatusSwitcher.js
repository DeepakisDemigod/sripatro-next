"use client";
import { useState, useEffect } from "react";
import { useAstrologerOnline } from "@/context/AstrologerOnlineContext";
import { useSession } from "next-auth/react";

export default function AstrologerStatusSwitcher({ onStatusChange }) {
  const { data: session } = useSession();
  const [status, setStatus] = useState("offline");
  const { astrologersOnline } = useAstrologerOnline();

  useEffect(() => {
    // No polling here, handled by context
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
      <span className="ml-2 text-xs text-green-600 font-semibold">
        {astrologersOnline} astrologer{astrologersOnline === 1 ? "" : "s"}{" "}
        online
      </span>
      {session?.user?.role === "astrologer" && (
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-2 py-1 text-sm font-semibold"
        >
          <option value="offline">⬤ Offline</option>
          <option value="online">🟢 Online</option>
        </select>
      )}
    </div>
  );
}
