"use client";
import { useEffect, useState } from "react";

export default function SunMoonCycle({ lat, lng, imgSrc }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const [locationNow, setLocationNow] = useState(null);
  const [formattedTime, setFormattedTime] = useState("");

  useEffect(() => {
    if (lat && lng) {
      fetchData(lat, lng);
    }
  }, [lat, lng]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (data?.[0]?.timezone) {
        const now = new Date();
        const timeStr = new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: data[0].timezone,
        }).format(now);
        setFormattedTime(timeStr);

        const localTimeStr = new Intl.DateTimeFormat("en-US", {
          hour12: false,
          timeZone: data[0].timezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(now);
        const [month, day, year, hour, minute, second] =
          localTimeStr.match(/\d+/g);
        const locNow = new Date(
          `${year}-${month}-${day}T${hour}:${minute}:${second}`
        );
        setLocationNow(locNow);
      }
    }, 1000); // update every second
    return () => clearInterval(interval);
  }, [data]);

  const fetchData = async (lat, lng) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (d) => d.toISOString().split("T")[0]; // "YYYY-MM-DD"

    const url = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&timezone=auto&date_start=${formatDate(
      today
    )}&date_end=${formatDate(tomorrow)}`;

    try {
      const res = await fetch(url);
      const json = await res.json();
      setData(json.results);
      setStatus("Success");
    } catch {
      setStatus("Failed to fetch data");
    }
  };

  const parseTime = (str, dateStr) => {
    const date = new Date(`${dateStr} ${str}`);
    return isNaN(date.getTime()) ? null : date;
  };

  const getPercentage = (start, end, now) => {
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.max(0, Math.min(100, ((elapsed / total) * 100).toFixed(1)));
  };

  if (status !== "Success" || !data?.length || !locationNow)
    return <p>{status}</p>;

  const today = data[0];
  const tomorrow = data[1];

  const dawn = parseTime(today.dawn, today.date);
  const sunrise = parseTime(today.sunrise, today.date);
  const sunset = parseTime(today.sunset, today.date);
  const dusk = parseTime(today.dusk, today.date);
  const nextDawn = parseTime(tomorrow.dawn, tomorrow.date);

  const isDay = locationNow >= dawn && locationNow <= dusk;

  const progress = isDay
    ? getPercentage(dawn, dusk, locationNow)
    : locationNow > dusk
      ? getPercentage(dusk, nextDawn, locationNow)
      : getPercentage(dusk, dawn, locationNow);

  return (
    <div className="max-w-3xl mx-auto rounded-xl bg-base-100 text-center border border-base-300">
      <h2 className="text-xl font-bold">
        {isDay ? "DayTime" : "NightTime"} Cycle
      </h2>

      <div className="flex flex-wrap justify-around gap-2 text-sm sm:text-base my-2">
        {isDay ? (
          <div className="flex items-center justify-evenly">
            <Tile label="Dawn" value={today.dawn} />
            <Tile label="Sunrise" value={today.sunrise} />
            <div className="flex flex-col items-center justify-center">
              <div className="text-5xl animate-spin-slow">
                <img src={imgSrc} alt="day" />
              </div>
              <span className="text-xs text-base-900 border border-base-300 rounded p-1">
                {formattedTime}
              </span>
            </div>
            <Tile label="Sunset" value={today.sunset} />
            <Tile label="Dusk" value={today.dusk} />
          </div>
        ) : (
          <div className="flex items-center justify-around">
            <Tile label="Sunset" value={today.sunset} />
            <Tile label="Dusk" value={today.dusk} />
            <div className="flex flex-col items-center justify-center">
              <div className="text-5xl animate-spin-slow">
                <img src={imgSrc} alt="night" />
              </div>
              <span className="text-xs text-base-900 border border-base-300 rounded p-1">
                {formattedTime}
              </span>
            </div>
            <Tile label="Dawn" value={tomorrow.dawn} />
            <Tile label="Sunrise" value={tomorrow.sunrise} />
          </div>
        )}
      </div>

      <div className="w-full mx-2 bg-base-200 h-4 rounded-full overflow-hidden border border-base-300">
        <div
          className={`h-full ${isDay ? "bg-yellow-500" : "bg-indigo-600"}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <p className="text-xs border border-base-300 rounded inline p-1 m-1 mb-4">
        {progress}% of{" "}
        {isDay ? (
          <>
            {today.day_length.slice(0, 2)} hours {today.day_length.slice(3, 5)}{" "}
            minutes {today.day_length.slice(6, 8)} seconds long day
          </>
        ) : (
          "night"
        )}{" "}
        passed.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-1 mx-2">
        <InfoTile label="First Light" value={today.first_light} />
        <InfoTile label="Last Light" value={today.last_light} />
        <InfoTile label="Solar Noon" value={today.solar_noon} />
        <InfoTile label="Golden Hour" value={today.golden_hour} />
      </div>

      <p className="text-xs text-left text-base-800 border border-base-300 p-1 m-2 rounded">
        This data is for your live location of timezone {today.timezone}, for
        UTC offset {today.utc_offset} as of {today.date}.
      </p>

      <button className="border border-base-300 rounded px-1.5 text-sm">
        See Data for whole month
      </button>
    </div>
  );
}

function Tile({ label, value }) {
  return (
    <div className="flex flex-col items-center border border-base-300 rounded-xl bg-base-100">
      <div className="text-sm font-semibold text-base-800">{label}</div>
      <div className="text-xs text-base-900">{value}</div>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="bg-base-100 p-2 rounded-2xl shadow-md border border-base-300">
      <p className="text-sm text-gray-500 font-semibold">{label}</p>
      <span className="text-md font-bold">{value}</span>
    </div>
  );
}
