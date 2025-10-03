"use client";
import { createContext, useContext } from "react";

const AstrologerOnlineContext = createContext({ astrologersOnline: 0 });

export function AstrologerOnlineProvider({ children }) {
  return (
    <AstrologerOnlineContext.Provider value={{ astrologersOnline: 0 }}>
      {children}
    </AstrologerOnlineContext.Provider>
  );
}

export function useAstrologerOnline() {
  return useContext(AstrologerOnlineContext);
}
