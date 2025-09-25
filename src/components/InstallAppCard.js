"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { DownloadSimple, CheckCircle } from "phosphor-react";

export default function InstallAppCard({ hidden = false }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  // Check if already installed (standalone / iOS) or previously installed
  const checkInstalled = () => {
    if (typeof window === "undefined") return false;
    const displayStandalone =
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone =
      typeof window.navigator !== "undefined" && window.navigator.standalone;
    return Boolean(displayStandalone || iosStandalone);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    setInstalled(checkInstalled());

    // If global BIP was captured earlier, pick it up immediately
    if (window.__sripatro_bip) {
      setDeferredPrompt(window.__sripatro_bip);
    }

    const onBIP = () => {
      setDeferredPrompt(window.__sripatro_bip || null);
    };
    window.addEventListener("sripatro:beforeinstallprompt", onBIP);

    const onInstalled = () => {
      setInstalled(true);
      // Clear any deferred prompt, and rely on display-mode checks
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    const reEval = () => {
      const isInstalled = checkInstalled();
      setInstalled(isInstalled);
      if (!isInstalled) {
        // Attempt to restore prompt if still available
        if (window.__sripatro_bip) setDeferredPrompt(window.__sripatro_bip);
      }
    };
    document.addEventListener("visibilitychange", reEval);
    window.addEventListener("focus", reEval);

    // Experimental: check for related installed apps (Chromium based)
    if (navigator.getInstalledRelatedApps) {
      navigator.getInstalledRelatedApps().then((related) => {
        if (related && related.length > 0) {
          setInstalled(true);
        }
      }).catch(()=>{});
    }

    return () => {
      window.removeEventListener("sripatro:beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      document.removeEventListener("visibilitychange", reEval);
      window.removeEventListener("focus", reEval);
    };
  }, []);

  const canInstall = useMemo(() => !!deferredPrompt, [deferredPrompt]);

  const onInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
      }
    } finally {
      setDeferredPrompt(null);
    }
  };

  if (hidden || dismissed) return null;

  return (
    <div className="w-full bg-base-100/80 border-b border-base-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-3 p-3 rounded-xl border border-base-200 bg-base-100 shadow-sm">
          <Image
            src="/logo.png"
            alt="SriPatro"
            width={48}
            height={48}
            className="rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate">SriPatro</p>
              <span className="badge-success badge-sm rounded-full text-white">
                Free
              </span>
            </div>
            <div className="text-sm text-base-content/70 flex items-center gap-2">
              <span>★ 4.8</span>
              <span>•</span>
              <span>Install the app for faster access</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {installed ? (
              <button className=" pr-2 flex items-center gap-1 rounded-full bg-green-600/40 border border-green-600 text-green-600" title="App detected as installed (standalone mode)">
                <CheckCircle size={29} />
                <span>Installed</span>
              </button>
            ) : canInstall ? (
              <button
                onClick={onInstall}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-600 border border-green-600 text-white"
                title="Install SriPatro (browser prompt)"
              >
                <DownloadSimple />
                <span>Install</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-600 border border-green-600 text-white"
                  title="Install from browser menu on iOS"
                  onClick={() => setShowIOSHelp(true)}
                >
                  {/* <DownloadSimple /> */}
                  <span>Guide</span>
                </button>
                <button
                  className="btn btn-sm"
                  title="Re-check install availability"
                  onClick={() =>
                    setDeferredPrompt(window.__sripatro_bip || null)
                  }
                >
                  Re-check
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  title="Reset installed state manually"
                  onClick={() => {
                    setInstalled(checkInstalled());
                    if (!checkInstalled() && window.__sripatro_bip) {
                      setDeferredPrompt(window.__sripatro_bip);
                    }
                  }}
                >
                  Sync
                </button>
              </div>
            )}
            <button
              className="btn btn-sm btn-ghost"
              aria-label="Dismiss install card"
              onClick={() => setDismissed(true)}
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {showIOSHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-base-100 rounded-xl border border-base-200 shadow-xl max-w-md w-[90%] p-4">
            <h3 className="font-semibold mb-2">Install on iOS</h3>
            <ol className="list-decimal ml-5 space-y-1 text-sm">
              <li>Open in Safari.</li>
              <li>Tap the Share icon (square with arrow).</li>
              <li>Scroll and choose "Add to Home Screen".</li>
              <li>Confirm the name and tap Add.</li>
            </ol>
            <div className="mt-3 flex justify-end">
              <button
                className="btn btn-sm"
                onClick={() => setShowIOSHelp(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
