"use client";

import { DownloadSimple, CheckCircle } from "phosphor-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export default function InstallPromptButton({
  className = "flex items-center gap-2 rounded-full bg-green-600 border border-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-green-600/90",
  installedClassName = "flex items-center gap-2 rounded-full bg-green-600/20 border border-green-600 px-4 py-2 text-sm font-semibold text-green-700",
  fallback = null,
}) {
  const { installed, canInstall, promptInstall } = useInstallPrompt();

  if (installed) {
    return (
      <span className={installedClassName}>
        <CheckCircle size={18} />
        <span>Installed</span>
      </span>
    );
  }

  if (canInstall) {
    return (
      <button type="button" onClick={promptInstall} className={className}>
        <DownloadSimple size={18} />
        <span>Install SriPatro</span>
      </button>
    );
  }

  return fallback;
}
