"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const choghadiyaData = {
  day: [
    ["Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"], // Sunday
    ["Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit"], // Monday
    ["Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog"], // Tuesday
    ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh"], // Wednesday
    ["Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh"], // Thursday
    ["Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char"], // Friday
    ["Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal"], // Saturday
  ],
  night: [
    ["Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh"], // Sunday
    ["Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char"], // Monday
    ["Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal"], // Tuesday
    ["Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg"], // Wednesday
    ["Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit"], // Thursday
    ["Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog"], // Friday
    ["Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh"], // Saturday
  ],
};

// Convert HH:MM:SS AM/PM to total seconds since midnight
function timeToSeconds(timeStr) {
  const [time, period] = timeStr.split(" ");
  const [h, m, s] = time.split(":").map(Number);
  let hours = h % 12;
  if (period === "PM" && h !== 12) hours += 12;
  if (period === "AM" && h === 12) hours = 0;
  return hours * 3600 + m * 60 + s;
}

// Convert total seconds to 12-hour format with AM/PM
function secondsTo12HrTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const hour12 = ((h + 11) % 12) + 1;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${hour12.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")} ${ampm}`;
}

// Styling logic
const auspicious = ["Amrit"];
const good = ["Shubh", "Labh"];
const neutral = ["Char"];
const bad = ["Rog", "Udveg"];
const inauspicious = ["Kaal"];

const getCellClass = (value) => {
  if (auspicious.includes(value)) return "bg-[#008000] text-white";
  if (good.includes(value)) return "bg-[#00800050] text-green-900";
  if (neutral.includes(value)) return "bg-[#80808060] text-base-500";
  if (bad.includes(value)) return "bg-[#ff000050] text-red-900";
  if (inauspicious.includes(value)) return "bg-[#ff0000] text-white";
  return "";
};

