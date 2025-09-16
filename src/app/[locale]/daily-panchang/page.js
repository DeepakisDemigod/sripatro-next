"use client";
import React, { useMemo, useState, useEffect } from "react";
import Header from "@/components/Header";
import BirthPanchang from "@/components/BirthPanchang";
import Footer from "@/components/Footer";
import Comments from "@/components/Comments/Comments";
import { X, ShareNetwork, Trash, FilePlus } from "phosphor-react";

// LocalStorage helpers must match the component
const HISTORY_KEY = "birth_panchang_history";
const loadHistory = () => {
  try {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(HISTORY_KEY) : null;
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};
const saveHistory = (arr) => {
  try {
    if (typeof window !== "undefined")
      localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
  } catch {}
};

const avatarForName = (name) => {
  const n = (name || "Unnamed").trim();
  const parts = n.split(/\s+/).filter(Boolean);
  let initials = "";
  if (parts.length === 0) initials = "UN";
  else if (parts.length === 1) initials = parts[0].slice(0, 2).toUpperCase();
  else initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  const palette = [
    "#f97316",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#22c55e",
    "#eab308",
    "#ec4899",
    "#0ea5e9",
  ];
  let hash = 0;
  for (let i = 0; i < n.length; i++) hash = (hash * 31 + n.charCodeAt(i)) >>> 0;
  const color = palette[hash % palette.length];
  return { initials, color };
};

export default function DailyPanchangPage() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [initialEntry, setInitialEntry] = useState(null);
  const [autoShare, setAutoShare] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleMakeReport = (entry, opts = {}) => {
    setInitialEntry(entry || null);
    setAutoShare(!!opts.autoShare);
    setOpen(true);
  };

  const deleteEntry = (id) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveHistory(next);
      return next;
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-base-100">
        <div className="max-w-5xl mx-auto p-5">
          <div className="bg-base-100 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">Saved Panchangs</h1>
              <button
                className="btn btn-sm"
                onClick={() => handleMakeReport(null)}
              >
                + <span className="ml-1">Make Report</span>
              </button>
            </div>
            {history.length === 0 ? (
              <div className="text-sm text-base-500">
                No saved panchangs yet. Click Make Report to create one.
              </div>
            ) : (
              <ul className="space-y-2">
                {history.map((h) => {
                  const label = h.name || "Unnamed";
                  const av = avatarForName(label);
                  return (
                    <li
                      key={h.id}
                      className="border border-base-300 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-base-200/40 focus:outline-none focus:ring-2 focus:ring-base-300"
                      onClick={() => handleMakeReport(h)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleMakeReport(h);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: av.color }}
                          aria-hidden="true"
                          title={label}
                        >
                          {av.initials}
                        </div>
                        <div className="text-sm">
                          <div className="font-semibold">{label}</div>
                          <div className="text-base-600">
                            {h.englishDate || h.adDateISO?.slice(0, 10)} ·{" "}
                            {h.timeOfBirth} ·{" "}
                            {h.mode === "AD_TO_BS" ? "AD→BS" : "BS→AD"}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMakeReport(h, { autoShare: true });
                          }}
                          title="Share PNG"
                        >
                          <ShareNetwork size={14} />
                          <span className="ml-1">Share PNG</span>
                        </button>
                        <button
                          className="btn btn-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEntry(h.id);
                          }}
                        >
                          <Trash size={14} />
                          <span className="ml-1">Delete</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {/* FAQ Section */}
          <div className="mt-10">
            <h2 className="text-lg font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <div className="join join-vertical w-full">
              <div className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
                <input type="checkbox" />
                <div className="collapse-title text-base font-medium">
                  What is a Birth Panchang?
                </div>
                <div className="collapse-content text-sm text-base-600">
                  A Birth Panchang is a traditional Hindu astrological chart
                  created based on the date, time, and place of birth. It
                  provides details like Tithi, Nakshatra, Yoga, Karana, and
                  more, which are used for astrological analysis and rituals.
                </div>
              </div>
              <div className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
                <input type="checkbox" />
                <div className="collapse-title text-base font-medium">
                  How do I save a Panchang report?
                </div>
                <div className="collapse-content text-sm text-base-600">
                  After generating a report, it is automatically saved in your
                  browser. You can view, share, or delete saved reports from the
                  list above.
                </div>
              </div>
              <div className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
                <input type="checkbox" />
                <div className="collapse-title text-base font-medium">
                  How can I share my Panchang as an image?
                </div>
                <div className="collapse-content text-sm text-base-600">
                  Click the{" "}
                  <span className="inline-flex items-center">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      className="inline-block mr-1"
                    >
                      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
                      <path d="M16 6l-4-4-4 4" />
                      <path d="M12 2v14" />
                    </svg>
                    Share PNG
                  </span>{" "}
                  button next to your report. The image will include a watermark
                  and can be downloaded or shared directly.
                </div>
              </div>
              <div className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
                <input type="checkbox" />
                <div className="collapse-title text-base font-medium">
                  Is my data private?
                </div>
                <div className="collapse-content text-sm text-base-600">
                  Yes, all your saved Panchang reports are stored only in your
                  browser and are not uploaded to any server.
                </div>
              </div>
              <div className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
                <input type="checkbox" />
                <div className="collapse-title text-base font-medium">
                  Can I clear all saved reports?
                </div>
                <div className="collapse-content text-sm text-base-600">
                  Yes, use the{" "}
                  <span className="inline-flex items-center">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      className="inline-block mr-1"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" />
                      <path d="M19 6l-1-2a2 2 0 0 0-1.8-1H7.8a2 2 0 0 0-1.8 1L5 6" />
                    </svg>
                    Clear All
                  </span>{" "}
                  button in the report section to remove all saved Panchangs.
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-10">
            {/* <h2 className="text-lg font-bold mb-4">Comments</h2> */}
            <Comments />
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-base-100 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto">
            <button
              className="absolute top-2 right-2 btn btn-circle btn-ghost"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
            <div className="p-4">
              {/* Embedded BirthPanchang with simplified chrome */}
              <BirthPanchang
                embedded
                initialLoadEntry={initialEntry}
                autoShareOnce={autoShare}
                onShared={() => setOpen(false)}
                onClose={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
