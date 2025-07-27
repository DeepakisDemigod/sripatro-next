"use client";
import { useEffect, useState } from "react";

export default function SunMoonCycle() {
  const [data, setData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        setStatus("Geolocation not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetchData(latitude, longitude);
        },
        () => setStatus("Failed to get location")
      );
    };

    getLocation();

    const interval = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

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

  const getPercentage = (start, end) => {
    const now = currentTime.getTime();
    const total = end.getTime() - start.getTime();
    const elapsed = now - start.getTime();
    return Math.max(0, Math.min(100, ((elapsed / total) * 100).toFixed(1)));
  };

  if (status !== "Success" || !data?.length) return <p>{status}</p>;

  const today = data[0];
  const tomorrow = data[1];

  const now = currentTime;

  const dawn = parseTime(today.dawn, today.date);
  const sunrise = parseTime(today.sunrise, today.date);
  const sunset = parseTime(today.sunset, today.date);
  const dusk = parseTime(today.dusk, today.date);

  const nextDawn = parseTime(tomorrow.dawn, tomorrow.date);
  const nextSunrise = parseTime(tomorrow.sunrise, tomorrow.date);

  const isDay = now >= dawn && now <= dusk;

  const progress = isDay
    ? getPercentage(dawn, dusk)
    : now > dusk
      ? getPercentage(dusk, nextDawn)
      : getPercentage(dusk, dawn); // before dawn

  return (
    <div className="max-w-xl mx-auto mt-6 p-4 rounded-xl shadow bg-base-100 text-center space-y-4">
      <h2 className="text-xl font-bold">
        {isDay ? "Daytime" : "Nighttime"} Cycle
      </h2>
      <div className="flex justify-between items-center gap-2 text-sm">
        {isDay ? (
          <>
            <div className="border border-base-300 rounded inline p-1 m-1">
              <div>Dawn</div>
              <div>{today.dawn}</div>
            </div>
            <div className="border border-base-300 rounded inline p-1 m-1">
              <div>Sunrise</div>
              <div>{today.sunrise}</div>
            </div>
            <div className="text-3xl">☀️</div>
            <div className="border border-base-300 rounded inline p-1 m-1">
              <div>Sunset</div>
              <div>{today.sunset}</div>
            </div>
            <div className="border border-base-300 rounded inline p-1 m-1">
              <div>Dusk</div>
              <div>{today.dusk}</div>
            </div>
          </>
        ) : (
          <>
            <div className="border border-base-300 rounded inline p-1 m-1">
              <div>Sunset</div>
              <div>{today.sunset}</div>
            </div>
            <div className="border border-base-300 rounded inline p-1 m-1">
              <div>Dusk</div>
              <div>{today.dusk}</div>
            </div>
            <div className="text-3xl">🌙</div>
            <div className="border border-base-300 rounded inline p-1 m-1">
              <div>Dawn</div>
              <div>{tomorrow.dawn}</div>
            </div>
            <div className="border border-base-300 rounded inline p-1 m-1">
              <div>Sunrise</div>
              <div>{tomorrow.sunrise}</div>
            </div>
          </>
        )}
      </div>
      <div className="w-full bg-base-200 h-4 rounded-full overflow-hidden border border-base-300">
        <div
          className={`h-full ${isDay ? "bg-yellow-400" : "bg-indigo-600"}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs border border-base-300 rounded inline p-1 m-1">
        {progress}% of {isDay ? "day" : "night"} passed
      </p>
    </div>
  );
}