export default function Choghadiya() {
  const t = useTranslations("ShubhSaita");
  const dayst = useTranslations("days");
  const [daySegments, setDaySegments] = useState([]);
  const [nightSegments, setNightSegments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSunriseSunset = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split("T")[0];

        // Fetch today's and tomorrow's sunrise/sunset times
        const [todayResponse, tomorrowResponse] = await Promise.all([
          fetch(
            `https://api.sunrisesunset.io/json?lat=28.7041&lng=77.1025&date=${today}`
          ),
          fetch(
            `https://api.sunrisesunset.io/json?lat=28.7041&lng=77.1025&date=${tomorrowDate}`
          ),
        ]);

        const todayData = await todayResponse.json();
        const tomorrowData = await tomorrowResponse.json();

        if (todayData.status !== "OK" || tomorrowData.status !== "OK") {
          throw new Error("Failed to fetch sunrise/sunset data");
        }

        const todaySunrise = timeToSeconds(todayData.results.sunrise);
        const todaySunset = timeToSeconds(todayData.results.sunset);
        const tomorrowSunrise = timeToSeconds(tomorrowData.results.sunrise);

        const dayDuration = todaySunset - todaySunrise;
        const nightDuration =
          (24 * 3600 - todaySunset + tomorrowSunrise) % (24 * 3600);
        const segmentDuration = dayDuration / 8;
        const nightSegmentDuration = nightDuration / 8;

        const todayIndex = new Date().getDay();
        const dayNames = choghadiyaData.day[todayIndex];
        const nightNames = choghadiyaData.night[todayIndex];

        // Daytime segments
        const daySegmentsData = Array.from({ length: 8 }).map((_, i) => {
          const segStart = todaySunrise + i * segmentDuration;
          const segEnd = segStart + segmentDuration;
          return {
            start: secondsTo12HrTime(segStart),
            end: secondsTo12HrTime(segEnd),
            name: dayNames[i],
          };
        });

        // Nighttime segments
        const nightSegmentsData = Array.from({ length: 8 }).map((_, i) => {
          const segStart = todaySunset + i * nightSegmentDuration;
          const segEnd = segStart + nightSegmentDuration;
          return {
            start: secondsTo12HrTime(segStart % (24 * 3600)),
            end: secondsTo12HrTime(segEnd % (24 * 3600)),
            name: nightNames[i],
          };
        });

        setDaySegments(daySegmentsData);
        setNightSegments(nightSegmentsData);
        setError(null);
      } catch (err) {
        setError("Error fetching sunrise/sunset data. Using fallback times.");
        // Fallback to static times if API fails
        const startSec = timeToSeconds("05:46:22");
        const endSec = timeToSeconds("19:26:56");
        const dayDuration = endSec - startSec;
        const nightDuration = 24 * 3600 - dayDuration;
        const segmentDuration = dayDuration / 8;
        const nightSegmentDuration = nightDuration / 8;

        const todayIndex = new Date().getDay();
        const dayNames = choghadiyaData.day[todayIndex];
        const nightNames = choghadiyaData.night[todayIndex];

        const daySegmentsData = Array.from({ length: 8 }).map((_, i) => {
          const segStart = startSec + i * segmentDuration;
          const segEnd = segStart + segmentDuration;
          return {
            start: secondsTo12HrTime(segStart),
            end: secondsTo12HrTime(segEnd),
            name: dayNames[i],
          };
        });

        const nightSegmentsData = Array.from({ length: 8 }).map((_, i) => {
          const segStart = endSec + i * nightSegmentDuration;
          const segEnd = segStart + nightSegmentDuration;
          return {
            start: secondsTo12HrTime(segStart % (24 * 3600)),
            end: secondsTo12HrTime(segEnd % (24 * 3600)),
            name: nightNames[i],
          };
        });

        setDaySegments(daySegmentsData);
        setNightSegments(nightSegmentsData);
      }
    };

    fetchSunriseSunset();
  }, []);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <div className=" max-w-3xl mx-auto">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="carousel space-x-2 w-full overflow-x-auto snap-x snap-mandatory">
        <div className=" carousel-item flex flex-col p-2 w-70 bg-base-100 rounded-lg shadow snap-center ">
          <h2 className="text-xl font-bold mb-4 text-center">
            ☀️ आज दिउँसोको चौघडिया
          </h2>
          <table className="table w-full border-collapse mb-8">
            <thead>
              <tr>
                <th className="border p-2">बजे देखी</th>
                <th className="border p-2">बजे सम्म</th>

                <th className="border p-2">सईत</th>
              </tr>
            </thead>
            <tbody>
              {daySegments.map((seg, i) => (
                <tr key={`day-${i}`} className="text-center">
                  <td className="border p-2">{seg.start}</td>
                  <td className="border p-2">{seg.end}</td>

                  <td
                    className={`border p-2 font-semibold ${getCellClass(seg.name)}`}
                  >
                    {t(`${seg.name}`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div  className=" carousel-item flex flex-col p-2 w-70 bg-base-100 rounded-lg shadow snap-center ">
          <h2 className="text-xl font-bold mb-4 text-center">
            🌙 आज रातको चौघडिया
          </h2>
          <table className="table w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">बजे देखी</th>
                <th className="border p-2">बजे सम्म</th>

                <th className="border p-2">सईत</th>
              </tr>
            </thead>
            <tbody>
              {nightSegments.map((seg, i) => (
                <tr key={`night-${i}`} className="text-center">
                  <td className="border p-2">{seg.start}</td>
                  <td className="border p-2">{seg.end}</td>
                  <td
                    className={`border p-2 font-semibold ${getCellClass(seg.name)}`}
                  >
                    {t(`${seg.name}`)}{" "}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="border border-red-600 bg-[#ff000010]  p-4 rounded-lg ">
        <h3 className="font-bold text-lg text-red-800">Legend</h3>
        <div className="flex gap-2 text-sm ">
          {" "}
          <div className="bg-[#008000] rounded w-6 h-6  "></div>
          <p className="text-red-800">Auspicious (Very favorable time, best for important activites)</p>
        </div>
        <div className="flex gap-2 text-sm ">
          {" "}
          <div className="bg-[#00800050] rounded w-6 h-6 "></div>
          <p className="text-red-800">Good (Positive and beneficial, safe for most tasks)</p>
        </div>
        <div className="flex gap-2 text-sm ">
          {" "}
          <div className="bg-gray-300 rounded w-6 h-6 "></div>
          <p className="text-red-800">Neutral (Niether lucky nor unlucky, okay for routine work)</p>
        </div>
        <div className="flex gap-2 text-sm ">
          {" "}
          <div className="bg-[#ff000050] rounded w-6 h-6"></div>
          <p className="text-red-800">Bad (Unfavorable, avoid for significant actions)</p>
        </div>
        <div className="flex gap-2 text-sm ">
          {" "}
          <div className="bg-[#ff0000] rounded w-6 h-6"></div>
          <p className="text-red-800">Inauspicious (very unlucky, avoid starting anything important)</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <h2 className="text-xl font-semibold mb-2">Choghadiya Table (Day)</h2>
        <table className="table-auto border-collapse border border-base-300 w-full mb-6">
          <thead>
            <tr className="bg-base-200">
              <th className="border border-base-300 px-4 py-2">
                {dayst("Day")}
              </th>
              {[...Array(8)].map((_, i) => (
                <th key={i} className="border border-base-300 px-4 py-2">
                  Slot {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {choghadiyaData.day.map((row, i) => (
              <tr key={i}>
                <td className="border border-base-300 px-4 py-2 font-medium">
                  {dayst(`${days[i]}`)}
                </td>
                {row.map((value, j) => (
                  <td
                    key={j}
                    className={`border border-base-300 px-4 py-2 text-center ${getCellClass(value)}`}
                  >
                    {t(`${value}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="text-xl font-semibold mb-2">Choghadiya Table (Night)</h2>
        <table className="table-auto border-collapse border border-base-300 w-full">
          <thead>
            <tr className="bg-base-200">
              <th className="border border-base-300 px-4 py-2">
                {dayst("Day")}
              </th>
              {[...Array(8)].map((_, i) => (
                <th key={i} className="border border-base-300 px-4 py-2">
                  {dayst("Slot")} {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {choghadiyaData.night.map((row, i) => (
              <tr key={i}>
                <td className="border border-base-300 px-4 py-2 font-medium">
                  {dayst(`${days[i]}`)}{" "}
                </td>
                {row.map((value, j) => (
                  <td
                    key={j}
                    className={`border border-base-300 px-4 py-2 text-center ${getCellClass(value)}`}
                  >
                    {t(`${value}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
