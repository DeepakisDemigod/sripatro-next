"use client";

import React, { useEffect, useState } from "react";
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
  { name: "Kachhala", start: { m: 9, d: 20 }, end: { m: 10, d: 18 } }, // Oct20-Nov18
  { name: "Thinla", start: { m: 10, d: 19 }, end: { m: 11, d: 18 } }, // Nov19-Dec18
  { name: "Pwanhela", start: { m: 11, d: 19 }, end: { m: 0, d: 17 } }, // Dec19-Jan17
  { name: "Sila", start: { m: 0, d: 18 }, end: { m: 1, d: 16 } }, // Jan18-Feb16
  { name: "Chila", start: { m: 1, d: 17 }, end: { m: 2, d: 17 } }, // Feb17-Mar17
  { name: "Chaula", start: { m: 2, d: 18 }, end: { m: 3, d: 16 } }, // Mar18-Apr16
  { name: "Bachhala", start: { m: 3, d: 17 }, end: { m: 4, d: 17 } }, // Apr17-May17
  { name: "Tachhala", start: { m: 4, d: 18 }, end: { m: 5, d: 17 } }, // May18-Jun17
  { name: "Dila", start: { m: 5, d: 18 }, end: { m: 6, d: 18 } }, // Jun18-Jul18
  { name: "Gunla", start: { m: 6, d: 19 }, end: { m: 7, d: 18 } }, // Jul19-Aug18
  { name: "Yanla", start: { m: 7, d: 19 }, end: { m: 8, d: 18 } }, // Aug19-Sep18
  { name: "Kaula", start: { m: 8, d: 19 }, end: { m: 9, d: 19 } }, // Sep19-Oct19
];

// 60 Samvatsara names (English transliteration) - standard cycle
const SAMVATSARA_NAMES = [
  "Prabhava",
  "Vibhava",
  "Shukla",
  "Pramoda",
  "Prajapati",
  "Angirasa",
  "Shrimukha",
  "Bhava",
  "Yuva",
  "Dhatri",
  "Isvara",
  "Bahudhanya",
  "Pramathi",
  "Vikrama",
  "Vrisha",
  "Chitrabhanu",
  "Svabhanu",
  "Tarana",
  "Parthiva",
  "Vyaya",
  "Sarvajit",
  "Sarvadhari",
  "Virodhi",
  "Vikruti",
  "Khara",
  "Nandana",
  "Vijaya",
  "Jaya",
  "Manmatha",
  "Durmukhi",
  "Hevilambi",
  "Vilambi",
  "Vikari",
  "Sarvari",
  "Plava",
  "Subhakritu",
  "Sobhakritu",
  "Krodhi",
  "Visvavasu",
  "Parabhava",
  "Plavanga",
  "Keelaka",
  "Saumya",
  "Sadharana",
  "Virodhikrta",
  "Paridhavi",
  "Pramadi",
  "Ananda",
  "Rakshasa",
  "Anala",
  "Pingala",
  "Kalayukta",
  "Siddhartha",
  "Raudra",
  "Durmati",
  "Dundubhi",
  "Rudhirodgara",
  "Raktaksha",
  "Krodhana",
  "Akshaya",
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
    "Kachhala",
    "Thinla",
    "Pwanhela",
    "Sila",
    "Chila",
    "Chaula",
    "Bachhala",
    "Tachhala",
    "Dila",
    "Gunla",
    "Yanla",
    "Kaula",
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
  // Samvatsara (60-year) cycle: we anchor to 1987-1988 = Prabhava (common anchor).
  // The Hindu new-year (Ugadi/Gudi Padwa) typically falls in Mar/Apr; we'll use Apr 14 as pivot.
  const year = adDate.getFullYear();
  const pivot = new Date(year, 3, 14); // Apr 14
  let anchorYear = year;
  if (adDate < pivot) anchorYear = year - 1;
  const index = ((anchorYear - 1987) % 60 + 60) % 60; // ensure positive
  return SAMVATSARA_NAMES[index] || "(unknown)";
}

