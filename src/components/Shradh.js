"use client";

import { useState, useEffect } from "react";
import { MhahPanchang } from "mhah-panchang";
import { Alarm, CaretLeft, CaretRight, Calendar } from "phosphor-react";
import { useTranslations } from "next-intl";
import NepaliDate from "nepali-date-converter";
import Head from "next/head"

const BS_MONTHS_NEPALI = [
  "Baisakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

const AD_MONTHS_ENGLISH = [
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
  Amavasya: "३०",
};

export default function Shradh() {
  const t = useTranslations("");
  const tithi = useTranslations("tithi");
  const now = new Date();
  const todayBS = NepaliDate.fromAD(now);

  // Initialize state with today's date
  const [dateType, setDateType] = useState("AD");
  const [adYear, setAdYear] = useState(now.getFullYear());
  const [adMonth, setAdMonth] = useState(now.getMonth());
  const [adDay, setAdDay] = useState(now.getDate());
  const [bsYear, setBsYear] = useState(todayBS.getYear());
  const [bsMonth, setBsMonth] = useState(todayBS.getMonth());
  const [bsDay, setBsDay] = useState(todayBS.getDate());
  const [time, setTime] = useState(now.toTimeString().slice(0, 5));
  const [dob, setDob] = useState(now.toISOString().split("T")[0]);
  const [panchang, setPanchang] = useState(null);
  const [age, setAge] = useState(null);
  const [sunData, setSunData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Shradh Panchang | Sri Patro";
  }, []);

  // Calculate tithi for today on page load
  useEffect(() => {
    calculatePanchang(dob, time);
  }, []);

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return { years, months, days };
  };

  const validateADDate = (year, month, day) => {
    if (!year || !month || !day) return false;
    const date = new Date(year, month, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day &&
      !isNaN(date.getTime())
    );
  };

  const validateBSDate = (year, month, day) => {
    try {
      if (!year || !month || !day) return false;
      const bsDate = new NepaliDate(year, month, day);
      return (
        bsDate.getYear() === year &&
        bsDate.getMonth() === month &&
        bsDate.getDate() === day
      );
    } catch {
      return false;
    }
  };

  const getDaysInBSMonth = (year, month) => {
    try {
      const bsDate = new NepaliDate(year, month, 1);
      const nextMonth = new NepaliDate(year, month + 1, 1);
      const diff =
        (nextMonth.toJsDate() - bsDate.toJsDate()) / (1000 * 60 * 60 * 24);
      return Math.floor(diff);
    } catch {
      return 30; // fallback
    }
  };

  const calculatePanchang = (dateStr, timeStr) => {
    try {
      const dateTime = new Date(`${dateStr}T${timeStr}:00`);
      if (isNaN(dateTime.getTime())) throw new Error("Invalid date or time");
      const panchangObj = new MhahPanchang();
      const result = panchangObj.calculate(dateTime);
      setPanchang(result);
      setAge(calculateAge(dateStr));
      setError(null);
    } catch (err) {
      console.error("Error calculating Panchang:", err);
      setPanchang(null);
      setAge(null);
      setError(t("Error calculating Panchang. Please check your inputs."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    let finalDob;
    if (dateType === "AD") {
      if (!validateADDate(adYear, adMonth, adDay)) {
        setError(t("Invalid AD date selected."));
        setIsLoading(false);
        return;
      }
      finalDob = new Date(adYear, adMonth, adDay).toISOString().split("T")[0];
    } else {
      if (!validateBSDate(bsYear, bsMonth, bsDay)) {
        setError(t("Invalid BS date selected."));
        setIsLoading(false);
        return;
      }
      try {
        const bsDate = new NepaliDate(bsYear, bsMonth, bsDay);
        finalDob = bsDate.toJsDate().toISOString().split("T")[0];
      } catch {
        setError(t("Invalid BS date."));
        setIsLoading(false);
        return;
      }
    }

    setDob(finalDob);
    calculatePanchang(finalDob, time);
  };

  useEffect(() => {
    if (!dob) return;
    const fetchSunDetails = async () => {
      try {
        const res = await fetch(
          `https://api.sunrisesunset.io/json?lat=28.7041&lng=77.1025&date=${dob}`
        );
        if (!res.ok) throw new Error("Failed to fetch sun data");
        const data = await res.json();
        setSunData(data.results);
      } catch {
        setSunData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSunDetails();
  }, [dob]);

  const formatEnglishDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const changeDay = (days) => {
    setIsLoading(true);
    const d = new Date(dob);
    d.setDate(d.getDate() + days);
    const newDate = d.toISOString().split("T")[0];
    setDob(newDate);
    setAdYear(d.getFullYear());
    setAdMonth(d.getMonth());
    setAdDay(d.getDate());
    try {
      const bsDate = NepaliDate.fromAD(d);
      setBsYear(bsDate.getYear());
      setBsMonth(bsDate.getMonth());
      setBsDay(bsDate.getDate());
    } catch {
      // ignore
    }
    calculatePanchang(newDate, time);
  };

  const getDaysInADMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleBackToForm = () => {
    setPanchang(null);
    setError(null);
    setSunData(null);
    setAge(null);
  };

const [shradhList] = useState([

{ date: "8 Sept", day: "Monday", tithi: "Purnima Shradh" },

{ date: "9 Sept", day: "Tuesday", tithi: "Pratipada Shradh" },

{ date: "10 Sept", day: "Wednesday", tithi: "Dwitiya Shradh" },

{ date: "11 Sept", day: "Thursday", tithi: "Tritiya Shradh" },

{ date: "12 Sept", day: "Friday", tithi: "Chaturthi Shradh" },

{ date: "13 Sept", day: "Saturday", tithi: "Panchami Shradh" },

{ date: "14 Sept", day: "Sunday", tithi: "Shashthi Shradh" },

{ date: "15 Sept", day: "Monday", tithi: "Saptami Shradh" },

{ date: "16 Sept", day: "Tuesday", tithi: "Ashtami Shradh" },

{ date: "17 Sept", day: "Wednesday", tithi: "Navami Shradh" },

{ date: "18 Sept", day: "Thursday", tithi: "Dashami Shradh" },

{ date: "19 Sept", day: "Friday", tithi: "Ekadashi Shradh" },

{ date: "20 Sept", day: "Saturday", tithi: "Dwadashi Shradh" },

{ date: "21 Sept", day: "Sunday", tithi: "Trayodashi & Chaturdashi Shradh" },

{ date: "22 Sept", day: "Monday", tithi: "Sarva Pitru Amavasya (Mahalaya Amavasya)" },

]);


  return (
	  <>
	  <Head>
  <title>Shradh Panchang 2025 | Pitru Paksha Tithi | SriPatro</title>
  <meta
    name="description"
    content="Check Shradh Panchang and Pitru Paksha Tithi for 2025. Perform Shradh rituals based on Tithi to honor ancestors and receive blessings. Powered by SriPatro."
  />
  <meta
    name="keywords"
    content="Shradh Panchang, Pitru Paksha, Mahalaya Amavasya, Shraddh 2025, Tithi, Hindu rituals, SriPatro"
  />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Shradh Panchang 2025 | Pitru Paksha Tithi | SriPatro" />
  <meta
    property="og:description"
    content="Find accurate Shradh Panchang and Pitru Paksha Tithi details for 2025. Perform Shradh on the right day as per Vedic tradition."
  />
  <meta property="og:image" content="https://sripatro.com/images/shradh-banner.png" />
  <meta property="og:url" content="https://sripatro.com/shradh" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:creator" content="@sripatro" />
  <link rel="canonical" href="https://sripatro.com/shradh" />
</Head>

    <div className=" flex flex-col items-center justify-start">
      <div className="max-w-3xl bg-radial from-base-200 via-base-100 to-base-200 border border-base-300 rounded-lg p-6 sm:p-8 hover:">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-red-700 mb-6 sm:mb-8">
	  {/* <span className="text-2xl">🪔</span>*/}
          {t("Shradh Tithi")} {/*<span className="text-2xl flip_H">🪔</span>*/}
        </h1>
 <p>The Shradh Paksha or Pitri Paksha Starts from The Full Moon (Poornima) of Bhadra Month and Ends on The New Moon (Amavasya/Aunsi) of Ashwin (Awsoj) Month. It is an Important time to express gratitude, perform rituals and to recieve blessings from ancestors.</p>

<br />	  
	  <p>Shradh Paksha, also known as Mahalaya Paksha, is a sacred 15-day period dedicated to offering prayers and food to ancestors (Pitri). It is believed that during this time, performing Shradh rituals ensures the souls of forefathers get Peace and bestow blessings upon the family.</p>


    {/* Note */}

<div className="border border-red-600 bg-[#ff000030] rounded-lg p-2 my-2 ">

<span className="text-red-900 text-sm">

Shradh is performed according to the <strong>tithi (lunar day)</strong> of the ancestor’s death.

If the exact date is not known, perform it on <strong>22 Sept 2025 (Sarva Pitru Amavasya)</strong>.

</span>
</div>
    {isLoading ? (
          // Loading Skeleton
          <div className="mt-8 space-y-6">
            <div className="flex justify-between">
              <div className="skeleton h-8 w-24 rounded-lg"></div>
              <div className="skeleton h-8 w-24 rounded-lg"></div>
              <div className="skeleton h-8 w-24 rounded-lg"></div>
            </div>
            <div className="bg-base-200 border border-base-300 rounded-lg shadow-md p-6 space-y-6">
              {/* Dates Skeleton */}
              <div>
                <div className="skeleton h-6 w-32 mb-2"></div>
                <div className="skeleton h-4 w-48 mb-1"></div>
                <div className="skeleton h-4 w-48"></div>
              </div>
              {/* Age Skeleton */}
              <div>
                <div className="skeleton h-6 w-32 mb-2"></div>
                <div className="skeleton h-4 w-48"></div>
              </div>
              {/* Tithi Skeleton */}
              <div>
                <div className="skeleton h-6 w-32 mb-2"></div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="skeleton rounded-full w-16 h-16"></div>
                  <div>
                    <div className="skeleton h-4 w-32 mb-1"></div>
                    <div className="skeleton h-4 w-24"></div>
                  </div>
                </div>
              </div>
              {/* Sun Data Skeleton */}
              <div>
                <div className="skeleton h-6 w-32 mb-2"></div>
                <div className="skeleton h-4 w-48 mb-1"></div>
                <div className="skeleton h-4 w-48"></div>
              </div>
            </div>
          </div>
        ) : !panchang && !error ? (
          // Form
          <form onSubmit={handleSubmit} className="space-y-6 my-4">
            {/* Date type toggle */}
            <div className="flex justify-around">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="AD"
                  checked={dateType === "AD"}
                  onChange={() => setDateType("AD")}
                  className="radio text-red-600 radio-sm"
                />
                <span className="text-xl">🇬🇧</span>
                <span className="text-sm sm:text-base">{t("English")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="BS"
                  checked={dateType === "BS"}
                  onChange={() => setDateType("BS")}
                  className="radio text-red-600 radio-sm"
                />
                <span className="text-2xl">🇳🇵</span>
                <span className="text-sm sm:text-base">{t("Nepali")}</span>
              </label>
            </div>

            {/* AD Date selector */}
            {dateType === "AD" && (
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <select
                  value={adYear}
                  onChange={(e) => setAdYear(+e.target.value)}
                  className="select select-bordered w-full bg-base-100 text-sm sm:text-base focus:ring-2 focus:ring-red-500"
                >
                  {Array.from(
                    { length: 120 },
                    (_, i) => now.getFullYear() - i
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  value={adMonth}
                  onChange={(e) => setAdMonth(+e.target.value)}
                  className="select select-bordered w-full bg-base-100 text-sm sm:text-base focus:ring-2 focus:ring-red-500"
                >
                  {AD_MONTHS_ENGLISH.map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={adDay}
                  onChange={(e) => setAdDay(+e.target.value)}
                  className="select select-bordered w-full bg-base-100 text-sm sm:text-base focus:ring-2 focus:ring-red-500"
                >
                  {Array.from(
                    { length: getDaysInADMonth(adYear, adMonth) },
                    (_, i) => i + 1
                  ).map((d) => (
                    <option key={d} value={d + 1}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* BS Date selector */}
            {dateType === "BS" && (
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <select
                  value={bsYear}
                  onChange={(e) => setBsYear(+e.target.value)}
                  className="select select-bordered w-full bg-base-100 text-sm sm:text-base focus:ring-2 focus:ring-red-500"
                >
                  {Array.from(
                    { length: 100 },
                    (_, i) => todayBS.getYear() - i
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  value={bsMonth}
                  onChange={(e) => setBsMonth(+e.target.value)}
                  className="select select-bordered w-full bg-base-100 text-sm sm:text-base focus:ring-2 focus:ring-red-500"
                >
                  {BS_MONTHS_NEPALI.map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={bsDay}
                  onChange={(e) => setBsDay(+e.target.value)}
                  className="select select-bordered w-full bg-base-100 text-sm sm:text-base focus:ring-2 focus:ring-red-500"
                >
                  {Array.from(
                    { length: getDaysInBSMonth(bsYear, bsMonth) },
                    (_, i) => i + 1
                  ).map((d) => (
                    <option key={d} value={d + 1}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Time input */}
            <div>
              <label
                htmlFor="time"
                className="flex items-center gap-2 text-sm sm:text-base font-medium mb-2"
              >
                <Alarm size={18} className="text-red-700" />
                <span>{t("Time of Death")}</span>
              </label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="input input-bordered w-full bg-base-100 text-sm sm:text-base focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg text-sm sm:text-base">
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn w-full border border-red-700 bg-base-200 text-red-700 active:bg-red-800 active:text-white font-semibold py-2 sm:py-3 rounded-lg transition-colors duration-200"
              disabled={isLoading}
            >
              {t("Get Shradh Tithi")}
            </button>
          </form>
        ) : (
          // Results
          <div className="mt-8 space-y-6">
            {error ? (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg text-sm sm:text-base">
                <span>{error}</span>
                <button
                  onClick={handleBackToForm}
                  className="btn btn-outline btn-sm bg-gray-100 hover:bg-gray-200 text-red-700 font-semibold rounded-lg mt-4"
                >
                  {t("Back to Form")}
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <button
                    onClick={() => changeDay(-1)}
                    className="btn btn-outline btn-sm bg-base-100 hover:bg-base-200 text-red-700 font-semibold rounded-lg"
                    disabled={isLoading}
                  >
                    <CaretLeft size={20} weight="bold" /> {t("Previous Day")}
                  </button>
                  <button
                    onClick={handleBackToForm}
                    className="btn btn-outline btn-sm bg-base-100 hover:bg-base-200 text-red-700 font-semibold rounded-lg"
                  >
                    <Calendar size={20} weight="bold" /> {t("Change Date")}
                  </button>
                  <button
                    onClick={() => changeDay(1)}
                    className="btn btn-outline btn-sm bg-base-100 hover:bg-base-200 text-red-700 font-semibold rounded-lg"
                    disabled={isLoading}
                  >
                    {t("Next Day")} <CaretRight size={20} weight="bold" />
                  </button>
                </div>

                <div className="bg-base-100 space-y-6">
                  {/* Tithi */}
                  <div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="rounded-full w-16 h-16 bg-base-100 flex items-center justify-center shadow-md">
                        <span className="text-4xl font-bold text-red-500 customfont">
                          {TITHI_TO_NEPALI_NUM[panchang?.Tithi?.name_en_IN] ||
                            "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-md sm:text-base">
                          {tithi(`${panchang?.Tithi?.name_en_IN}`)} {t("Tithi")}
                        </p>
                        <p className="text-sm text-gray-600">
                          {t(`${panchang?.Paksha?.name_en_IN}`)} {t("Paksha")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* moon */}
                  <div className="flex flex-col justify-center py-2 bg-base-100 rounded border border-base-300 px-1 flex justify-items-center mx-auto">
                    


 <div className="relative flex justify-center py-2">
  {/* Moon image */}
  <img
   src={`/moon/${panchang?.Paksha?.name_en_IN}/${panchang?.Tithi?.name_en_IN}.png`}
                      alt={panchang?.Paksha.name_en_IN}
                      className="w-24 h-24 rounded-full  shadow-2xl"
  />

  {/* Overlay div */}
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="z-10 rounded-full w-16 h-16 bg-none flex items-center justify-center shadow-md">
      <span className="text-4xl font-bold text-red-600 customfont">
		    
        {TITHI_TO_NEPALI_NUM[panchang?.Tithi?.name_en_IN] || "?"}
      </span>
    </div>
  </div>
</div>

		  <span className="text-center ">  {panchang?.Tithi?.name_en_IN} Moon</span>
                  </div>
                  <div className=" text-center text-lg  font-medium">
                    {t(`nepaliMonths.${BS_MONTHS_NEPALI[bsMonth]}`)}{" "}
                    {t(`${panchang?.Paksha?.name_en_IN}`)}{" "}
                    {t(`tithi.${panchang?.Tithi?.name_en_IN}`)}
                  </div>

                  {/* Dates */}
                  <div>
                    <div className="flex gap-1">
                      {(() => {
                        try {
                          const bs = NepaliDate.fromAD(new Date(dob));
                          return (
                            <p className="text-sm sm:text-base  border border-base-200 bg-base-200 rounded p-1 flex-[.5]">
                              <span className="text-xl">🇳🇵</span>
                              {BS_MONTHS_NEPALI[bs.getMonth()]} {bs.getDate()},{" "}
                              {bs.getYear()}
                            </p>
                          );
                        } catch {
                          return null;
                        }
                      })()}
                      <p className="text-sm sm:text-base border border-base-200 bg-base-200 rounded p-1 flex-[.5]">
                        <span className="text-lg"> 🇬🇧 </span>
                        {formatEnglishDate(dob)}
                      </p>
                    </div>
                  </div>

                  {/* Age */}
                  {age && (
                    <div className="border border-base-200 bg-base-200 rounded p-2">
                      <p className="text-sm sm:text-base flex items-center gap-2">
                        {" "}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-clock"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
                          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0" />
                        </svg>
			  <span className="flex">
                        {age.years} {t("years")} {age.months} {t("months")}{" "}
                        {age.days} {t("days")}</span>
                      </p>
                    </div>
                  )}

                  {/* Sun Data */}
                  {sunData && (
                    <div className="flex gap-2">
                      <p className="text-sm sm:text-base border border-base-200 bg-base-200 rounded p-2 flex justify-items-center mx-auto gap-2 ">
                        {" "}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="currentColor"
                          className="bi bi-sunrise"
                          viewBox="0 0 16 16"
                        >
                          <path d="M7.646 1.146a.5.5 0 0 1 .708 0l1.5 1.5a.5.5 0 0 1-.708.708L8.5 2.707V4.5a.5.5 0 0 1-1 0V2.707l-.646.647a.5.5 0 1 1-.708-.708zM2.343 4.343a.5.5 0 0 1 .707 0l1.414 1.414a.5.5 0 0 1-.707.707L2.343 5.05a.5.5 0 0 1 0-.707m11.314 0a.5.5 0 0 1 0 .707l-1.414 1.414a.5.5 0 1 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0M8 7a3 3 0 0 1 2.599 4.5H5.4A3 3 0 0 1 8 7m3.71 4.5a4 4 0 1 0-7.418 0H.499a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1h-3.79zM0 10a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 0 10m13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                        </svg>{" "}
                        {sunData.sunrise}
                      </p>
                      <p className="text-sm sm:text-base bg-base-200 rounded rounded border border-base-200 p-2 flex justify-items-center mx-auto gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="currentColor"
                          className="bi bi-sunset"
                          viewBox="0 0 16 16"
                        >
                          <path d="M7.646 4.854a.5.5 0 0 0 .708 0l1.5-1.5a.5.5 0 0 0-.708-.708l-.646.647V1.5a.5.5 0 0 0-1 0v1.793l-.646-.647a.5.5 0 1 0-.708.708zm-5.303-.51a.5.5 0 0 1 .707 0l1.414 1.413a.5.5 0 0 1-.707.707L2.343 5.05a.5.5 0 0 1 0-.707zm11.314 0a.5.5 0 0 1 0 .706l-1.414 1.414a.5.5 0 1 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zM8 7a3 3 0 0 1 2.599 4.5H5.4A3 3 0 0 1 8 7m3.71 4.5a4 4 0 1 0-7.418 0H.499a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1h-3.79zM0 10a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 0 10m13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                        </svg>{" "}
                        {sunData.sunset}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

{/* Table */}

<div className="overflow-x-auto">
<h3 className="  text-center text-lg  font-medium">2025 Shradh Paksha</h3>
<table className="table table-zebra w-full border border-base-300 rounded-lg shadow">

<thead className="bg-red-600 text-white">

<tr>
	<th>S No.</th>

<th>Date</th>

<th>Day</th>

<th>Tithi / Shradh</th>

</tr>

</thead>

<tbody>

{shradhList.map((item, index) => (

<tr key={index}>
	<td className="border border-base-900" > 
{index + 1}</td>

<td className="font-medium flex border border-base-900 ">{item.date} 2025</td>

<td className="border border-base-900">{item.day}</td>

<td className="border border-base-900">{item.tithi}</td>

</tr>

))}

</tbody>

</table>

</div>



</div>



      {/*    <ScrollTop />*/}
    </div>
	</>
  );
}












