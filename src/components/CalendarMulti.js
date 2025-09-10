"use client";
import { Gear } from "phosphor-react";
import React, { useEffect, useState, useRef } from "react";

// cookie helpers (small, no deps)
function setCookie(name, value, days = 365) {
  try {
    const v = encodeURIComponent(JSON.stringify(value));
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${v}; expires=${expires}; path=/`;
  } catch (e) {
    // ignore
  }
}

function getCookie(name) {
  try {
    const match = document.cookie.match(
      new RegExp("(?:^|; )" + name + "=([^;]*)")
    );
    if (!match) return null;
    const v = decodeURIComponent(match[1]);
    return JSON.parse(v);
  } catch (e) {
    return null;
  }
}

export default function CalendarMulti({
  defaultYear = "2082",
  defaultMonth = 1,
}) {
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth); // 1-based
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // settings: which extra info to show. persisted in cookie 'calendar_settings'
  const [settings, setSettings] = useState({ tithi: false, nakshatra: false });
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    // read cookie on mount
    const s = getCookie("calendar_settings");
    if (s && typeof s === "object") setSettings((prev) => ({ ...prev, ...s }));
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/data/${year}/${month}.json`);
        if (!res.ok) throw new Error("no-data");
        const json = await res.json();
        if (mounted) setData(json);
      } catch (e) {
        if (mounted) {
          setData(null);
          setErr(e.message || "error");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [year, month]);

  function prev() {
    if (month > 1) setMonth((m) => m - 1);
  }
  function next() {
    setMonth((m) => m + 1);
  }

  let title = `${year} / ${month}`;
  if (data && data.metadata) {
    const np = data.metadata.np;
    const en = data.metadata.en;
    if (en && np) {
      // show both English and Nepali month names when available
      title = `${en} · ${np}`;
    } else if (en) {
      title = en;
    } else if (np) {
      title = np;
    }
  }

  // build weeks from data.days where weekday: 1 = Sunday
  const weeks = [];
  if (data && Array.isArray(data.days)) {
    let curWeek = Array(7).fill(null);
    data.days.forEach((d) => {
      const col = Math.max(0, Math.min(6, (d.weekday || 1) - 1));
      curWeek[col] = d;
      if (col === 6) {
        weeks.push(curWeek);
        curWeek = Array(7).fill(null);
      }
    });
    if (curWeek.some(Boolean)) weeks.push(curWeek);
  }

  // handle clicks outside settings to close
  useEffect(() => {
    function onDocClick(e) {
      if (!showSettings) return;
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [showSettings]);

  function toggleSetting(key) {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    setCookie("calendar_settings", next, 365);
  }

  return (
    <div className="bg-base-100 p-4 rounded-lg shadow-sm w-full max-w-3xl">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-lg">{title}</div>
        <div className="flex gap-2 items-center">
          <div className="relative" ref={settingsRef}>
            <button
              className="btn btn-ghost btn-sm flex gap-1 items-center"
              onClick={() => setShowSettings((s) => !s)}
              aria-haspopup="true"
              aria-expanded={showSettings}
            >
              <Gear size={20} weight="bold" />
              <span>Customize</span>
            </button>
            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-base-200 border rounded shadow-md p-3 z-50">
                <div className="text-sm font-medium mb-2">Show extra info</div>
                <label className="flex items-center gap-2 text-sm mb-1">
                  <input
                    type="checkbox"
                    checked={!!settings.tithi}
                    onChange={() => toggleSetting("tithi")}
                    className="checkbox checkbox-sm"
                  />
                  Tithi
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!settings.nakshatra}
                    onChange={() => toggleSetting("nakshatra")}
                    className="checkbox checkbox-sm"
                  />
                  Nakshatra
                </label>
              </div>
            )}
          </div>

          <button
            className="btn btn-sm"
            onClick={prev}
            aria-label="previous month"
            disabled={month <= 1}
          >
            Prev
          </button>
          <button className="btn btn-sm" onClick={next} aria-label="next month">
            Next
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-8 text-center text-sm text-muted">Loading…</div>
      )}
      {!loading && err && (
        <div className="py-8 text-center text-sm text-muted">
          No data for {year}/{month}
        </div>
      )}

      {!loading && data && (
        <>
          <div className="grid grid-cols-7 text-center text-xs font-medium mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weeks.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const idx = `${rIdx}-${cIdx}`;
                if (!cell)
                  return (
                    <div
                      key={idx}
                      className="h-20 rounded-md bg-base-200/40"
                    ></div>
                  );
                const label = cell.np;
                return (
                  <div
                    key={idx}
                    className="h-20 p-2 border rounded-md flex flex-col justify-between bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-sm font-medium">{label}</div>
                      <div>
                        {settings.tithi && cell.Tithi ? (
                          <div className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            T
                          </div>
                        ) : null}
                        {settings.nakshatra && cell.Nakshatra ? (
                          <div className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full mt-1">
                            N
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-xs text-muted">
                      {settings.tithi && (
                        <div className="truncate">{cell.Tithi}</div>
                      )}
                      {settings.nakshatra && (
                        <div className="truncate">{cell.Nakshatra}</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
