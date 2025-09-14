"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        // optional: listen for updates
        if (reg && reg.installing) {
          reg.installing.addEventListener("statechange", () => {
            // console.log('SW state:', reg.installing?.state);
          });
        }
      } catch (e) {
        // console.warn('SW registration failed', e);
      }
    };

    register();
  }, []);

  return null;
}
