"use client";

import React, { useEffect, useState } from "react";
// Choghadiya data and helpers (from CalendarMulti.js)
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
    .padStart(2, "0")}`;
}

function getCurrentChoghadiya(now, sunrise, sunset) {
  // sunrise/sunset: "hh:mm:ss AM/PM"
  const dayIndex = now.getDay();
  const nowSec =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const sunriseSec = timeToSeconds(sunrise);
  const sunsetSec = timeToSeconds(sunset);
  let segments, names, isDay;
  if (nowSec >= sunriseSec && nowSec < sunsetSec) {
    // Day choghadiya
    isDay = true;
    const duration = sunsetSec - sunriseSec;
    const segDur = duration / 8;
    segments = Array.from({ length: 8 }).map((_, i) => [
      sunriseSec + i * segDur,
      sunriseSec + (i + 1) * segDur,
    ]);
    names = choghadiyaData.day[dayIndex];
  } else {
    // Night choghadiya
    isDay = false;
    // Night: from sunset to next day's sunrise
    const nextSunriseSec = sunriseSec + 24 * 3600;
    const duration = nextSunriseSec - sunsetSec;
    const segDur = duration / 8;
    segments = Array.from({ length: 8 }).map((_, i) => [
      sunsetSec + i * segDur,
      sunsetSec + (i + 1) * segDur,
    ]);
    names = choghadiyaData.night[dayIndex];
  }
  for (let i = 0; i < 8; ++i) {
    const [start, end] = segments[i];
    if (nowSec >= start && nowSec < end) {
      return {
        slot: `${secondsTo12HrTime(start)}–${secondsTo12HrTime(end)}`,
        name: names[i],
        isDay,
        timeLeft: end - nowSec,
        endTime: end,
      };
    }
  }
  return null;
}
import { useRouter } from "next/navigation";
import CalendarMulti from "@/components/CalendarMulti";
import { MhahPanchang } from "mhah-panchang";
import NepaliDate from "nepali-date-converter";

const TITHI_TO_NEPALI_NUM = {
  Padyami: "१",
  Vidhiya: "२",
  Thadiya: "३",
  Chaviti: "४",
  Chavithi: "४",
  Panchami: "५",
  Shasti: "६",
  Sapthami: "७",
  Ashtami: "८",
  Navami: "९",
  Dasami: "१०",
  Ekadasi: "११",
  Dvadasi: "१२",
  Trayodasi: "१३",
  Chaturdasi: "१४",
  Punnami: "१५",
  Purnima: "१५",
  Amavasya: "३०",
};
// Newar (Nepal Sambat) solar month ranges (approximate) and readable names
// Ranges taken from public Nepal Sambat sources (solar month boundaries vary by year by 1 day sometimes)
const NEWAR_MONTHS = [
  { name: "कछला", start: { m: 9, d: 20 }, end: { m: 10, d: 18 } }, // Oct20-Nov18
  { name: "थिंला", start: { m: 10, d: 19 }, end: { m: 11, d: 18 } }, // Nov19-Dec18
  { name: "पोहेला", start: { m: 11, d: 19 }, end: { m: 0, d: 17 } }, // Dec19-Jan17
  { name: "सिल्ला", start: { m: 0, d: 18 }, end: { m: 1, d: 16 } }, // Jan18-Feb16
  { name: "चिल्ला", start: { m: 1, d: 17 }, end: { m: 2, d: 17 } }, // Feb17-Mar17
  { name: "चौला", start: { m: 2, d: 18 }, end: { m: 3, d: 16 } }, // Mar18-Apr1
  { name: "बछला", start: { m: 3, d: 17 }, end: { m: 4, d: 17 } }, // Apr17-May17
  { name: "तछला", start: { m: 4, d: 18 }, end: { m: 5, d: 17 } }, // May18-Jun17
  { name: "दिल्ला", start: { m: 5, d: 18 }, end: { m: 6, d: 18 } }, // Jun18-Jul18
  { name: "गुंला", start: { m: 6, d: 19 }, end: { m: 7, d: 18 } }, // Jul19-Aug18
  { name: "ञंला", start: { m: 7, d: 19 }, end: { m: 8, d: 18 } }, // Aug19-Sep18
  { name: "कौला", start: { m: 8, d: 19 }, end: { m: 9, d: 19 } }, // Sep19-Oct19
];

// 60 Samvatsara names (English transliteration) - standard cycle
const SAMVATSARA_NAMES = [
  "प्रभव",
  "विभव",
  "शुक्ल",
  "प्रमोद",
  "प्रजापति",
  "अङ्गिरस",
  "श्रीमुख",
  "भव",
  "युवा",
  "धात्री",
  "ईश्वर",
  "बहुधान्य",
  "प्रमाथि",
  "विक्रम",
  "वृष",
  "चित्रभानु",
  "स्वभानु",
  "तरण",
  "पार्थिव",
  "व्यय",
  "सर्वजित्",
  "सर्वधारी",
  "विरोधि",
  "विकृति",
  "खर",
  "नन्दन",
  "विजय",
  "जय",
  "मन्मथ",
  "दुर्मुखि",
  "हेविलम्बि",
  "विलम्बि",
  "विकारी",
  "शर्वरी",
  "प्लव",
  "शुभकृत",
  "शोभकृत",
  "क्रोधि",
  "विश्ववासु",
  "पराभव",
  "प्लवङ्ग",
  "कीलक",
  "सौम्य",
  "साधारण",
  "विरोधिकृत",
  "परिधावि",
  "प्रमादी",
  "आनन्द",
  "राक्षस",
  "अनल",
  "पिङ्गल",
  "कालयुक्त",
  "सिद्धार्थ",
  "रौद्र",
  "दुर्मति",
  "दुन्दुभि",
  "रुधिरोद्गार",
  "रक्ताक्ष",
  "क्रोधन",
  "अक्षय",
];

function toDevanagari(num) {
  const devanagariDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(num)
    .split("")
    .map((d) => (d >= "0" && d <= "9" ? devanagariDigits[Number(d)] : d))
    .join("");
}

function dateIsBetween(date, start, end) {
  // start/end are objects {m: 0-11, d: 1-31}
  const year = date.getFullYear();
  const s = new Date(year, start.m, start.d);
  const e = new Date(year, end.m, end.d);
  // handle ranges that wrap year boundary (e.g., start in Dec -> end in Jan)
  if (e < s) {
    // if date >= s or date <= e (in next year)
    return date >= s || date <= e;
  }
  return date >= s && date <= e;
}

function getNewarMonthName(adDate) {
  for (let m of NEWAR_MONTHS) {
    if (dateIsBetween(adDate, m.start, m.end)) return m.name;
  }
  // fallback: pick by month number (approx)
  const fallback = [
    "कछला",
    "थिंला",
    "प्वंहेला",
    "सिला",
    "चिला",
    "चौला",
    "बचछला",
    "तछला",
    "दिला",
    "गुंला",
    "यनला",
    "कौला",
  ];
  return fallback[adDate.getMonth()];
}

function getNepalSambatYear(adDate) {
  // Nepal Sambat epoch: 20 Oct 879 AD. Many public sources calculate NS year
  // approximately as (AD_year - 879) and if date is before Oct 20 subtract 1.
  const year = adDate.getFullYear();
  const epochPivot = new Date(year, 9, 20); // Oct 20 of current year
  let ns = year - 879;
  if (adDate < epochPivot) ns = ns - 1;
  return ns;
}

function getSamvatsaraName(adDate) {
  // Samvatsara cycle anchor: 1987-04-14 → Prabhava
  const year = adDate.getFullYear();

  // pivot = April 14 local time
  const pivot = new Date(year, 3, 14, 0, 0, 0);

  let anchorYear = year;
  if (adDate < pivot) anchorYear = year - 1;

  // index in 60-cycle
  const index = (((anchorYear - 1973) % 60) + 60) % 60;

  return SAMVATSARA_NAMES[index] || "(unknown)";
}

export default function LivePanchangCard() {
  const [now, setNow] = useState(new Date());
  const [panchang, setPanchang] = useState(null);
  const [sunMoon, setSunMoon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [choghadiya, setChoghadiya] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Update choghadiya every second
  useEffect(() => {
    if (!sunMoon?.sunRise || !sunMoon?.sunSet) return;
    setChoghadiya(getCurrentChoghadiya(now, sunMoon.sunRise, sunMoon.sunSet));
  }, [now, sunMoon]);

  useEffect(() => {
    const obj = new MhahPanchang();
    const date = new Date();
    try {
      const data = obj.calendar(date, 28.7041, 77.1025);
      const sunData = obj.sunTimer(date, 28.7041, 77.1025);
      setPanchang(data);
      setSunMoon(sunData);
    } catch (err) {
      console.error("Error fetching Panchang/SunMoon:", err);
      setPanchang(null);
      setSunMoon(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ...existing code...
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto bg-base-100 rounded-2xl border border-base-300 overflow-hidden p-4 space-y-4 animate-pulse">
        <div className="h-6 w-36 rounded bg-gray-200"></div>
        <div className="h-32 w-full rounded bg-gray-200"></div>
        <div className="h-4 w-1/2 rounded bg-gray-200"></div>
        <div className="h-4 w-1/3 rounded bg-gray-200"></div>
      </div>
    );
  }

  if (!panchang) {
    return (
      <div className="max-w-3xl mx-auto bg-base-100 rounded-2xl border border-base-300 p-4">
        <p className="text-sm text-red-600">Unable to load Panchang data.</p>
      </div>
    );
  }

  const weekday = now.toLocaleDateString("en-GB", { weekday: "long" });
  const adFull = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const bs = NepaliDate.fromAD(now);
  const bsFull = bs.format("YYYY MMMM D", "np");

  // Choghadiya display helpers
  function formatTimeLeft(sec) {
    if (sec <= 0) return "Ended";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}m ${s}s`;
  }

  const pakshaRaw = panchang?.Paksha?.name_en_IN || "";
  const isShukla = pakshaRaw.toLowerCase() === "shukla";
  const tithiName = panchang?.Tithi?.name_en_IN || "";
  const moonSrc = `/moon/${isShukla ? "Shukla" : "Krishna"}/${tithiName}.png`;

  // Newar month + suffix based on paksha (thva for Shukla, ga for Krishna)
  const newarMonth = getNewarMonthName(now);
  const pakshaSuffix = isShukla ? "थ्व" : "गा"; // user wanted 'thva' / 'ga'

  // Append 'paru' only for full-moon tithi (various spellings handled)
  //const isFullMoon = /pun|purni|purnam|punnami/i.test(tithiName);
  //const paruStr = isFullMoon ? ' paru' : '';
  const paruStr = panchang?.Paksha?.name_en_IN ? " पारु" : "";

  const nsYear = getNepalSambatYear(now);
  const nsDeva = toDevanagari(nsYear);

  const samvatsarName = getSamvatsaraName(now);

  const formatTime = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  return (
    <div className="max-w-3xl mx-auto m-3 bg-base-100 rounded-xl border border-base-300 overflow-hidden p-3">
      {/* header */}
      <div className="flex justify-between">
        <div className="flex flex-col justify-start items-start gap-2">
          <div className="flex items-center gap-2 border border-base-300 bg-base-100 rounded px-2 py-0.5">
            <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
            <span className="text-xs font-semibold uppercase">Live</span>
          </div>

          <div className="pb-2 text-left text-base-800 text-md font-semibold">
            <p className="text-md font-bold text-base-800">
              {samvatsarName} नाम सम्वत्सर
            </p>

            <div className="flex flex-col items-start gap-1">
              {panchang.Masa ? panchang.Masa.name_en_IN : ""} {pakshaRaw}{" "}
              {tithiName}
              <span className="text-md font-medium text-base-800">
                ने. सं. {nsYear}{" "}
                <span className="font-bold">
                  {newarMonth}
                  {pakshaSuffix}
                  {paruStr}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="text-right text-md">
          <div className="font-medium">{weekday}</div>
          <div className="text-md font-semibold">{adFull}</div>
          <div className="text-base-800">({bsFull})</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Panchang details table */}
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <tbody className="text-sm">
              <tr>
                <td className="font-medium">Tithi</td>
                <td>{tithiName || "-"}</td>
              </tr>
              <tr>
                <td className="font-medium">Paksha</td>
                <td>
                  {panchang.Paksha
                    ? `${panchang.Paksha.name_en_IN} Paksha`
                    : "-"}
                </td>
              </tr>
              <tr>
                <td className="font-medium">Rasi</td>
                <td>{panchang.Raasi ? panchang.Raasi.name_en_UK : "-"}</td>
              </tr>
              <tr>
                <td className="font-medium">Nakshatra</td>
                <td>
                  {panchang.Nakshatra ? panchang.Nakshatra.name_en_IN : "-"}
                </td>
              </tr>
              <tr>
                <td className="font-medium">Yoga</td>
                <td>{panchang.Yoga ? panchang.Yoga.name_en_IN : "-"}</td>
              </tr>
              <tr>
                <td className="font-medium">Karna</td>
                <td>{panchang.Karna ? panchang.Karna.name_en_IN : "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sun & Moon timings table */}
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <tbody className="text-sm">
              <tr>
                <td className="font-medium">Sunrise</td>
                <td>{formatTime(sunMoon?.sunRise)}</td>
              </tr>
              <tr>
                <td className="font-medium">Sunset</td>
                <td>{formatTime(sunMoon?.sunSet)}</td>
              </tr>
              <tr>
                <td className="font-medium">Solar Noon</td>
                <td>{formatTime(sunMoon?.solarNoon)}</td>
              </tr>
              <tr>
                <td className="font-medium">Moonrise</td>
                <td>{formatTime(sunMoon?.moonRise)}</td>
              </tr>
              <tr>
                <td className="font-medium">Moonset</td>
                <td>{formatTime(sunMoon?.moonSet)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* moon */}
      <div className="relative flex justify-center py-2">
        {/* moon image and related content here, if any */}
      </div>
    </div>
  );
}
