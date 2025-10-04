"use client";
import { Gear, CheckCircle, Circle, X } from "phosphor-react";
import NepaliDate from "nepali-date-converter";
import { MhahPanchang } from "mhah-panchang";
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

const choghadiyaData = {
  day: [
    ["Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"],
    ["Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit"],
    ["Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog"],
    ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh"],
    ["Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh"],
    ["Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char"],
    ["Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal"],
  ],
  night: [
    ["Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh"],
    ["Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char"],
    ["Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal"],
    ["Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg"],
    ["Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit"],
    ["Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog"],
    ["Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh"],
  ],
};

const auspiciousSlots = ["Amrit"];
const goodSlots = ["Shubh", "Labh"];
const neutralSlots = ["Char"];
const badSlots = ["Rog", "Udveg"];
const inauspiciousSlots = ["Kaal"];

function getChoghadiyaClass(value) {
  if (auspiciousSlots.includes(value)) return "bg-green-600 text-white";
  if (goodSlots.includes(value)) return "bg-green-200 text-green-900";
  if (neutralSlots.includes(value)) return "bg-gray-200 text-gray-700";
  if (badSlots.includes(value)) return "bg-red-200 text-red-900";
  if (inauspiciousSlots.includes(value)) return "bg-red-600 text-white";
  return "bg-base-200 text-base-content";
}

function timeToSeconds(timeStr) {
  const [time, period] = String(timeStr).trim().split(" ");
  const [h, m = "0", s = "0"] = time.split(":");
  let hours = Number(h) % 12;
  if (period === "PM" && Number(h) !== 12) hours += 12;
  if (period === "AM" && Number(h) === 12) hours = 0;
  return hours * 3600 + Number(m) * 60 + Number(s);
}

