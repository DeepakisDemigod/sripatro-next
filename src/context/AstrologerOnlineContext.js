"use client";
import { createContext, useContext, useEffect, useState } from "react";

const AstrologerOnlineContext = createContext({ astrologersOnline: 0 });

export function AstrologerOnlineProvider({ children }) {
  const [astrologersOnline, setAstrologersOnline] = useState(0);

  useEffect(() => {
    async function pollAstrologers() {
      try {
        const res = await fetch("/api/users/profile");
        if (res.ok) {
          const data = await res.json();
          setAstrologersOnline(data.users.filter((u) => u.isOnline).length);
        }
      } catch (e) {
        // fail silently
      }
    }
    pollAstrologers();
    const interval = setInterval(pollAstrologers, 60000); // 1 minute
    return () => clearInterval(interval);
  }, []);

  return (
    <AstrologerOnlineContext.Provider value={{ astrologersOnline }}>
      {children}
    </AstrologerOnlineContext.Provider>
  );
}

export function useAstrologerOnline() {
  return useContext(AstrologerOnlineContext);
}
