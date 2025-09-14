"use client";
import { useEffect, useState } from "react";

const HISTORY_KEY = "birth_panchang_history";

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistory(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {}
}

export default function BirthPanchangHistory({ onLoad }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(loadHistory().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
  }, []);

  const handleDelete = (id) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    saveHistory(next);
  };

  const handleClear = () => {
    setItems([]);
    saveHistory([]);
  };

  if (!items.length) {
    return (
      <div className="rounded-xl p-4 bg-base-100/60 shadow-sm border border-base-300 text-base-600">
        No saved panchang history yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 bg-base-100 shadow-sm border border-base-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Your Panchang History</h3>
        <button className="btn btn-xs" onClick={handleClear}>Clear all</button>
      </div>
      <div className="space-y-3 max-h-96 overflow-auto pr-1">
        {items.map((it) => (
          <div key={it.id} className="border border-base-300 rounded-lg p-3 flex items-start justify-between">
            <div className="text-sm">
              <div className="font-semibold">
                {it.name || "Unnamed"} · {it.englishDate} {it.time}
              </div>
              <div className="text-xs text-base-500">
                {it.mode === "AD_TO_BS" ? (it.bsText || "") : (it.bsText || "")} 
              </div>
              <div className="text-xs text-base-600 mt-1">
                {it.dayName} · {it.tithi} · {it.paksha} · {it.nakshatra} · {it.rasi}
              </div>
            </div>
            <div className="flex gap-2">
              {onLoad && (
                <button className="btn btn-xs btn-outline" onClick={() => onLoad(it)}>Load</button>
              )}
              <button className="btn btn-xs" onClick={() => handleDelete(it.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