function secondsTo12HrTime(totalSeconds) {
  const normalized = ((totalSeconds % (24 * 3600)) + 24 * 3600) % (24 * 3600);
  const h = Math.floor(normalized / 3600);
  const m = Math.floor((normalized % 3600) / 60);
  const s = Math.floor(normalized % 60);
  const hour12 = ((h + 11) % 12) + 1;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${hour12.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")} ${ampm}`;
}

export default function CalendarMulti({
  defaultYear = "2082",
  defaultMonth = 1,
  hideHeader = false,
  showCompactTitle = false,
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
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailState, setDetailState] = useState({
    loading: false,
    error: null,
    panchang: null,
    sunData: null,
    daySegments: [],
    nightSegments: [],
    sunrise: null,
    sunset: null,
    choghadiyaError: null,
  });

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

  function deriveSelectedDay(cell) {
    if (!cell) return null;
    const bsDayRaw = cell?.n ?? cell?.np ?? "";
    const bsDayStr = toLatinDigits(bsDayRaw);
    const bsDay = parseInt(bsDayStr, 10);
    if (!Number.isFinite(bsDay)) return null;

    const bsYearNum = Number(year);
    const bsMonthNum = Number(month);
    if (!Number.isFinite(bsYearNum) || !Number.isFinite(bsMonthNum)) {
      return null;
    }

    try {
      const bsDate = new NepaliDate(bsYearNum, bsMonthNum - 1, bsDay);
      const adDate = bsDate.toJsDate();
      return {
        cell,
        bsDay,
        bsMonth: bsMonthNum,
        bsYear: bsYearNum,
        bsDate,
        adDate,
      };
    } catch (e) {
      return null;
    }
  }

  function openDayModal(cell) {
    const derived = deriveSelectedDay(cell);
    if (!derived) return;
    setSelectedDay(derived);
    setModalOpen(true);
    if (onDateClick) {
      try {
        onDateClick(cell, derived);
      } catch (e) {
        console.error("onDateClick handler threw", e);
      }
    }
  }

  function closeDayModal() {
    setModalOpen(false);
    setSelectedDay(null);
  }

  function formatDateYMD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async function computeChoghadiyaForDate(adDate) {
    const lat = 28.7041;
    const lng = 77.1025;
    const todayStr = formatDateYMD(adDate);
    const tomorrow = new Date(adDate.getTime());
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDateYMD(tomorrow);
    const dayIndex = adDate.getDay();

    const baseResponse = {
      daySegments: [],
      nightSegments: [],
      sunrise: null,
      sunset: null,
      error: null,
    };

    try {
      const [todayRes, tomorrowRes] = await Promise.all([
        fetch(
          `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&date=${todayStr}`
        ),
        fetch(
          `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&date=${tomorrowStr}`
        ),
      ]);

      const todayJson = await todayRes.json();
      const tomorrowJson = await tomorrowRes.json();

      if (todayJson.status !== "OK" || tomorrowJson.status !== "OK") {
        throw new Error("sunrise-fetch-failed");
      }

      const todaySunrise = timeToSeconds(todayJson.results.sunrise);
      const todaySunset = timeToSeconds(todayJson.results.sunset);
      const tomorrowSunrise = timeToSeconds(tomorrowJson.results.sunrise);

      const dayDuration = todaySunset - todaySunrise;
      const nightDuration =
        (24 * 3600 - todaySunset + tomorrowSunrise + 24 * 3600) % (24 * 3600);
      const segmentDuration = dayDuration / 8;
      const nightSegmentDuration = nightDuration / 8;

      const dayNames = choghadiyaData.day[dayIndex];
      const nightNames = choghadiyaData.night[dayIndex];

      const daySegments = Array.from({ length: 8 }).map((_, i) => {
        const segStart = todaySunrise + i * segmentDuration;
        const segEnd = segStart + segmentDuration;
        return {
          start: secondsTo12HrTime(segStart),
          end: secondsTo12HrTime(segEnd),
          name: dayNames?.[i] ?? "",
        };
      });

      const nightSegments = Array.from({ length: 8 }).map((_, i) => {
        const segStart = todaySunset + i * nightSegmentDuration;
        const segEnd = segStart + nightSegmentDuration;
        return {
          start: secondsTo12HrTime(segStart),
          end: secondsTo12HrTime(segEnd),
          name: nightNames?.[i] ?? "",
        };
      });

      return {
        daySegments,
        nightSegments,
        sunrise: todayJson.results.sunrise,
        sunset: todayJson.results.sunset,
        error: null,
      };
    } catch (error) {
      const startSec = timeToSeconds("05:46:22");
      const endSec = timeToSeconds("19:26:56");
      const dayDuration = endSec - startSec;
      const nightDuration = 24 * 3600 - dayDuration;
      const segmentDuration = dayDuration / 8;
      const nightSegmentDuration = nightDuration / 8;

      const dayNames = choghadiyaData.day[dayIndex];
      const nightNames = choghadiyaData.night[dayIndex];

      const fallbackDay = Array.from({ length: 8 }).map((_, i) => {
        const segStart = startSec + i * segmentDuration;
        const segEnd = segStart + segmentDuration;
        return {
          start: secondsTo12HrTime(segStart),
          end: secondsTo12HrTime(segEnd),
          name: dayNames?.[i] ?? "",
        };
      });

      const fallbackNight = Array.from({ length: 8 }).map((_, i) => {
        const segStart = endSec + i * nightSegmentDuration;
        const segEnd = segStart + nightSegmentDuration;
        return {
          start: secondsTo12HrTime(segStart),
          end: secondsTo12HrTime(segEnd),
          name: nightNames?.[i] ?? "",
        };
      });

      return {
        daySegments: fallbackDay,
        nightSegments: fallbackNight,
        sunrise: secondsTo12HrTime(startSec),
        sunset: secondsTo12HrTime(endSec),
        error:
          "Error fetching sunrise/sunset data. Showing approximate segments.",
      };
    }
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

  useEffect(() => {
    if (!modalOpen) return;

    function onKeyDown(e) {
      if (e.key === "Escape") closeDayModal();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen || !selectedDay?.adDate) return;

    let cancelled = false;
    const adDate = new Date(selectedDay.adDate.getTime());
    const mhah = new MhahPanchang();

    setDetailState({
      loading: true,
      error: null,
      panchang: null,
      sunData: null,
      daySegments: [],
      nightSegments: [],
      sunrise: null,
      sunset: null,
      choghadiyaError: null,
    });

    (async () => {
      try {
        const panchangData = mhah.calendar(adDate, 28.7041, 77.1025);
        const sunData = mhah.sunTimer(adDate, 28.7041, 77.1025);
        const choghadiya = await computeChoghadiyaForDate(adDate);

        if (cancelled) return;

        setDetailState({
          loading: false,
          error: null,
          panchang: panchangData,
          sunData,
          daySegments: choghadiya.daySegments,
          nightSegments: choghadiya.nightSegments,
          sunrise: choghadiya.sunrise,
          sunset: choghadiya.sunset,
          choghadiyaError: choghadiya.error,
        });
      } catch (error) {
        if (cancelled) return;
        setDetailState((prev) => ({
          ...prev,
          loading: false,
          error:
            error?.message ||
            "Unable to load Panchang information for this date.",
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [modalOpen, selectedDay?.adDate]);

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

  const showBannerBackground = !compact && !hideBanner;
  const bannerUrl = showBannerBackground ? `/month-banner/${month}.jpg` : null;

  return (
    <div className="bg-base-100 p-4 rounded-lg shadow-sm overflow-x-auto overflow-y-auto mx-auto w-full">
      {!hideHeader && (
        <div
          className={`relative mb-3 rounded-2xl border border-base-300 overflow-hidden ${
            !compact ? "min-w-[56rem]" : ""
          }`}
        >
          {bannerUrl && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bannerUrl})` }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-base-900/35 backdrop-blur-[1px]"
                aria-hidden="true"
              />
            </>
          )}
          <div
            className={`relative flex items-center justify-between gap-3 px-4 py-3 ${
              bannerUrl ? "text-base-100" : ""
            }`}
          >
            <div className="font-semibold text-lg">{title}</div>
            <div className="flex gap-2 items-center">
              <button
                className={`btn btn-sm flex gap-1 items-center ${
                  bannerUrl
                    ? "btn-outline border-base-100/70 text-base-100 hover:bg-base-100/15 hover:text-base-100"
                    : "btn-ghost"
                }`}
                onClick={() => setShowSettings(true)}
                aria-haspopup="dialog"
                aria-expanded={showSettings}
              >
                <Gear size={20} weight="bold" />
                <span>Customize</span>
              </button>

              <button
                className={`btn btn-sm ${
                  bannerUrl
                    ? "btn-outline border-base-100/70 text-base-100 hover:bg-base-100/15 hover:text-base-100"
                    : ""
                }`}
                onClick={prev}
                aria-label="previous month"
                disabled={month <= 1}
              >
                Prev
              </button>
              <button
                className={`btn btn-sm ${
                  bannerUrl
                    ? "btn-outline border-base-100/70 text-base-100 hover:bg-base-100/15 hover:text-base-100"
                    : ""
                }`}
                onClick={next}
                aria-label="next month"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {hideHeader && showCompactTitle && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-lg font-semibold text-base-content/90">
            {title}
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
                    onClick={() => openDayModal(cell)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openDayModal(cell);
                      }
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
      <DayDetailModal
        open={modalOpen}
        onClose={closeDayModal}
        selectedDay={selectedDay}
        detailState={detailState}
      />
    </div>
  );
}

function DayDetailModal({ open, onClose, selectedDay, detailState }) {
  if (!open || !selectedDay) return null;

  const { cell, bsDate, adDate } = selectedDay;

  const bsLabelNp = bsDate?.format ? bsDate.format("YYYY MMMM D", "np") : "";
  const bsLabelEn = bsDate?.format ? bsDate.format("YYYY MMMM D", "en") : "";
  const adFull = adDate
    ? adDate.toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const adShort = adDate
    ? adDate.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const tithiLabel = cell?.t || cell?.Tithi || "-";
  const nakshatraLabel = cell?.Nakshatra || cell?.nakshatra || "-";
  const rasiLabel = cell?.Rasi || cell?.rasi || "-";
  const festivalText = cell?.f && String(cell.f).trim() ? cell.f : null;
  const noteText = cell?.notes && String(cell.notes).trim() ? cell.notes : null;

  const {
    loading,
    error,
    panchang,
    sunData,
    daySegments,
    nightSegments,
    sunrise,
    sunset,
    choghadiyaError,
  } = detailState || {};

  const formatTime = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(value);
    }
  };

  const panchangRows = [
    {
      label: "Masa",
      value: panchang?.Masa?.name_en_IN || panchang?.Masa?.name_np || "-",
    },
    {
      label: "Paksha",
      value: panchang?.Paksha?.name_en_IN
        ? `${panchang.Paksha.name_en_IN} Paksha`
        : "-",
    },
    {
      label: "Tithi",
      value: panchang?.Tithi?.name_en_IN || tithiLabel || "-",
    },
    {
      label: "Nakshatra",
      value: panchang?.Nakshatra?.name_en_IN || nakshatraLabel || "-",
    },
    {
      label: "Rasi",
      value: panchang?.Raasi?.name_en_UK || rasiLabel || "-",
    },
    {
      label: "Yoga",
      value: panchang?.Yoga?.name_en_IN || "-",
    },
    {
      label: "Karna",
      value: panchang?.Karna?.name_en_IN || "-",
    },
  ];

  const sunRows = [
    {
      label: "Sunrise",
      value: sunData?.sunRise ? formatTime(sunData.sunRise) : sunrise || "-",
    },
    {
      label: "Sunset",
      value: sunData?.sunSet ? formatTime(sunData.sunSet) : sunset || "-",
    },
    {
      label: "Solar Noon",
      value: sunData?.solarNoon ? formatTime(sunData.solarNoon) : "-",
    },
    {
      label: "Moonrise",
      value: sunData?.moonRise ? formatTime(sunData.moonRise) : "-",
    },
    {
      label: "Moonset",
      value: sunData?.moonSet ? formatTime(sunData.moonSet) : "-",
    },
  ];

  const renderChoghadiyaSection = (title, segments) => (
    <div className="space-y-3">
      <h4 className="text-base font-semibold text-base-content">{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {segments.map((seg, idx) => (
          <div
            key={`${title}-${idx}`}
            className={`rounded-xl border border-base-300 p-3 flex flex-col gap-1 ${getChoghadiyaClass(seg.name)}`}
          >
            <div className="text-xs font-semibold uppercase tracking-wide">
              Slot {idx + 1}
            </div>
            <div className="text-sm font-bold">
              {seg.start} - {seg.end}
            </div>
            <div className="text-sm">{seg.name || "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div
        className="absolute inset-0 bg-base-900/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-base-100 border border-base-300 rounded-3xl shadow-2xl p-6 space-y-6"
        role="dialog"
        aria-modal="true"
        aria-label="Day details"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-base-500">{adFull}</p>
            <h2 className="text-2xl font-semibold text-base-content">
              {bsLabelNp || tithiLabel || "Selected Day"}
            </h2>
            <p className="text-sm text-base-500">{bsLabelEn}</p>
            <p className="text-sm text-base-500">{adShort}</p>
            {festivalText ? (
              <div className="mt-2 rounded-2xl bg-primary/10 border border-primary/30 px-3 py-2 text-sm text-primary/90">
                <span className="font-semibold mr-1">Festival:</span>
                {festivalText}
              </div>
            ) : null}
            {noteText ? (
              <div className="mt-2 rounded-2xl bg-warning/10 border border-warning/40 px-3 py-2 text-sm text-warning-700">
                <span className="font-semibold mr-1">Notes:</span>
                {noteText}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close day details"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {loading ? (
          <div className="py-10 flex items-center justify-center">
            <div
              className="loading loading-spinner loading-lg text-primary"
              aria-label="Loading details"
            ></div>
          </div>
        ) : (
          <div className="space-y-6">
            {error ? (
              <div className="alert alert-error text-sm">
                <span>{error}</span>
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-5 space-y-3">
                <h3 className="text-lg font-semibold text-base-content">
                  Panchang Summary
                </h3>
                <table className="table table-sm">
                  <tbody>
                    {panchangRows.map((row) => (
                      <tr key={row.label}>
                        <td className="font-medium text-sm text-base-content/80">
                          {row.label}
                        </td>
                        <td className="text-sm text-base-content">
                          {row.value || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-5 space-y-3">
                <h3 className="text-lg font-semibold text-base-content">
                  Sun & Moon Timings
                </h3>
                <table className="table table-sm">
                  <tbody>
                    {sunRows.map((row) => (
                      <tr key={row.label}>
                        <td className="font-medium text-sm text-base-content/80">
                          {row.label}
                        </td>
                        <td className="text-sm text-base-content">
                          {row.value || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sunrise && sunset ? (
                  <p className="text-xs text-base-500">
                    * Sunrise/Sunset from sunrise-sunset.io ({sunrise} /{" "}
                    {sunset})
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-base-content">
                  चौघडिया (Choghadiya)
                </h3>
                {choghadiyaError ? (
                  <span className="text-xs text-warning-600">
                    {choghadiyaError}
                  </span>
                ) : null}
              </div>
              <div className="space-y-6">
                {daySegments && daySegments.length > 0
                  ? renderChoghadiyaSection("Day", daySegments)
                  : null}
                {nightSegments && nightSegments.length > 0
                  ? renderChoghadiyaSection("Night", nightSegments)
                  : null}
              </div>
            </div>
          </div>
        )}
      </div>
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
    <section
      className={`flex gap-2 items-start mt-6 space-y-6 ${isCompact ? "" : "min-w-[56rem]"}`}
    >
      {hasFestivals && (
        <div className="bg-base-100/50 shadow-inner space-y-3">
          <h3 className="text-lg font-semibold text-base-content text-left">
            {monthLabel
              ? `${monthLabel} को विदा तथा पर्वहरु`
              : "विदा तथा पर्वहरु"}
          </h3>
          <ul className="space-y-1.5 text-md leading-relaxed text-base-700">
            {festivals.map((item, idx) => (
              <li key={`${item.day}-${idx}`} className="flex gap-2 m-1 ">
                <span className="font-semibold bg-blue-600 rounded-full text-white px-1">
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
