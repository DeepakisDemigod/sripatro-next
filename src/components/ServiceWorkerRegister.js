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

    const onBIP = (e) => {
      // Stop the automatic mini-infobar and persist the event globally
      e.preventDefault();
      try {
        window.__sripatro_bip = e;
        window.dispatchEvent(new CustomEvent("sripatro:beforeinstallprompt"));
      } catch {}
    };

    window.addEventListener("beforeinstallprompt", onBIP);

    const onAppInstalled = () => {
      try {
        // Clear stored event if any once installed
        window.__sripatro_bip = null;
      } catch {}
    };
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  return null;
}
