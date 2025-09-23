"use client";

import { useEffect, useState } from "react";

export default function InstallPWAButton({ className = "btn btn-sm" }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS does not support beforeinstallprompt
    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isInStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone;
    if (isIOS && !isInStandalone) {
      // we could show an instruction modal instead
      setCanInstall(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
  };

  if (!canInstall) return null;

  return (
    <button onClick={onClick} className={className} aria-label="Install app">
      Install App
    </button>
  );
}
