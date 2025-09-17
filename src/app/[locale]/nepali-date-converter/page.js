"use client";

import { useState, useEffect } from "react";
import NepaliDate from "nepali-date-converter";
import { useTranslations } from "next-intl";
import { CaretLeft, ArrowUpRight } from "phosphor-react";
import Link from "next/link";
import Head from "next/head";
import Header from "../../../components/Header.js";
import Comments from "@/components/Comments/Comments.js";

const nepaliMonths = [
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

const englishMonths = [
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

const nepaliDays = [
  "आइतबार",
  "सोमबार",
  "मंगलबार",
  "बुधबार",
  "बिहीबार",
  "शुक्रबार",
  "शनिबार",
];

const englishDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Year range
const years = Array.from({ length: 101 }, (_, i) => 2000 + i);

export default function DateConverter() {
  const t = useTranslations("");
  const [mode, setMode] = useState("AD_TO_BS");
  // AD selects
  const today = new Date();
  const initAdYear = today.getFullYear();
  const initAdMonth = today.getMonth() + 1;
  const initAdDay = today.getDate();
  const [adYear, setAdYear] = useState(initAdYear);
  const [adMonth, setAdMonth] = useState(initAdMonth);
  const [adDay, setAdDay] = useState(initAdDay);

  const [bsDate, setBsDate] = useState({ year: 2081, month: 1, date: 1 });
  const [convertedToBs, setConvertedToBs] = useState("");
  const [convertedToAd, setConvertedToAd] = useState("");
  const [bsDay, setBsDay] = useState("");
  const [adDayName, setAdDayName] = useState("");
  const [maxBsDays, setMaxBsDays] = useState(32);

  // Get number of days in BS month/year using NepaliDate
  const getDaysInBsMonth = (year, month) => {
    try {
      let day = 32;
      while (day > 0) {
        try {
          new NepaliDate(year, month - 1, day);
          return day;
        } catch {
          day--;
        }
      }
    } catch {
      return 30;
    }
  };

  useEffect(() => {
    const nepaliDate = NepaliDate.fromAD(new Date());
    const year = nepaliDate.getYear();
    const month = nepaliDate.getMonth() + 1;
    const date = nepaliDate.getDate();
    const dayIndex = nepaliDate.getDay();

    setBsDate({ year, month, date });
    setBsDay(nepaliDays[dayIndex]);
    setMaxBsDays(getDaysInBsMonth(year, month));

    // initialize conversions (use current AD select values)
    handleAdToBs({ year: initAdYear, month: initAdMonth, day: initAdDay });
    handleBsToAd(year, month, date);
  }, []);

  useEffect(() => {
    const { year, month } = bsDate;
    setMaxBsDays(getDaysInBsMonth(Number(year), Number(month)));
  }, [bsDate.year, bsDate.month]);

  const handleAdToBs = ({ year, month, day, dateStr } = {}) => {
    try {
      // Build Date from explicit components to avoid timezone/ISO parsing issues
      let dateObj;
      if (dateStr) {
        // expect YYYY-MM-DD
        const parts = String(dateStr).split("-");
        if (parts.length >= 3) {
          dateObj = new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
          );
        } else {
          dateObj = new Date(dateStr);
        }
      } else if (
        year !== undefined &&
        month !== undefined &&
        day !== undefined
      ) {
        dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      } else {
        dateObj = new Date(Number(adYear), Number(adMonth) - 1, Number(adDay));
      }

      const adDayIndex = dateObj.getDay();
      setAdDayName(englishDays[adDayIndex]);

      const nepaliDate = NepaliDate.fromAD(dateObj);
      const y = nepaliDate.getYear();
      const m = nepaliDate.getMonth(); // 0-based index
      const d = nepaliDate.getDate();
      const bsDayIndex = nepaliDate.getDay();

      setConvertedToBs(
        `${toNepaliNumber(y)} ${nepaliMonths[m]} ${toNepaliNumber(d)}, ${nepaliDays[bsDayIndex]}`
      );
    } catch (e) {
      console.error(e);
      alert("Invalid AD date. Use YYYY-MM-DD format.");
    }
  };

  const handleBsToAd = (
    year = bsDate.year,
    month = bsDate.month,
    date = bsDate.date
  ) => {
    try {
      const nepDate = new NepaliDate(
        Number(year),
        Number(month) - 1,
        Number(date)
      );
      const engDate = nepDate.toJsDate();

      const y = engDate.getFullYear();
      const m = engDate.getMonth();
      const d = engDate.getDate();
      const bsDayIndex = nepDate.getDay();

      setBsDay(nepaliDays[bsDayIndex]);
      setConvertedToAd(`${y} ${englishMonths[m]} ${d}`);
    } catch (e) {
      alert(
        "Invalid BS date. Make sure year, month, and date are valid numbers."
      );
    }
  };

  const toNepaliNumber = (num) =>
    String(num).replace(/\d/g, (d) => "०१२३४५६७८९"[d]);

  return (
    <>
      <Head>
        <title>Nepali Date Converter | Sri Patro Best Nepali Patro</title>
        <meta
          name="description"
          content="Convert Indian date (AD) to Nepali date (BS) or vice versa using SriPatro's fast free online Nepali Date Converter tool."
        />
        <meta
          name="keywords"
          content="Nepali Date Converter, Nepali Patro, Bikram Sambat, Gregorian Calendar, AD to BS, BS to AD, SriPatro"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Free and Fast Nepali Date Converter | Convert AD to BS | SriPatro"
        />
        <meta
          property="og:description"
          content="Easily convert dates between Indian (Gregorian) and Nepali (Bikram Sambat) calendars with SriPatro's fast, reliable tool."
        />
        <meta
          property="og:image"
          content="https://example.com/share-image.png"
        />
        <meta
          property="og:url"
          content="https://sripatro.com/nepali-date-converter"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@deepakisdemigod" />
        <link rel="canonical" href="https://sripatro.com/date-converter" />
      </Head>
      <Header />
      <div className="bg-base-100/50 max-w-md mx-auto my-4 p-4 space-y-6">
        {/* mode toggle */}
        <div className="flex items-center gap-3 justify-center mb-2">
          <label
            className={`px-3 py-1 rounded-xl border ${mode === "AD_TO_BS" ? "bg-base-200" : "bg-transparent"}`}
          >
            <input
              type="radio"
              name="mode"
              value="AD_TO_BS"
              checked={mode === "AD_TO_BS"}
              onChange={() => setMode("AD_TO_BS")}
              className="hidden"
            />
            🇬🇧 AD → BS
          </label>
          <label
            className={`px-3 py-1 rounded-xl border ${mode === "BS_TO_AD" ? "bg-base-200" : "bg-transparent"}`}
          >
            <input
              type="radio"
              name="mode"
              value="BS_TO_AD"
              checked={mode === "BS_TO_AD"}
              onChange={() => setMode("BS_TO_AD")}
              className="hidden"
            />
            🇳🇵 BS → AD
          </label>
        </div>
        {/* AD to BS */}
        {mode === "AD_TO_BS" && (
          <div className="bg-base-100 rounded-2xl  border border-base-300  p-5">
            <h3 className="text-base font-semibold text-base-content/80 mb-3">
              🇮🇳 {t("Indian Date")} <span className="mx-2">→</span> 🇳🇵{" "}
              {t("Nepali Date")}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <select
                value={adYear}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setAdYear(v);
                  handleAdToBs({ year: v, month: adMonth, day: adDay });
                }}
                className="px-3 py-3 rounded-xl bg-base-200 text-base-content focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Array.from({ length: 121 }, (_, i) => initAdYear - i).map(
                  (y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  )
                )}
              </select>
              <select
                value={adMonth}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setAdMonth(v);
                  // adjust adDay if it exceeds new month's max
                  const maxDay = new Date(adYear, v, 0).getDate();
                  const newDay = Math.min(adDay, maxDay);
                  setAdDay(newDay);
                  handleAdToBs({ year: adYear, month: v, day: newDay });
                }}
                className="px-3 py-3 rounded-xl bg-base-200 text-base-content focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {englishMonths.map((m, idx) => (
                  <option key={idx} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={adDay}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setAdDay(v);
                  handleAdToBs({ year: adYear, month: adMonth, day: v });
                }}
                className="px-3 py-3 rounded-xl bg-base-200 text-base-content focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Array.from(
                  { length: new Date(adYear, adMonth, 0).getDate() },
                  (_, i) => i + 1
                ).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {convertedToBs && (
              <div className="mt-4 rounded-2xl bg-base-300/50 p-4 text-center">
                <span className="text-lg font-extrabold text-base-content/80">
                  {convertedToBs}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        {/* <div className="flex items-center justify-center">
          <span className="px-4 text-sm text-base-content/80">OR</span>
        </div> */}

        {/* BS to AD */}
        {mode === "BS_TO_AD" && (
          <div className="bg-base-100 rounded-2xl border border-base-300 p-5">
            <h3 className="text-base font-semibold text-base-content/80 mb-3">
              🇳🇵 {t("Nepali Date")} <span className="mx-2">→</span> 🇮🇳{" "}
              {t("Indian Date")}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {/* Year */}
              <select
                value={bsDate.year}
                onChange={(e) => {
                  const updated = { ...bsDate, year: e.target.value };
                  setBsDate(updated);
                  handleBsToAd(updated.year, updated.month, updated.date);
                }}
                className="px-3 py-3 rounded-xl bg-base-200 text-base-content focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              {/* Month */}
              <select
                value={bsDate.month}
                onChange={(e) => {
                  const updated = { ...bsDate, month: e.target.value };
                  setBsDate(updated);
                  handleBsToAd(updated.year, updated.month, updated.date);
                }}
                className="px-3 py-3 rounded-xl bg-base-200 text-base-content focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {nepaliMonths.map((name, idx) => (
                  <option className="font-bold" key={idx} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Day */}
              <select
                value={bsDate.date}
                onChange={(e) => {
                  const updated = { ...bsDate, date: e.target.value };
                  setBsDate(updated);
                  handleBsToAd(updated.year, updated.month, updated.date);
                }}
                className="px-3 py-3 rounded-xl bg-base-200 text-base-content/90 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Array.from({ length: maxBsDays }, (_, i) => i + 1).map(
                  (day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  )
                )}
              </select>
            </div>

            {convertedToAd && (
              <div className="mt-4 rounded-2xl bg-base-300/50 p-4 text-center">
                <span className="text-xl font-bold text-base-content/80">
                  {convertedToAd},{" "}
                </span>
                <span className="text-xl font-bold text-base-content/80">
                  {bsDay}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto my-4 p-4 space-y-6">
        <h2 className="text-lg font-bold mb-4">Frequently Asked Questions</h2>
        <div className="join join-vertical w-full">
          <div className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
            <input type="checkbox" />
            <div className="collapse-title text-base font-medium">
              Why are some dates shown in red?
            </div>
            <div className="collapse-content text-sm text-base-600">
              Saturdays and holiday dates are shown in red for quick visibility.
              Holidays are sourced from the festival data.
            </div>
          </div>

          <div className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
            <input type="checkbox" />
            <div className="collapse-title text-base font-medium">
              How do I show or hide Tithi, Nakshatra, Rasi, or Festivals?
            </div>
            <div className="collapse-content text-sm text-base-600">
              Use the "Customize" button above the calendar or visit the
              Settings page to toggle these options. Preferences are saved in
              your browser.
            </div>
          </div>

          <div className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
            <input type="checkbox" />
            <div className="collapse-title text-base font-medium">
              Can I show Nepali dates in Devanagari digits?
            </div>
            <div className="collapse-content text-sm text-base-600">
              Yes. Enable "Nepali digits" from the Customize menu or Calendar
              section in Settings to render dates like १, २, ३.
            </div>
          </div>

          <div className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
            <input type="checkbox" />
            <div className="collapse-title text-base font-medium">
              How do festivals and holidays appear?
            </div>
            <div className="collapse-content text-sm text-base-600">
              Festival notes come from the data-db source and can be toggled on.
              Holidays are automatically highlighted in red.
            </div>
          </div>

          <div className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
            <input type="checkbox" />
            <div className="collapse-title text-base font-medium">
              Will the calendar always show the current month?
            </div>
            <div className="collapse-content text-sm text-base-600">
              Yes. The calendar page detects the current Gregorian month on load
              and aligns to the corresponding Bikram Sambat month.
            </div>
          </div>
        </div>
      </div>
      <Comments currentUserId="1" />
    </>
  );
}
