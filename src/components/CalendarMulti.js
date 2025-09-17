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

// numeral helpers for Nepali/Devanagari <-> Latin digits
const __devDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
function toDevanagariDigits(input) {
  if (input == null) return "";
  const s = String(input);
  return s.replace(/[0-9]/g, (d) => __devDigits[Number(d)]);
}
function toLatinDigits(input) {
  if (input == null) return "";
  const s = String(input);
  return s.replace(/[०१२३४५६७८९]/g, (ch) => String(__devDigits.indexOf(ch)));
}

export default function CalendarMulti({
  defaultYear = "2082",
  defaultMonth = 1,
  hideHeader = false,
  // initialSettings: optional object to force which extras to show { tithi, nakshatra, rasi, enDate }
  initialSettings = null,
  // onDateClick: optional callback(cell) when a date cell is clicked
  onDateClick = null,
  // when true, always auto-detect the current month on mount regardless of defaults/search params
  forceCurrentOnMount = false,
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
    npDigits: false, // show Nepali date in Devanagari when true; default shows Latin digits
    festivals: false,
    holidayDOW: "saturday", // 'saturday' (Nepal) or 'sunday' (India)
  });
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    // read cookie on mount only when initialSettings is not provided
    if (initialSettings && typeof initialSettings === "object") {
      setSettings((prev) => ({ ...prev, ...initialSettings }));
      return;
    }
    const s = getCookie("calendar_settings");
    if (s && typeof s === "object") setSettings((prev) => ({ ...prev, ...s }));
  }, []);

  // if component was mounted with default props, try to auto-detect the BS month
  // that contains the current Gregorian month (so calendar shows current month)
  useEffect(() => {
    // only run detection when user didn't override defaults
    if (
      !forceCurrentOnMount &&
      (String(defaultYear) !== String(year) ||
        Number(defaultMonth) !== Number(month))
    ) {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const now = new Date();
        const monthName = now.toLocaleString("en", { month: "long" });
        const monthAbbr = now.toLocaleString("en", { month: "short" });
        const yearNum = now.getFullYear();
        // Bikram Sambat is roughly AD + 57
        const bsGuess = yearNum + 57;

        for (let m = 1; m <= 12; m++) {
          if (cancelled) return;
          try {
            let json = null;
            let res = await fetch(`/data/${bsGuess}/${m}.json`);
            if (res.ok) {
              json = await res.json();
            } else {
              res = await fetch(`/data-db/${bsGuess}/${m}.json`);
              if (res.ok) json = await res.json();
            }
            if (!json) continue;
            const meta =
              json && json.metadata && (json.metadata.en || json.metadata.np);
            if (
              meta &&
              String(meta).includes(String(yearNum)) &&
              (String(meta).includes(monthName) ||
                String(meta).includes(monthAbbr))
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
        const [baseResSettled, overlayResSettled] = await Promise.allSettled([
          fetch(`/data/${year}/${month}.json`),
          fetch(`/data-db/${year}/${month}.json`),
        ]);

        let baseJson = null;
        let overlayJson = null;

        if (baseResSettled.status === "fulfilled" && baseResSettled.value.ok) {
          baseJson = await baseResSettled.value.json();
        }
        if (
          overlayResSettled.status === "fulfilled" &&
          overlayResSettled.value.ok
        ) {
          overlayJson = await overlayResSettled.value.json();
        }

        if (!baseJson && !overlayJson) throw new Error("no-data");

        // Merge overlay festivals/holidays into base data by day index
        let combined = baseJson || overlayJson;
        if (baseJson && overlayJson) {
          const baseDays = Array.isArray(baseJson.days) ? baseJson.days : [];
          const overlayDays = Array.isArray(overlayJson.days)
            ? overlayJson.days
            : [];
          const maxLen = Math.max(baseDays.length, overlayDays.length);
          const mergedDays = new Array(maxLen).fill(null).map((_, i) => {
            const b = baseDays[i] ? { ...baseDays[i] } : {};
            const o = overlayDays[i] || null;
            if (o) {
              if (o.f) b.f = o.f;
              if (o.h != null) b.h = !!o.h;
              if (o.t != null && String(o.t).trim() !== "") b.t = o.t;
              // keep original labels from base; we don't overwrite np/en here
              // weekday comes from base; if missing, fall back to overlay's d
              if (b.weekday == null && o.d != null) b.weekday = o.d;
            }
            return b;
          });
          combined = { ...baseJson, days: mergedDays };
          // prefer base metadata; if missing, fallback to overlay metadata
          if (!combined.metadata && overlayJson.metadata)
            combined.metadata = overlayJson.metadata;
        }

        if (mounted) setData(combined);
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

  // determine if the displayed BS month includes today's Gregorian month/year
  const __now = new Date();
  const __todayDay = __now.getDate();
  const __todayYearStr = String(__now.getFullYear());
  const __todayMonthLong = __now.toLocaleString("en", { month: "long" });
  const __todayMonthShort = __now.toLocaleString("en", { month: "short" });
  const __metaEn = (data && data.metadata && data.metadata.en) || "";
  const __showsTodayGregorianMonth =
    __metaEn &&
    __metaEn.includes(__todayYearStr) &&
    (__metaEn.includes(__todayMonthLong) ||
      __metaEn.includes(__todayMonthShort));

  // annotate each day with inferred Gregorian month abbreviation (from metadata)
  if (data && Array.isArray(data.days)) {
    const monthsInMeta = (
      __metaEn.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/g) || []
    ).slice(0, 2);
    let currentMonthIdx = 0;
    let lastEN = null;
    for (const d of data.days) {
      const eRaw = d && (d.e ?? d.en);
      const eNum = eRaw != null ? parseInt(eRaw, 10) : NaN;
      if (Number.isFinite(eNum) && eNum >= 1 && eNum <= 31) {
        if (lastEN != null && eNum < lastEN && monthsInMeta.length > 1) {
          currentMonthIdx = Math.min(
            currentMonthIdx + 1,
            monthsInMeta.length - 1
          );
        }
        d.__gregMonthAbbr = monthsInMeta[currentMonthIdx] || null;
        lastEN = eNum;
      } else {
        d.__gregMonthAbbr = null;
      }
    }
  }

  // build weeks from data.days where weekday: 1 = Sunday
  const weeks = [];
  if (data && Array.isArray(data.days)) {
    let curWeek = Array(7).fill(null);
    data.days.forEach((d) => {
      const wd = (d && (d.weekday ?? d.d)) || 1; // support new schema `.d`
      const col = Math.max(0, Math.min(6, wd - 1));
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
    <div className="bg-base-100 p-4 rounded-lg shadow-sm overflow-x-scroll overflow-y-auto mx-auto w-full">
      {!hideHeader && (
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
                  <div className="text-sm font-medium mb-2">
                    Show extra info
                  </div>
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
                      checked={!!settings.festivals}
                      onChange={() => toggleSetting("festivals")}
                      className="checkbox checkbox-sm"
                    />
                    Festivals
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
                  <label className="flex items-center gap-2 text-sm mt-1">
                    <input
                      type="checkbox"
                      checked={!!settings.npDigits}
                      onChange={() => toggleSetting("npDigits")}
                      className="checkbox checkbox-sm"
                    />
                    Nepali digits
                  </label>
                  <div className="mt-3 text-xs">
                    <div className="font-medium mb-1">Weekly holiday</div>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="holidayDOW"
                          className="radio radio-xs"
                          checked={settings.holidayDOW === "saturday"}
                          onChange={() => {
                            const next = {
                              ...settings,
                              holidayDOW: "saturday",
                            };
                            setSettings(next);
                            setCookie("calendar_settings", next, 365);
                          }}
                        />
                        Saturday
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="holidayDOW"
                          className="radio radio-xs"
                          checked={settings.holidayDOW === "sunday"}
                          onChange={() => {
                            const next = { ...settings, holidayDOW: "sunday" };
                            setSettings(next);
                            setCookie("calendar_settings", next, 365);
                          }}
                        />
                        Sunday
                      </label>
                    </div>
                  </div>
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
            <button
              className="btn btn-sm"
              onClick={next}
              aria-label="next month"
            >
              Next
            </button>
          </div>
        </div>
      )}

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
          {/* Month banner */}
          <div className="mb-3 min-w-[56rem]">
            <img
              src={`/month-banner/${month}.jpg`}
              alt={
                (data &&
                  data.metadata &&
                  (data.metadata.np || data.metadata.en)) ||
                `Month ${month}`
              }
              className="w-full h-auto max-h-[22rem] object-contain rounded-md border border-base-200/90 bg-base-100"
              onError={(e) => {
                // hide image if banner not available
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <div className="grid grid-cols-[repeat(7,8rem)] text-xs sticky top-0 bg-base-100 z-10 min-w-[56rem]">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div
                key={`dow-${i}-${d}`}
                className={`p-2 text-base text-left font-extrabold border border-base-200/90 ${
                  (settings.holidayDOW === "saturday" && i === 6) ||
                  (settings.holidayDOW === "sunday" && i === 0)
                    ? "text-red-500"
                    : "text-base-content/95"
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[repeat(7,8rem)] gap-0 auto-rows-[minmax(5.5rem,auto)] min-w-[56rem]">
            {weeks.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const idx = `${rIdx}-${cIdx}`;
                if (!cell)
                  return (
                    <div
                      key={idx}
                      className="min-h-20 rounded-md bg-base-200/40"
                    ></div>
                  );
                const labelNpRaw = cell.n ?? cell.np;
                const labelNp = settings.npDigits
                  ? toDevanagariDigits(labelNpRaw)
                  : toLatinDigits(labelNpRaw);
                const labelEn = cell.e ?? cell.en;
                const tithiVal = (() => {
                  const overlayT = cell.t;
                  if (overlayT != null && String(overlayT).trim() !== "")
                    return overlayT;
                  return cell.Tithi;
                })();
                const nakshatraVal = cell.Nakshatra; // fallback only if present
                const datasetHoliday = !!cell.h;
                const isSaturday = cIdx === 6;
                const isSunday = cIdx === 0;
                const isWeeklyHoliday =
                  (settings.holidayDOW === "saturday" && isSaturday) ||
                  (settings.holidayDOW === "sunday" && isSunday);
                const hasFestivalText = !!(cell.f && String(cell.f).trim());
                // If the dataset marked the default weekly holiday as holiday but the user chose the other weekend,
                // we ignore the dataset holiday for that weekday unless there is an explicit festival text.
                const isHoliday = (() => {
                  if (!datasetHoliday) return false;
                  if (hasFestivalText) return true;
                  if (settings.holidayDOW === "sunday" && isSaturday)
                    return false;
                  if (settings.holidayDOW === "saturday" && isSunday)
                    return false;
                  return true;
                })();
                const isToday = (() => {
                  if (!__showsTodayGregorianMonth) return false;
                  const enNum = Number(labelEn);
                  if (Number.isNaN(enNum) || enNum !== __todayDay) return false;
                  const monthAbbr = __now.toLocaleString("en", {
                    month: "short",
                  });
                  const inferred = cell.__gregMonthAbbr || null;
                  return inferred ? inferred === monthAbbr : true;
                })();
                return (
                  <div
                    key={idx}
                    className="min-h-20 p-2 border border-base-200/90 flex flex-col justify-between bg-base-100 cursor-pointer"
                    role={onDateClick ? "button" : undefined}
                    tabIndex={onDateClick ? 0 : undefined}
                    onClick={() => {
                      if (onDateClick) onDateClick(cell);
                    }}
                    onKeyDown={(e) => {
                      if (!onDateClick) return;
                      if (e.key === "Enter" || e.key === " ") onDateClick(cell);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium">
                          {isToday ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white text-base font-extrabold leading-none">
                              {labelNp}
                            </span>
                          ) : (
                            <span
                              className={`text-xl font-extrabold leading-none ${
                                isWeeklyHoliday || isHoliday
                                  ? "text-red-600"
                                  : ""
                              }`}
                            >
                              {labelNp}
                            </span>
                          )}
                        </div>
                        {settings.enDate && labelEn ? (
                          <div
                            className={`text-xs mt-0.5 ${
                              isWeeklyHoliday || isHoliday
                                ? "text-red-600"
                                : "text-muted"
                            }`}
                          >
                            {labelEn}
                          </div>
                        ) : null}
                      </div>
                      {settings.festivals && cell.f ? (
                        <div className="whitespace-normal text-base-content/80">
                          {cell.f}
                        </div>
                      ) : null}
                      <div className="shrink-0">
                        {settings.tithi && tithiVal ? (
                          <div className="text-xs text-green-600 bg-green-600/10 px-2 py-0.5 rounded-full">
                            T
                          </div>
                        ) : null}
                        {settings.nakshatra && nakshatraVal ? (
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
                    <div className="text-xs text-muted overflow-x-auto space-y-0.5">
                      {settings.tithi && tithiVal && (
                        <div className="whitespace-nowrap">{tithiVal}</div>
                      )}
                      {settings.nakshatra && nakshatraVal && (
                        <div className="whitespace-nowrap">{nakshatraVal}</div>
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
                            <div className="whitespace-nowrap">{rasiVal}</div>
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
