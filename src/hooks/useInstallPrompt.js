"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  const checkInstalled = useCallback(() => {
    if (typeof window === "undefined") return false;
    const displayStandalone =
      typeof window.matchMedia !== "undefined" &&
      window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone =
      typeof window.navigator !== "undefined" && window.navigator.standalone;
    return Boolean(displayStandalone || iosStandalone);
  }, []);

  const restoreDeferredPrompt = useCallback(() => {
    if (typeof window === "undefined") return null;
    const prompt = window.__sripatro_bip || null;
    setDeferredPrompt(prompt);
    return prompt;
  }, []);

  const refreshInstalledState = useCallback(() => {
    const status = checkInstalled();
    setInstalled(status);
    if (!status) {
      restoreDeferredPrompt();
    }
    return status;
  }, [checkInstalled, restoreDeferredPrompt]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    setInstalled(checkInstalled());

    if (window.__sripatro_bip) {
      setDeferredPrompt(window.__sripatro_bip);
    }

    const handleCustomPrompt = () => {
      restoreDeferredPrompt();
    };

    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    const reevaluate = () => {
      refreshInstalledState();
    };

    window.addEventListener("sripatro:beforeinstallprompt", handleCustomPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    document.addEventListener("visibilitychange", reevaluate);
    window.addEventListener("focus", reevaluate);

    if (typeof navigator !== "undefined" && navigator.getInstalledRelatedApps) {
      navigator
        .getInstalledRelatedApps()
        .then((related) => {
          if (related && related.length > 0) {
            setInstalled(true);
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener(
        "sripatro:beforeinstallprompt",
        handleCustomPrompt
      );
      window.removeEventListener("appinstalled", handleInstalled);
      document.removeEventListener("visibilitychange", reevaluate);
      window.removeEventListener("focus", reevaluate);
    };
  }, [checkInstalled, refreshInstalledState, restoreDeferredPrompt]);

  const canInstall = useMemo(() => Boolean(deferredPrompt), [deferredPrompt]);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    try {
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
      }
      return outcome === "accepted";
    } finally {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  return {
    canInstall,
    installed,
    promptInstall,
    restoreDeferredPrompt,
    refreshInstalledState,
    checkInstalled,
  };
}