export default function LivePanchangCard() {
  const [now, setNow] = useState(new Date());
  const [panchang, setPanchang] = useState(null);
  const [sunMoon, setSunMoon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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

  const pakshaRaw = panchang?.Paksha?.name_en_IN || "";
  const isShukla = pakshaRaw.toLowerCase() === "shukla";
  const tithiName = panchang?.Tithi?.name_en_IN || "";
  const moonSrc = `/moon/${isShukla ? "Shukla" : "Krishna"}/${tithiName}.png`;

  // Newar month + suffix based on paksha (thva for Shukla, ga for Krishna)
  const newarMonth = getNewarMonthName(now);
  const pakshaSuffix = isShukla ? "thva" : "ga"; // user wanted 'thva' / 'ga'

  // Append 'paru' only for full-moon tithi (various spellings handled)
  const isFullMoon = /pun|purni|purnam|punnami/i.test(tithiName);
  const paruStr = isFullMoon ? " paru" : "";

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

          <div className="pb-2 text-left text-base-800 text-sm font-semibold">
            {panchang.Masa ? panchang.Masa.name_en_IN : ""} {pakshaRaw} {tithiName}
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs font-thin text-base-800">
                ने. सं. {nsDeva} {newarMonth}{pakshaSuffix}{paruStr}
              </span>
              <p className="text-xs font-thin text-base-800">सम्वत्: {samvatsarName}</p>
            </div>
          </div>
        </div>

        <div className="text-right text-sm">
          <div className="font-medium">{weekday}</div>
          <div className="text-md font-semibold">{adFull}</div>
          <div className="text-base-800">({bsFull})</div>
        </div>
      </div>

      {/* moon */}
      <div className="relative flex justify-center py-2">
        <img
          src={moonSrc}
          alt={panchang.Tithi.name_en_IN}
          className="w-24 h-24 rounded-full border border-base-300/40"
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="z-10 rounded-full w-16 h-16 bg-none flex items-center justify-center shadow-md">
            <span className="text-4xl font-bold text-zinc-200/70 customfont">
              {TITHI_TO_NEPALI_NUM[panchang?.Tithi?.name_en_IN] || "?"}
            </span>
          </div>
        </div>
      </div>

      {/* Panchang details */}
      <div className="py-1 space-y-1 text-sm">
        <div>
          <strong>Tithi:</strong> {tithiName}
          {panchang.Paksha ? `, ${panchang.Paksha.name_en_IN} Paksha` : ""}
        </div>
        <div>
          <strong>Rasi:</strong> {panchang.Raasi ? panchang.Raasi.name_en_UK : "-"}
        </div>
        <div>
          <strong>Nakshatra:</strong> {panchang.Nakshatra ? panchang.Nakshatra.name_en_IN : "-"}
        </div>
        <div>
          <strong>Yoga:</strong> {panchang.Yoga ? panchang.Yoga.name_en_IN : "-"}
        </div>
        <div>
          <strong>Karna:</strong> {panchang.Karna ? panchang.Karna.name_en_IN : "-"}
        </div>
      </div>

      {/* Sun & Moon timings */}
      {sunMoon ? (
        <div className="mt-4 border-t border-base-300 pt-2 text-sm space-y-1">
          <div>
            <strong>Sunrise:</strong> {formatTime(sunMoon.sunRise)}
          </div>
          <div>
            <strong>Sunset:</strong> {formatTime(sunMoon.sunSet)}
          </div>
          <div>
            <strong>Solar Noon:</strong> {formatTime(sunMoon.solarNoon)}
          </div>
          <div>
            <strong>Moonrise:</strong> {formatTime(sunMoon.moonRise)}
          </div>
          <div>
            <strong>Moonset:</strong> {formatTime(sunMoon.moonSet)}
          </div>
        </div>
      ) : (
        <div className="mt-4 text-sm text-gray-500">Sun/Moon timings not available</div>
      )}
    </div>
  );
}

