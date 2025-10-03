"use client";
import { Gear, CheckCircle, Circle, X } from "phosphor-react";
import NepaliDate from "nepali-date-converter";
import { useEffect, useMemo, useState } from "react";

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
  // compact: responsive 7-column grid (no fixed widths/min-w) suitable for small embeds
  compact = false,
  // hide the month banner image (used by home Patro card)
  hideBanner = false,
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
        // Prefer exact BS detection using nepali-date-converter
        const nd = NepaliDate.fromAD(new Date());
        const bsY = nd.getYear();
        const bsM = nd.getMonth() + 1; // 1-based

        // Verify data exists for this BS month; fallback to old heuristic if not
        try {
          const res = await fetch(`/data/${bsY}/${bsM}.json`);
          if (res.ok) {
            if (!cancelled) {
              setYear(String(bsY));
              setMonth(bsM);
              return;
            }
          } else {
            const res2 = await fetch(`/data-db/${bsY}/${bsM}.json`);
            if (res2.ok) {
              if (!cancelled) {
                setYear(String(bsY));
                setMonth(bsM);
                return;
              }
            }
          }
        } catch (e) {
          // continue to heuristic
        }

        // Heuristic fallback using metadata text
        const now = new Date();
        const monthName = now.toLocaleString("en", { month: "long" });
        const monthAbbr = now.toLocaleString("en", { month: "short" });
        const yearNum = now.getFullYear();
        const bsGuess = nd.getYear(); // closer than AD+57
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

          ["holiFest", "marriage", "bratabandha", "pasni", "notes"].forEach(
            (key) => {
              if (overlayJson[key] != null) {
                combined[key] = overlayJson[key];
              } else if (combined[key] == null && baseJson[key] != null) {
                combined[key] = baseJson[key];
              }
            }
          );
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

  useEffect(() => {
    if (!showSettings) return;

    function onKeyDown(e) {
      if (e.key === "Escape") setShowSettings(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showSettings]);

  function toggleSetting(key) {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    setCookie("calendar_settings", next, 365);
  }

  function updateHoliday(day) {
    if (settings.holidayDOW === day) return;
    const next = { ...settings, holidayDOW: day };
    setSettings(next);
    setCookie("calendar_settings", next, 365);
  }

  const festivalEntries = useMemo(
    () => parseNepaliFestivalList(data?.holiFest),
    [data?.holiFest]
  );
  const marriageList = useMemo(
    () => (Array.isArray(data?.marriage) ? data.marriage.filter(Boolean) : []),
    [data?.marriage]
  );
  const bratabandhaList = useMemo(
    () =>
      Array.isArray(data?.bratabandha) ? data.bratabandha.filter(Boolean) : [],
    [data?.bratabandha]
  );
  const pasniList = useMemo(
    () => (Array.isArray(data?.pasni) ? data.pasni.filter(Boolean) : []),
    [data?.pasni]
  );

  return (
    <div className="bg-base-100 p-4 rounded-lg shadow-sm overflow-x-auto overflow-y-auto mx-auto w-full">
      {!hideHeader && (
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-lg">{title}</div>
          <div className="flex gap-2 items-center">
            <button
              className="btn btn-ghost btn-sm flex gap-1 items-center"
              onClick={() => setShowSettings(true)}
              aria-haspopup="    dialog"
              aria-expanded={showSettings}
            >
              <Gear size={20} weight="bold" />
              <span>Customize</span>
            </button>

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
          {/* Month banner (hidden in compact or when hideBanner) */}
          {!compact && !hideBanner && (
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
          )}
          <div
            className={`grid ${compact ? "grid-cols-7" : "grid-cols-[repeat(7,8rem)] min-w-[56rem]"} text-xs sticky top-0 bg-base-100 z-10`}
          >
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

          <div
            className={`grid ${compact ? "grid-cols-7" : "grid-cols-[repeat(7,8rem)] min-w-[56rem]"} gap-0 ${compact ? "auto-rows-[minmax(3.5rem,auto)]" : "auto-rows-[minmax(5.5rem,auto)]"}`}
          >
            {weeks.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const idx = `${rIdx}-${cIdx}`;
                if (!cell)
                  return (
                    <div
                      key={idx}
                      className={`${compact ? "min-h-16" : "min-h-20"} rounded-md bg-base-200/40`}
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
                    className={`${compact ? "min-h-16" : "min-h-20"} p-2 border border-base-200/90 flex flex-col justify-between bg-base-100 cursor-pointer`}
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
                              className={`${compact ? "text-lg" : "text-xl"} font-extrabold leading-none ${
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

          <MonthInsights
            monthLabel={data?.metadata?.np || title}
            festivals={festivalEntries}
            marriageList={marriageList}
            bratabandhaList={bratabandhaList}
            pasniList={pasniList}
            isCompact={compact}
          />
        </>
      )}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onToggle={toggleSetting}
          onHolidayChange={updateHoliday}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

function MonthInsights({
  monthLabel,
  festivals,
  marriageList,
  bratabandhaList,
  pasniList,
  isCompact,
}) {
  const hasFestivals = Array.isArray(festivals) && festivals.length > 0;
  const hasMarriage = Array.isArray(marriageList) && marriageList.length > 0;
  const hasBratabandha =
    Array.isArray(bratabandhaList) && bratabandhaList.length > 0;
  const hasPasni = Array.isArray(pasniList) && pasniList.length > 0;

  if (!hasFestivals && !hasMarriage && !hasBratabandha && !hasPasni) {
    return null;
  }

  return (
    <section className={`mt-6 space-y-6 ${isCompact ? "" : "min-w-[56rem]"}`}>
      {hasFestivals && (
        <div className="rounded-3xl border border-base-300 bg-base-100/50 p-5 shadow-inner space-y-3">
          <h3 className="text-lg font-semibold text-base-content text-left">
            {monthLabel
              ? `${monthLabel} को विदा तथा पर्वहरु`
              : "विदा तथा पर्वहरु"}
          </h3>
          <ul className="space-y-1.5 text-sm leading-relaxed text-base-700">
            {festivals.map((item, idx) => (
              <li key={`${item.day}-${idx}`} className="flex gap-2 m-1 ">
                <span className="font-semibold text-base-content bg-blue-600 rounded-full text-white px-1">
                  {item.day}
                </span>
                <span className="flex-1 text-left text-pretty">
                  {item.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(hasMarriage || hasBratabandha || hasPasni) && (
        <div className="rounded-3xl border border-base-300 bg-base-200/40 p-5 space-y-4">
          <h3 className="text-lg font-semibold text-base-content text-left">
            बिबाह, ब्रतबन्ध, पास्नी
          </h3>
          {hasMarriage && (
            <InsightList label="बिबाह लगन" items={marriageList} />
          )}
          {hasBratabandha && (
            <InsightList label="ब्रतबन्ध शुभ साइत" items={bratabandhaList} />
          )}
          {hasPasni && (
            <InsightList label="पास्नी शुभ साइत" items={pasniList} />
          )}
        </div>
      )}
    </section>
  );
}

function InsightList({ label, items }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="space-y-1 text-sm text-base-700">
      <p className="font-medium text-base-content text-left">{label}:</p>
      <ul className="list-disc pl-6 space-y-1">
        {items.map((entry, idx) => (
          <li key={`${label}-${idx}`} className="text-left text-pretty">
            {entry}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SettingsModal({ settings, onToggle, onHolidayChange, onClose }) {
  const toggleOptions = [
    { key: "tithi", label: "Tithi", description: "Display the lunar day." },
    {
      key: "nakshatra",
      label: "Nakshatra",
      description: "Show the current lunar mansion.",
    },
    {
      key: "rasi",
      label: "Rasi",
      description: "Add the zodiac sign for each day.",
    },
    {
      key: "festivals",
      label: "Festivals",
      description: "Highlight festival names inside the cells.",
    },
    {
      key: "enDate",
      label: "English date",
      description: "Display the matched Gregorian date.",
    },
    {
      key: "npDigits",
      label: "Nepali digits",
      description: "Switch date numbers to Devanagari script.",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-base-900/70 backdrop-blur-sm px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Customize calendar"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-base-100 border border-base-300 rounded-3xl shadow-2xl p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Customize calendar</h2>
            <p className="text-sm text-base-500 mt-1">
              Choose the additional details you&apos;d like to see on every day.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-base-500">
            Day details
          </h3>
          <div className="space-y-2">
            {toggleOptions.map((opt) => (
              <ToggleOption
                key={opt.key}
                label={opt.label}
                description={opt.description}
                checked={!!settings[opt.key]}
                onToggle={() => onToggle(opt.key)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-base-500">
            Weekly holiday
          </h3>
          <div
            role="radiogroup"
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            aria-label="Weekly holiday selection"
          >
            <ChoiceOption
              label="Saturday"
              description="Follow the Nepal weekend."
              selected={settings.holidayDOW === "saturday"}
              onSelect={() => onHolidayChange("saturday")}
            />
            <ChoiceOption
              label="Sunday"
              description="Follow the Indian weekend."
              selected={settings.holidayDOW === "sunday"}
              onSelect={() => onHolidayChange("sunday")}
            />
          </div>
        </section>

        <div className="flex justify-end">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleOption({ label, description, checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${checked ? "border-primary/70 bg-primary/10" : "border-base-300 bg-base-200/40 hover:bg-base-200"}`}
      role="switch"
      aria-checked={checked}
    >
      <span className="flex-1">
        <span className="block text-base font-medium text-base-content">
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs text-base-500">
            {description}
          </span>
        ) : null}
      </span>
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${checked ? "border-primary bg-primary text-base-100" : "border-base-300 bg-base-100 text-base-400"}`}
        aria-hidden="true"
      >
        {checked ? (
          <CheckCircle size={18} weight="fill" />
        ) : (
          <Circle size={18} />
        )}
      </span>
    </button>
  );
}

function ChoiceOption({ label, description, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? "border-primary/70 bg-primary/10" : "border-base-300 bg-base-200/40 hover:bg-base-200"}`}
      role="radio"
      aria-checked={selected}
    >
      <span className="flex-1">
        <span className="block text-base font-medium text-base-content">
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs text-base-500">
            {description}
          </span>
        ) : null}
      </span>
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${selected ? "border-primary bg-primary text-base-100" : "border-base-300 bg-base-100 text-base-400"}`}
        aria-hidden="true"
      >
        {selected ? (
          <CheckCircle size={18} weight="fill" />
        ) : (
          <Circle size={18} />
        )}
      </span>
    </button>
  );
}

function parseNepaliFestivalList(rawList) {
  if (!Array.isArray(rawList) || rawList.length === 0) return [];

  const text = rawList.join(" ").replace(/\s+/g, " ").trim();
  if (!text) return [];

  const nepDigits = "०१२३४५६७८९";
  const pattern = new RegExp(`([${nepDigits}]+)\\s*([^${nepDigits}]+)`, "g");
  const results = [];
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const dayRaw = (match[1] || "").trim();
    const descRaw = (match[2] || "").trim();
    if (!dayRaw || !descRaw) continue;

    const description = descRaw.replace(/[、,;]+$/, "").trim();
    results.push({ day: dayRaw, description });
  }

  return results;
}
