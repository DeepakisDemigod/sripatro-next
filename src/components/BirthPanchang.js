"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import domtoimage from "dom-to-image";
import { MhahPanchang } from "mhah-panchang";
import NepaliDate from "nepali-date-converter";
import {
  Alarm,
  Calendar,
  CaretLeft,
  ArrowSquareOut,
  X,
  ShareNetwork,
  Trash,
} from "phosphor-react";
import nakshatraData from "./nakshatraData.json"; // keep your file
import { useTranslations } from "next-intl";

const BS_MONTHS_NEPALI = [
  "बैशाख",
  "जेठ",
  "असार",
  "साउन",
  "भदौ",
  "असोज",
  "कार्तिक",
  "मंसिर",
  "पुष",
  "माघ",
  "फागुन",
  "चैत्र",
];

const BS_MONTHS_EN = [
  "Baisakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Paush",
  "Magh",
  "Falgun",
  "Chaitra",
];

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const BirthPanchangUnified = ({
  initialLoadEntry = null,
  embedded = false,
  onClose = null,
  autoShareOnce = false,
  onShared = null,
}) => {
  const t = useTranslations();
  useEffect(() => {
    document.title = "Birth Panchang | Sri Patro";
  }, []);

  // Mode: AD_TO_BS or BS_TO_AD
  const [mode, setMode] = useState("AD_TO_BS");

  // ---------- AD form (3 selects) ----------
  const now = new Date();
  const initYear = now.getFullYear();
  const initMonth = now.getMonth() + 1; // 1-12
  const initDay = now.getDate();

  const [adDay, setAdDay] = useState(String(initDay).padStart(2, "0"));
  const [adMonth, setAdMonth] = useState(String(initMonth).padStart(2, "0"));
  const [adYear, setAdYear] = useState(String(initYear));

  // ---------- BS form ----------
  const todayInBS = useMemo(() => new NepaliDate(), []);
  const [bsYear, setBsYear] = useState(todayInBS.getYear());
  const [bsMonth, setBsMonth] = useState(todayInBS.getMonth() + 1);
  const [bsDay, setBsDay] = useState(todayInBS.getDate());

  // ---------- shared ----------
  const [timeOfBirth, setTimeOfBirth] = useState(() => {
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  });

  const [panchang, setPanchang] = useState(null);
  const [englishDate, setEnglishDate] = useState(""); // AD formatted
  const [bsConvertedDate, setBsConvertedDate] = useState(null); // used in AD->BS to show converted BS
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [age, setAge] = useState(null);
  const [nakshatraInfo, setNakshatraInfo] = useState(null);
  const [sunData, setSunData] = useState(null);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [history, setHistory] = useState([]);
  const reportRef = useRef(null);
  const [pendingScroll, setPendingScroll] = useState(false);
  const [flash, setFlash] = useState(false);
  const flashTimerRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const autoSharedRef = useRef(false);
  const [shouldComputeFromInitial, setShouldComputeFromInitial] =
    useState(false);

  const HISTORY_KEY = "birth_panchang_history";

  const loadHistory = () => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem(HISTORY_KEY)
          : null;
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

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // If an initial saved entry is provided (e.g., opened from Daily Panchang), load it
  useEffect(() => {
    if (!initialLoadEntry) return;
    const h = initialLoadEntry;
    if (h.mode === "AD_TO_BS") {
      setMode("AD_TO_BS");
      if (h.input?.adYear) setAdYear(String(h.input.adYear));
      if (h.input?.adMonth)
        setAdMonth(String(h.input.adMonth).padStart(2, "0"));
      if (h.input?.adDay) setAdDay(String(h.input.adDay).padStart(2, "0"));
    } else {
      setMode("BS_TO_AD");
      if (h.input?.bsYear) setBsYear(Number(h.input.bsYear));
      if (h.input?.bsMonth) setBsMonth(Number(h.input.bsMonth));
      if (h.input?.bsDay) setBsDay(Number(h.input.bsDay));
    }
    if (h.timeOfBirth) setTimeOfBirth(h.timeOfBirth);
    setUserName(h.name || "");
    // Defer calculation until state is applied
    setShouldComputeFromInitial(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoadEntry]);

  // Run calculation once after state updates from initialLoadEntry
  useEffect(() => {
    if (!shouldComputeFromInitial) return;
    handleCalculate(undefined, { skipSave: true });
    setPendingScroll(true);
    setShouldComputeFromInitial(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    shouldComputeFromInitial,
    mode,
    adYear,
    adMonth,
    adDay,
    bsYear,
    bsMonth,
    bsDay,
    timeOfBirth,
  ]);

  useEffect(() => {
    if (pendingScroll && panchang) {
      // Scroll to report section smoothly after result is rendered
      reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setPendingScroll(false);
      // Briefly highlight the section so it's easy to spot
      setFlash(true);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => setFlash(false), 1000);
    }
  }, [pendingScroll, panchang]);

  // Auto-share once when requested and report is ready
  useEffect(() => {
    if (!autoShareOnce || !panchang || autoSharedRef.current) return;
    autoSharedRef.current = true;
    shareCurrentReportAsImage()
      .catch(() => {})
      .finally(() => {
        if (onShared) onShared();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoShareOnce, panchang]);

  useEffect(
    () => () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    },
    []
  );

  const shareCurrentReportAsImage = async () => {
    if (!panchang || !reportRef.current || capturing) return;
    try {
      setCapturing(true);
      // Wait for watermark overlay to mount and paint
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r))
      );
      const node = reportRef.current;
      const blob = await domtoimage.toBlob(node, {
        bgcolor: "transparent",
        cacheBust: true,
      });
      const filename = `birth-panchang-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.png`;
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Birth Panchang" });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("share image error", err);
    } finally {
      setCapturing(false);
    }
  };

  const addHistoryEntry = (entry) => {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 50);
      saveHistory(next);
      return next;
    });
  };

  // avatar helpers
  const avatarForName = (name) => {
    const n = (name || "Unnamed").trim();
    const initial = n ? n[0].toUpperCase() : "U";
    const palette = [
      "#f97316", // orange-500
      "#ef4444", // red-500
      "#8b5cf6", // violet-500
      "#06b6d4", // cyan-500
      "#22c55e", // green-500
      "#eab308", // yellow-500
      "#ec4899", // pink-500
      "#0ea5e9", // sky-500
    ];
    let hash = 0;
    for (let i = 0; i < n.length; i++)
      hash = (hash * 31 + n.charCodeAt(i)) >>> 0;
    const color = palette[hash % palette.length];
    return { initial, color };
  };

  const deleteHistoryEntry = (id) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveHistory(next);
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  // helper: days in AD month
  const daysInMonthAD = (y, m) => new Date(Number(y), Number(m), 0).getDate();

  // keep adDay valid when adMonth/adYear changes
  useEffect(() => {
    const maxD = daysInMonthAD(adYear, adMonth);
    if (Number(adDay) > maxD) setAdDay(String(maxD).padStart(2, "0"));
  }, [adMonth, adYear]); // eslint-disable-line

  // helper: max days in BS month using NepaliDate#getLastDateOfMonth
  const getMaxDaysBS = (y, m) => {
    try {
      return new NepaliDate(Number(y), Number(m) - 1, 1).getLastDateOfMonth();
    } catch {
      return 32;
    }
  };

  useEffect(() => {
    const maxD = getMaxDaysBS(bsYear, bsMonth);
    if (Number(bsDay) > maxD) setBsDay(maxD);
  }, [bsYear, bsMonth]); // eslint-disable-line

  // years list for AD selects (1900 -> current)
  const currentYear = new Date().getFullYear();
  const yearsAD = Array.from(
    { length: currentYear - 1899 },
    (_, i) => 1900 + i
  ).reverse();

  // years list for BS input - keep a reasonable range
  const yearsBS = Array.from({ length: 300 }, (_, i) => 2000 + i - 100); // 1900-2099 roughly

  const calculateAge = (dateOfBirth) => {
    const nowDt = new Date();
    const dob = new Date(dateOfBirth);
    let years = nowDt.getFullYear() - dob.getFullYear();
    let months = nowDt.getMonth() - dob.getMonth();
    if (nowDt.getDate() < dob.getDate()) months -= 1;
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return { years, months };
  };

  const formatTimeWithPeriod = (timeStr) => {
    const [hourStr, minute] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const suffix = hour >= 12 ? "pm" : "am";
    let periodKey = "";
    if (hour < 4) periodKey = "Night";
    else if (hour < 12) periodKey = "Morning";
    else if (hour < 16) periodKey = "Afternoon";
    else if (hour < 20) periodKey = "Evening";
    else periodKey = "Night";

    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;

    const translatedPeriod = t ? t(`timePeriod.${periodKey}`) : periodKey;
    return `${translatedPeriod}, ${String(hour).padStart(2, "0")}:${minute}${suffix}`;
  };

  // MAIN unified calc
  const handleCalculate = async (e, opts = {}) => {
    if (e && e.preventDefault) e.preventDefault();
    const skipSave = !!opts.skipSave;
    setError("");
    setPanchang(null);
    setNakshatraInfo(null);
    setSunData(null);
    setBsConvertedDate(null);
    try {
      let adDate;
      let bsConvertedLocal = null;

      if (mode === "AD_TO_BS") {
        // build ad date from selects
        const iso = `${adYear}-${String(adMonth).padStart(2, "0")}-${String(adDay).padStart(2, "0")}`;
        adDate = new Date(`${iso}T${timeOfBirth}`);
        if (isNaN(adDate.getTime())) throw new Error("Invalid AD date");
        // convert to BS for display
        try {
          const bs = NepaliDate.fromAD(adDate);
          bsConvertedLocal = {
            year: bs.getYear(),
            month: bs.getMonth(),
            day: bs.getDate(),
          };
          setBsConvertedDate(bsConvertedLocal);
        } catch {
          bsConvertedLocal = null;
          setBsConvertedDate(null);
        }
      } else {
        // BS_TO_AD
        // Build NepaliDate then convert to JS Date
        if (!bsYear || !bsMonth || !bsDay) throw new Error("Invalid BS date");
        const bsObj = new NepaliDate(
          Number(bsYear),
          Number(bsMonth) - 1,
          Number(bsDay)
        );
        adDate = bsObj.toJsDate ? bsObj.toJsDate() : bsObj.toJsDate(); // keep compatibility
        if (!adDate || isNaN(adDate.getTime()))
          throw new Error("Converted AD invalid");
        // attach time
        const [hh, mm] = timeOfBirth.split(":").map(Number);
        adDate.setHours(hh, mm);
      }

      // Ensure time is applied (AD_TO_BS path might not have time applied if used Date constructor above)
      if (!(adDate instanceof Date)) adDate = new Date(adDate);
      if (isNaN(adDate.getTime())) throw new Error("Invalid final AD date");

      // fetch sunrise/sunset for this adDate
      try {
        const yyyy = adDate.getFullYear();
        const mm = String(adDate.getMonth() + 1).padStart(2, "0");
        const dd = String(adDate.getDate()).padStart(2, "0");
        const dateParam = `${yyyy}-${mm}-${dd}`;
        const res = await fetch(
          `https://api.sunrisesunset.io/json?lat=28.7041&lng=77.1025&date=${dateParam}`
        );
        if (res.ok) {
          const j = await res.json();
          setSunData(j.results);
        } else {
          setSunData(null);
        }
      } catch {
        setSunData(null);
      }

      // Panchang calculation
      const panchangObj = new MhahPanchang();
      const result = panchangObj.calculate(adDate);
      setPanchang(result);

      // english date string
      const englishStr = adDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setEnglishDate(englishStr);
      setDayOfWeek(DAYS_EN[adDate.getDay()]);

      // age
      setAge(calculateAge(adDate));

      // nakshatra lookup
      const nakName = result?.Nakshatra?.name_en_IN;
      if (nakName) {
        const found = nakshatraData.find((n) => n.name === nakName);
        setNakshatraInfo(found || null);
      } else {
        setNakshatraInfo(null);
      }

      // Save to local history
      if (!skipSave) {
        const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const payload = {
          id,
          name: userName || "",
          generatedAt: new Date().toISOString(),
          mode,
          adDateISO: adDate.toISOString(),
          englishDate: englishStr,
          timeOfBirth,
          dayOfWeek: DAYS_EN[adDate.getDay()],
          input:
            mode === "AD_TO_BS"
              ? { adYear, adMonth, adDay }
              : { bsYear, bsMonth, bsDay },
          bsDate:
            mode === "AD_TO_BS" && bsConvertedLocal
              ? {
                  year: bsConvertedLocal.year,
                  month: bsConvertedLocal.month,
                  day: bsConvertedLocal.day,
                }
              : mode === "BS_TO_AD"
                ? { year: bsYear, month: bsMonth, day: bsDay }
                : null,
          summary: {
            tithi: result?.Tithi?.name_en_IN || null,
            paksha: result?.Paksha?.name_en_IN || null,
            nakshatra: result?.Nakshatra?.name_en_IN || null,
            raasi: result?.Raasi?.name_en_UK || null,
          },
        };
        addHistoryEntry(payload);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid input");
    }
  };

  return (
    <div
      className={
        embedded
          ? "w-full max-w-5xl"
          : "min-h-screen bg-base-100 flex items-start justify-center py-8"
      }
    >
      <div className={embedded ? "w-full p-0" : "w-full max-w-5xl p-5"}>
        <div className="bg-base-100/80  backdrop-blur-sm rounded-2xl shadow-2xl p-6 grid md:grid-cols-2 gap-6 transition-all">
          <div>
            {embedded ? (
              <div className="flex justify-end mb-3">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  aria-label="Close"
                  onClick={() => onClose && onClose()}
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <a
                href="/"
                className="inline-flex items-center gap-2 text-sm text-base-700 hover:underline mb-3"
              >
                <CaretLeft size={18} /> <span>{t("Back")}</span>
              </a>
            )}

            <a href="/date-converter" className="block mb-4">
              <div className="rounded-xl p-4 border border-base-300 shadow-sm hover:shadow-md transition flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span>{t("Date Converter")}</span>
                    <ArrowSquareOut size={18} />
                  </h3>
                  <p className="text-xs text-base-500">
                    {t("change_nepali_to_indian_and_back")}
                  </p>
                </div>
                <div className="text-sm font-bold">
                  <span className="text-2xl mr-2">🇳🇵</span> ⇄{" "}
                  <span className="text-2xl ml-2 mr-2">🇬🇧</span>
                </div>
              </div>
            </a>

            <h1 className="text-2xl font-bold mb-4 text-base-800">
              {t("Ishwi Sambat to Panchang")}
            </h1>

            {/* Mode toggle */}
            <div className="mb-4 flex items-center gap-4">
              <label className="bg-base-100 border border-base-300 rounded-full px-2 inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="AD_TO_BS"
                  checked={mode === "AD_TO_BS"}
                  onChange={() => setMode("AD_TO_BS")}
                />
                <span className="ml-1 text-2xl">🇬🇧</span>
              </label>
              <label className="bg-base-100 border border-base-300 rounded-full px-2  inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="BS_TO_AD"
                  checked={mode === "BS_TO_AD"}
                  onChange={() => setMode("BS_TO_AD")}
                />
                <span className="ml-1 text-2xl">🇳🇵</span>
              </label>
            </div>

            <form onSubmit={handleCalculate} className="space-y-5">
              {mode === "AD_TO_BS" ? (
                <>
                  <label className="flex items-center gap-2 text-sm font-medium text-base-700 mb-2">
                    <Calendar size={18} />
                    <span>{t("Date of Birth (English)")}</span>
                  </label>

                  <div className="flex gap-3">
                    {/* Day */}
                    <div className="flex-1">
                      <select
                        aria-label="Day"
                        value={adDay}
                        onChange={(e) => setAdDay(e.target.value)}
                        className="w-full text-center py-3 rounded-xl border border-base-300 bg-base-100 shadow-sm focus:ring-2 focus:ring-red-300 transition"
                      >
                        {Array.from(
                          { length: daysInMonthAD(adYear, adMonth) },
                          (_, i) => {
                            const d = i + 1;
                            const ds = String(d).padStart(2, "0");
                            return (
                              <option key={ds} value={ds}>
                                {ds}
                              </option>
                            );
                          }
                        )}
                      </select>
                      <div className="text-xs text-center mt-1 text-base-400">
                        {t("Day")}
                      </div>
                    </div>

                    {/* Month */}
                    <div className="flex-1">
                      <select
                        aria-label="Month"
                        value={String(Number(adMonth)).padStart(2, "0")}
                        onChange={(e) => setAdMonth(e.target.value)}
                        className="w-full text-center py-3 rounded-xl border border-base-300 bg-base-100  shadow-sm focus:ring-2 focus:ring-red-300 transition"
                      >
                        {MONTHS_EN.map((mName, idx) => {
                          const m = String(idx + 1).padStart(2, "0");
                          return (
                            <option key={m} value={m}>
                              {t(`month.${mName}`)}
                            </option>
                          );
                        })}
                      </select>
                      <div className="text-xs text-center mt-1 text-base-400">
                        {t("Month")}
                      </div>
                    </div>

                    {/* Year */}
                    <div className="flex-1">
                      <select
                        aria-label="Year"
                        value={adYear}
                        onChange={(e) => setAdYear(e.target.value)}
                        className="w-full text-center py-3 rounded-xl border border-base-300 bg-base-100 shadow-sm focus:ring-2 focus:ring-red-300 transition"
                      >
                        {yearsAD.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                      <div className="text-xs text-center mt-1 text-base-400">
                        {t("Year")}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <label className="flex items-center gap-2 text-sm font-medium text-base-700 mb-2">
                    <Calendar size={18} />
                    <span>{t("Date of Birth (Nepali)")}</span>
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="number"
                      name="bsYear"
                      value={bsYear}
                      onChange={(e) => setBsYear(Number(e.target.value))}
                      min="1900"
                      max="2099"
                      placeholder="Year"
                      className=" bg-base-100 w-full px-4 py-2 border border-base-300 rounded-xl focus:ring-2 focus:ring-red-500"
                    />
                    <select
                      name="bsMonth"
                      value={bsMonth}
                      onChange={(e) => setBsMonth(Number(e.target.value))}
                      className=" bg-base-100 w-full px-3 py-2 border border-base-300 rounded-xl focus:ring-2 focus:ring-red-500"
                    >
                      {BS_MONTHS_EN.map((m, idx) => (
                        <option key={m} value={idx + 1}>
                          {t(`nepaliMonth.${m}`) || BS_MONTHS_NEPALI[idx]}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      name="bsDay"
                      value={bsDay}
                      onChange={(e) => setBsDay(Number(e.target.value))}
                      min="1"
                      max={getMaxDaysBS(bsYear, bsMonth)}
                      placeholder="Day"
                      className=" bg-base-100 w-full px-4 py-2 border border-base-300 rounded-xl focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="time"
                  className="flex items-center gap-2 text-sm font-medium text-base-600 mb-2"
                >
                  <Alarm size={18} />
                  <span>{t("Time of Birth")}</span>
                </label>
                <input
                  id="time"
                  type="time"
                  value={timeOfBirth}
                  onChange={(e) => setTimeOfBirth(e.target.value)}
                  required
                  className="w-full py-3 px-4 rounded-xl border border-base-300 bg-base-100 shadow-sm focus:ring-2 focus:ring-red-300 transition"
                />
                <span className="text-xs text-base-400 mt-1 block">
                  {t("your time of birth hh:mm in 24hrs format")}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-base-600 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full py-3 px-4 rounded-xl border border-base-300 bg-base-100 shadow-sm focus:ring-2 focus:ring-red-300 transition"
                />
                <span className="text-xs text-base-400 mt-1 block">
                  Saved with your generated panchang in this browser.
                </span>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-red-700 shadow-md hover:opacity-95 transition"
                >
                  {t("Get Panchang")}
                </button>
              </div>
            </form>
          </div>

          {/* Right column: results */}
          <div
            className={`transition-colors duration-700 ${flash ? "ring-2 ring-amber-400 ring-offset-2 bg-amber-50 rounded-xl" : ""}`}
          >
            {error && (
              <div className="mb-3 text-red-600 font-medium">{error}</div>
            )}

            {!panchang ? (
              <div className="rounded-xl p-4 bg-base-100/60 shadow-sm border border-base-300 text-base-600">
                {t("Enter your details to get your birth Panchang")}
              </div>
            ) : (
              <>
                <div ref={reportRef} className="relative">
                  {capturing && (
                    <div
                      className="absolute inset-0 pointer-events-none select-none z-10"
                      style={{
                        backgroundImage: "url(/logo-with-name.png)",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "min(90%, 520px)",
                        opacity: 0.18,
                      }}
                      aria-hidden="true"
                    />
                  )}
                  <div className="mb-4 rounded-xl p-4 bg-base-100 shadow-sm border border-base-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-sm font-bold text-base-800">
                          {t(`day.${panchang?.Day?.name_en_UK}`)}
                          {", "}
                          {englishDate}
                        </h2>
                        <p className="text-xs text-base-600 font-medium">
                          {formatTimeWithPeriod(timeOfBirth)}
                        </p>

                        {/* show converted BS when AD_TO_BS */}
                        {mode === "AD_TO_BS" && bsConvertedDate && (
                          <div className="mt-2 text-sm font-semibold text-base-600">
                            {bsConvertedDate.year}{" "}
                            {BS_MONTHS_NEPALI[bsConvertedDate.month]}{" "}
                            {bsConvertedDate.day}
                          </div>
                        )}

                        {/* show original BS input when BS_TO_AD */}
                        {mode === "BS_TO_AD" && (
                          <div className="mt-2 text-sm font-semibold text-base-600">
                            {bsYear} {BS_MONTHS_NEPALI[bsMonth - 1]} {bsDay}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center shadow">
                          <img
                            alt="moon"
                            className="rounded-full"
                            width="48"
                            src={
                              panchang?.Paksha?.name_en_IN === "Shukla"
                                ? `/moon/Shukla/${panchang?.Tithi?.name_en_IN}.png`
                                : `/moon/Krishna/${panchang?.Tithi?.name_en_IN}.png`
                            }
                          />
                        </div>
                        <p className="text-xs mt-2 font-bold">
                          {t(`tithi.${panchang?.Tithi?.name_en_IN}`)},{" "}
                          {t(`paksha.${panchang?.Paksha?.name_en_IN}`)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-base-100 rounded-xl p-3 shadow-sm border border-base-300 overflow-auto">
                    <table className="table-auto w-full text-sm">
                      <tbody>
                        <tr className="border-b border-base-300">
                          <th className="text-left py-2 pr-4">{t("Day")}</th>
                          <td className="py-2">
                            {t(`day.${panchang?.Day?.name_en_UK}`) ||
                              "Not Available"}
                          </td>
                        </tr>

                        <tr className="border-b border-base-300">
                          <th className="text-left py-2 pr-4">{t("Paksh")}</th>
                          <td className="py-2">
                            {t(`paksha.${panchang?.Paksha?.name_en_IN}`) ||
                              "Not Available"}
                          </td>
                        </tr>

                        <tr className="border-b border-base-300">
                          <th className="text-left py-2 pr-4">{t("Tithi")}</th>
                          <td className="py-2 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
                              <img
                                alt="tithi"
                                width="24"
                                src={
                                  panchang?.Paksha?.name_en_IN === "Shukla"
                                    ? `/moon/Shukla/${panchang?.Tithi?.name_en_IN}.png`
                                    : `/moon/Krishna/${panchang?.Tithi?.name_en_IN}.png`
                                }
                              />
                            </div>
                            <div>
                              {t(`tithi.${panchang?.Tithi?.name_en_IN}`) ||
                                "Not Available"}
                            </div>
                          </td>
                        </tr>

                        <tr className="border-b border-base-300">
                          <th className="text-left py-2 pr-4">
                            {t("Nakshatra")}
                          </th>
                          <td className="py-2">
                            {t(
                              `nakshatra.${panchang?.Nakshatra?.name_en_IN}`
                            ) || "Not Available"}
                          </td>
                        </tr>

                        <tr className="border-b border-base-300">
                          <th className="text-left py-2 pr-4">{t("Rasi")}</th>
                          <td className="py-2">
                            {t(`rasi.${panchang?.Raasi?.name_en_UK}`) ||
                              "Not Available"}
                          </td>
                        </tr>

                        {nakshatraInfo && (
                          <>
                            <tr className="border-b border-base-300">
                              <th className="text-left py-2 pr-4">
                                {t("Syllables")}
                              </th>
                              <td className="py-2">
                                {t(
                                  `syllables.${nakshatraInfo["first syllables"]}`
                                ) || "Not Available"}
                              </td>
                            </tr>
                            <tr className="border-b border-base-300">
                              <th className="text-left py-2 pr-4">
                                {t("Gan")}
                              </th>
                              <td className="py-2">
                                {t(`ganam.${nakshatraInfo.ganam}`) ||
                                  "Not Available"}
                              </td>
                            </tr>
                            <tr className="border-b border-base-300">
                              <th className="text-left py-2 pr-4">
                                {t("Animal Sign")}
                              </th>
                              <td className="py-2">
                                {t(`animal.${nakshatraInfo["animal sign"]}`) ||
                                  "Not Available"}
                              </td>
                            </tr>
                            <tr className="border-b border-base-300">
                              <th className="text-left py-2 pr-4">
                                {t("Deity")}
                              </th>
                              <td className="py-2">
                                {t(`deity.${nakshatraInfo.Diety}`) ||
                                  "Not Available"}
                              </td>
                            </tr>
                            <tr className="border-b border-base-300">
                              <th className="text-left py-2 pr-4">
                                {t("Best Direction")}
                              </th>
                              <td className="py-2">
                                {t(
                                  `best_direction.${nakshatraInfo["best direction"]}`
                                ) || "Not Available"}
                              </td>
                            </tr>
                          </>
                        )}

                        <tr className="border-b border-base-300">
                          <th className="text-left py-2 pr-4">{t("Yoga")}</th>
                          <td className="py-2">
                            {t(`yoga.${panchang?.Yoga?.name_en_IN}`) ||
                              "Not Available"}
                          </td>
                        </tr>

                        <tr className="border-b border-base-300">
                          <th className="text-left py-2 pr-4">{t("Karna")}</th>
                          <td className="py-2">
                            {t(`karna.${panchang?.Karna?.name_en_IN}`) ||
                              "Not Available"}
                          </td>
                        </tr>

                        <tr className="border-b border-base-300">
                          <th className="text-left py-2 pr-4">
                            {t("Sunrise")}
                          </th>
                          <td className="py-2">
                            {t("timePeriod.Morning")}{" "}
                            {sunData?.sunrise || "Unknown"}
                          </td>
                        </tr>

                        <tr className="border-b border-base-300">
                          <th className="text-left py-2 pr-4">{t("Sunset")}</th>
                          <td className="py-2">
                            {t("timePeriod.Evening")}{" "}
                            {sunData?.sunset || "Unknown"}
                          </td>
                        </tr>

                        {age && (
                          <tr>
                            <th className="text-left py-2 pr-4">{t("Age")}</th>
                            <td className="py-2">
                              {age.years} {t("years and")} {age.months}{" "}
                              {t("months")}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* History: hide when embedded in modal */}
            {!embedded && (
              <div className="mt-4 rounded-xl p-4 bg-base-100 border border-base-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-base-800">
                    Saved Panchangs
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn btn-xs gap-1"
                      onClick={shareCurrentReportAsImage}
                      disabled={!panchang || capturing}
                      title="Share current report as image"
                    >
                      {capturing ? (
                        ""
                      ) : (
                        <>
                          <ShareNetwork size={14} />
                          <span className="hidden sm:inline sm:ml-1">
                            Share PNG
                          </span>
                        </>
                      )}
                    </button>
                    {history.length > 0 && (
                      <button
                        className="btn btn-xs gap-1"
                        onClick={clearHistory}
                        title="Clear all"
                      >
                        <Trash size={14} />
                        <span className="hidden sm:inline sm:ml-1">
                          Clear All
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                {history.length === 0 ? (
                  <div className="text-xs text-base-500">
                    No saved panchangs yet. Generate one to save.
                  </div>
                ) : (
                  <ul className="space-y-2 max-h-72 overflow-auto pr-1">
                    {history.map((h) => {
                      const created = new Date(h.generatedAt);
                      const when = created.toLocaleString();
                      const label = h.name || "Unnamed";
                      const dob = h.englishDate || h.adDateISO?.slice(0, 10);
                      const av = avatarForName(label);
                      return (
                        <li
                          key={h.id}
                          className="border border-base-300 rounded-lg p-2 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: av.color }}
                              aria-hidden="true"
                              title={label}
                            >
                              {av.initial}
                            </div>
                            <div className="text-xs">
                              <div className="font-semibold text-base-700">
                                {label}
                              </div>
                              <div className="text-base-600">
                                {dob} · {h.timeOfBirth} ·{" "}
                                {h.mode === "AD_TO_BS" ? "AD→BS" : "BS→AD"}
                              </div>
                              <div className="text-base-400">Saved: {when}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-xs"
                              onClick={() => {
                                // load inputs and re-calc
                                if (h.mode === "AD_TO_BS") {
                                  setMode("AD_TO_BS");
                                  if (h.input?.adYear)
                                    setAdYear(String(h.input.adYear));
                                  if (h.input?.adMonth)
                                    setAdMonth(
                                      String(h.input.adMonth).padStart(2, "0")
                                    );
                                  if (h.input?.adDay)
                                    setAdDay(
                                      String(h.input.adDay).padStart(2, "0")
                                    );
                                } else {
                                  setMode("BS_TO_AD");
                                  if (h.input?.bsYear)
                                    setBsYear(Number(h.input.bsYear));
                                  if (h.input?.bsMonth)
                                    setBsMonth(Number(h.input.bsMonth));
                                  if (h.input?.bsDay)
                                    setBsDay(Number(h.input.bsDay));
                                }
                                if (h.timeOfBirth)
                                  setTimeOfBirth(h.timeOfBirth);
                                setUserName(h.name || "");
                                setTimeout(() => {
                                  handleCalculate(undefined, {
                                    skipSave: true,
                                  });
                                }, 0);
                              }}
                            >
                              Load
                            </button>
                            <button
                              className="btn btn-xs"
                              onClick={() => deleteHistoryEntry(h.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthPanchangUnified;
