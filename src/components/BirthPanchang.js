"use client";
import React, { useEffect, useMemo, useState } from "react";
import { MhahPanchang } from "mhah-panchang";
import NepaliDate from "nepali-date-converter";
import { Alarm, Calendar, CaretLeft, ArrowSquareOut } from "phosphor-react";
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

const BirthPanchangUnified = () => {
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
  const handleCalculate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setPanchang(null);
    setNakshatraInfo(null);
    setSunData(null);
    setBsConvertedDate(null);
    try {
      let adDate;

      if (mode === "AD_TO_BS") {
        // build ad date from selects
        const iso = `${adYear}-${String(adMonth).padStart(2, "0")}-${String(adDay).padStart(2, "0")}`;
        adDate = new Date(`${iso}T${timeOfBirth}`);
        if (isNaN(adDate.getTime())) throw new Error("Invalid AD date");
        // convert to BS for display
        try {
          const bs = NepaliDate.fromAD(adDate);
          setBsConvertedDate({
            year: bs.getYear(),
            month: bs.getMonth(),
            day: bs.getDate(),
          });
        } catch {
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
      setEnglishDate(
        adDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
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
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid input");
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-start justify-center py-8">
      <div className="w-full max-w-5xl p-5">
        <div className="bg-base-100/80  backdrop-blur-sm rounded-2xl shadow-2xl p-6 grid md:grid-cols-2 gap-6 transition-all">
          <div>
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm text-base-700 hover:underline mb-3"
            >
              <CaretLeft size={18} /> <span>{t("Back")}</span>
            </a>

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
                              {mName}
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
                  className="flex items-center gap-2 block text-sm font-medium text-base-600 mb-2"
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
          <div>
            {error && (
              <div className="mb-3 text-red-600 font-medium">{error}</div>
            )}

            {!panchang ? (
              <div className="rounded-xl p-4 bg-base-100/60 shadow-sm border border-base-300 text-base-600">
                {t("Enter your details to get your birth Panchang")}
              </div>
            ) : (
              <>
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
                          {t(`nakshatra.${panchang?.Nakshatra?.name_en_IN}`) ||
                            "Not Available"}
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
                            <th className="text-left py-2 pr-4">{t("Gan")}</th>
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
                        <th className="text-left py-2 pr-4">{t("Sunrise")}</th>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthPanchangUnified;
