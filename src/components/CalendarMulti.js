"use client";
import { Gear } from "phosphor-react";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

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
  showControls = true,
}) {
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth); // 1-based
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // settings: which extra info to show. persisted in cookie 'calendar_settings'
  const [settings, setSettings] = useState({
    tithi: false,
    nakshatra: false,
    rasi: false,
    enDate: false,
  });
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // read cookie on mount
    const s = getCookie("calendar_settings");
    if (s && typeof s === "object") setSettings((prev) => ({ ...prev, ...s }));
  }, []);

  // if component was mounted with default props, try to auto-detect the BS month
  // that contains the current Gregorian month (so calendar shows current month)
  useEffect(() => {
    // only run detection when user didn't override defaults
    if (
      String(defaultYear) !== String(year) ||
      Number(defaultMonth) !== Number(month)
    )
      return;

    let cancelled = false;
    (async () => {
      try {
        const now = new Date();
        const monthName = now.toLocaleString("en", { month: "long" });
        const yearNum = now.getFullYear();
        // Bikram Sambat is roughly AD + 57
        const bsGuess = yearNum + 57;

        for (let m = 1; m <= 12; m++) {
          if (cancelled) return;
          try {
            const res = await fetch(`/data/${bsGuess}/${m}.json`);
            if (!res.ok) continue;
            const json = await res.json();
            const meta =
              json && json.metadata && (json.metadata.en || json.metadata.np);
            if (
              meta &&
              String(meta).includes(String(yearNum)) &&
              String(meta).includes(monthName)
            ) {
              if (!cancelled) {
                setYear(String(bsGuess));
                setMonth(m);
              }
              return;
            }
          } catch (e) {
            // ignore and continue
          }
        }
      } catch (e) {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []); // run once on mount

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
      // show Nepali first, English in parentheses
      title = `${np} (${en})`;
    } else if (np) {
      title = np;
    } else if (en) {
      title = en;
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

  function handleGridClick() {
    // only for compact/embedded usage when controls are hidden
    if (showControls) return;
    try {
      const segments = (pathname || "").split("/").filter(Boolean);
      const locale = segments[0] || "";
      const target = locale ? `/${locale}/calendar` : `/calendar`;
      router.push(target);
    } catch (e) {
      // fallback
      router.push("/calendar");
    }
  }

  return (
    <div className="bg-base-100 p-4 rounded-lg shadow-sm w-full mx-auto max-w-3xl">
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
                <label className="flex items-center gap-2 text-sm mt-1">
                  <input
                    type="checkbox"
                    checked={!!settings.rasi}
                    onChange={() => toggleSetting("rasi")}
                    className="checkbox checkbox-sm"
                  />
                  Rasi
                </label>
                <label className="flex items-center gap-2 text-sm mt-1">
                  <input
                    type="checkbox"
                    checked={!!settings.enDate}
                    onChange={() => toggleSetting("enDate")}
                    className="checkbox checkbox-sm"
                  />
                  English date
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
          <div className="grid grid-cols-7 text-center text-xs">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div
                key={`dow-${i}-${d}`}
                className={
                  i === 6
                    ? `py-1 text-lg text-left pl-2 font-extrabold border border-base-200/90 text-red-500`
                    : `py-1 text-lg text-left pl-2 font-extrabold border border-base-200/90 text-base-content/95`
                }
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0">
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
                const labelNp = cell.np;
                const labelEn = cell.en;
                const isSaturday = cIdx === 6;
                return (
                  <div
                    key={idx}
                    className="h-20 p-2 border border-base-200/90 flex flex-col justify-between bg-base-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium">
                          <span
                            className={`text-xl font-extrabold leading-none ${isSaturday ? "text-red-500" : ""}`}
                          >
                            {labelNp}
                          </span>
                        </div>
                        {settings.enDate && labelEn ? (
                          <div
                            className={`text-xs mt-0.5 ${isSaturday ? "text-red-500" : "text-muted"}`}
                          >
                            {labelEn}
                          </div>
                        ) : null}
                      </div>
                      <div>
                        {settings.tithi && cell.Tithi ? (
                          <div className="text-xs text-green-600 bg-green-600/10 px-2 py-0.5 rounded-full">
                            T
                          </div>
                        ) : null}
                        {settings.nakshatra && cell.Nakshatra ? (
                          <div className="text-xs text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded-full mt-1">
                            N
                          </div>
                        ) : null}
                        {settings.rasi
                          ? (() => {
                              const rasiVal =
                                cell.Rasi ||
                                cell.rasi ||
                                (cell.MoonTiming
                                  ? String(cell.MoonTiming).split(" ")[0]
                                  : null);
                              return rasiVal ? (
                                <div className="text-xs text-red-700 bg-red-600/10 px-2 py-0.5 rounded-full mt-1">
                                  R
                                </div>
                              ) : null;
                            })()
                          : null}
                      </div>
                    </div>
                    <div className="text-xs text-muted">
                      {settings.tithi && (
                        <div className="truncate">{cell.Tithi}</div>
                      )}
                      {settings.nakshatra && (
                        <div className="truncate">{cell.Nakshatra}</div>
                      )}
                      {settings.rasi &&
                        (() => {
                          const rasiVal =
                            cell.Rasi ||
                            cell.rasi ||
                            (cell.MoonTiming
                              ? String(cell.MoonTiming).split(" ")[0]
                              : null);
                          return rasiVal ? (
                            <div className="truncate">{rasiVal}</div>
                          ) : null;
                        })()}
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
