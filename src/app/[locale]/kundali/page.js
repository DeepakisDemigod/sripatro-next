"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Kundali from "@/components/Kundali";
import { X, ShareNetwork, Trash } from "phosphor-react";
import { useTranslations } from "next-intl";
import Comments from "@/components/Comments/Comments";

// LocalStorage helpers for Kundali
const HISTORY_KEY = "kundali_history";
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

export default function KundaliPage() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [initialEntry, setInitialEntry] = useState(null);
  const [autoShare, setAutoShare] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleOpenKundali = (entry, opts = {}) => {
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
          <div className="bg-base-100 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">Saved Kundalis</h1>
              <button
                className="btn btn-sm"
                onClick={() => handleOpenKundali(null)}
              >
                + <span className="ml-1">Make Kundali</span>
              </button>
            </div>

            {history.length === 0 ? (
              <div className="text-sm text-base-500">
                No saved kundalis yet. Click Make Kundali to create one.
              </div>
            ) : (
              <ul className="space-y-2">
                {history.map((h) => {
                  const label = h.name || "Unnamed";
                  const av = avatarForName(label);
                  const subtitle = `${h.englishDateTime || ""} · ${h.input?.latitude ?? ""}, ${h.input?.longitude ?? ""}`;
                  return (
                    <li
                      key={h.id}
                      className="border border-base-300 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-base-200/40 focus:outline-none focus:ring-2 focus:ring-base-300"
                      onClick={() => handleOpenKundali(h)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleOpenKundali(h);
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
                          <div className="text-base-600">{subtitle}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenKundali(h, { autoShare: true });
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

          {/* Kundali FAQs under the saved list */}
          <div className="mt-6 bg-base-100 rounded-2xl p-6 border border-base-300">
            <h3 className="text-sm font-bold text-base-800 mb-2">
              {t("Kundali FAQs")}
            </h3>
            <div className="join join-vertical w-full">
              <div className="collapse collapse-arrow join-item border border-base-300">
                <input type="checkbox" />
                <div className="collapse-title text-sm font-medium">
                  {t("kundali.faq.whatIsQuestion")}
                </div>
                <div className="collapse-content text-xs text-base-600">
                  {t("kundali.faq.whatIsAnswer")}
                </div>
              </div>
              <div className="collapse collapse-arrow join-item border border-t-0 border-base-300">
                <input type="checkbox" />
                <div className="collapse-title text-sm font-medium">
                  {t("kundali.faq.accuracyQuestion")}
                </div>
                <div className="collapse-content text-xs text-base-600">
                  {t("kundali.faq.accuracyAnswer")}
                </div>
              </div>
              <div className="collapse collapse-arrow join-item border border-t-0 border-base-300">
                <input type="checkbox" />
                <div className="collapse-title text-sm font-medium">
                  {t("kundali.faq.shareQuestion")}
                </div>
                <div className="collapse-content text-xs text-base-600">
                  {t("kundali.faq.shareAnswer")}
                </div>
              </div>
            </div>
          </div>

          {/* Comments under FAQs */}
          <div className="mt-6">
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
              <Kundali
                embedded
                initialLoadEntry={initialEntry}
                autoShareOnce={autoShare}
                onShared={() => {
                  setOpen(false);
                  setHistory(loadHistory());
                }}
                onClose={() => {
                  setOpen(false);
                  setHistory(loadHistory());
                }}
              />
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
