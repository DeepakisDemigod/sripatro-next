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
    <div className="max-w-xl m-4  rounded-xl bg-base-100 text-center border border-base-300 ">
      <h2 className="text-xl font-bold">
        {isDay ? "DayTime" : "NightTime"} Cycle
      </h2>


<div className="flex flex-wrap justify-center gap-2 text-sm sm:text-base my-2">
  {isDay ? (
    <>
      <div className="flex flex-col items-center border border-base-300 rounded-xl  shadow-sm bg-base-100">
        <div className="text-sm font-semibold text-base-800">Dawn</div>
        <div className="text-xs text-base-900">{today.dawn}</div>
      </div>

      <div className="flex flex-col items-center border border-base-300 rounded-xl   shadow-sm bg-base-100">
        <div className="text-sm font-semibold text-base-800">Sunrise</div>
        <div className="text-xs text-base-900">{today.sunrise}</div>
      </div>

      <div className="text-4xl sm:text-5xl flex items-center justify-center">☀️</div>

      <div className="flex flex-col items-center border border-base-300 rounded-xl   shadow-sm bg-base-100">
        <div className="text-sm font-semibold text-base-800">Sunset</div>
        <div className="text-xs text-base-900">{today.sunset}</div>
      </div>

      <div className="flex flex-col items-center border border-base-300 rounded-xl   shadow-sm bg-base-100">
        <div className="text-sm font-semibold text-base-800">Dusk</div>
        <div className="text-xs text-base-900">{today.dusk}</div>
      </div>
    </>
  ) : (
    <>
      <div className="flex flex-col items-center border border-base-300 rounded-xl   shadow-sm bg-base-100">
        <div className="text-sm font-semibold text-base-800">Sunset</div>
        <div className="text-xs text-base-900">{today.sunset}</div>
      </div>

      <div className="flex flex-col items-center border border-base-300 rounded-xl   shadow-sm bg-base-100">
        <div className="text-sm font-semibold text-base-800">Dusk</div>
        <div className="text-xs text-base-900">{today.dusk}</div>
      </div>

      <div className="text-4xl sm:text-5xl flex items-center justify-center ">🌙</div>

      <div className="flex flex-col items-center border border-base-300 rounded-xl   shadow-sm bg-base-100">
        <div className="text-sm font-semibold text-base-800">Dawn</div>
        <div className="text-xs text-base-900">{tomorrow.dawn}</div>
      </div>

      <div className="flex flex-col items-center border border-base-300 rounded-xl   shadow-sm bg-base-100">
        <div className="text-sm font-semibold text-base-800">Sunrise</div>
        <div className="text-xs text-base-900">{tomorrow.sunrise}</div>
      </div>
    </>
  )}
</div>




      <div className="w-full mx-2 bg-base-200 h-4 rounded-full overflow-hidden border border-base-300">
        <div
          className={` h-full ${isDay ? "bg-yellow-500" : "bg-indigo-600"}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs border border-base-300 rounded inline p-1 m-1 mb-4">
        {progress}% of  {isDay ? (<>
{today.day_length.slice(0,2)} {"hours "} {today.day_length.slice(3,5)} {"minutes "}{today.day_length.slice(6,8)} { "seconds  long day " }</>
	) : "night"} passed.

      </p>
	
<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-1 mx-2">
<div className="bg-base-100 p-2 rounded-2xl shadow-md border border-base-300">
    <p className="text-sm text-gray-500 font-semibold">First Light</p>
    <span className="text-md font-bold">{today.first_light}</span>
  </div>

  <div className="bg-base-100 p-2 rounded-2xl shadow-md border border-base-300">
    <p className="text-sm text-gray-500 font-semibold">Last Light</p>
    <span className="text-md font-bold">{today.last_light}</span>
  </div>

  <div className="bg-base-100 p-2 rounded-2xl shadow-md border border-base-300">
    <p className="text-sm text-gray-500 font-semibold">Solar Noon</p>
    <span className="text-md font-bold">{today.solar_noon}</span>
  </div>

  <div className="bg-base-100 p-2 rounded-2xl shadow-md border border-base-300">
    <p className="text-sm text-gray-500 font-semibold">Golden Hour</p>
    <span className="text-md font-bold">{today.golden_hour}</span>
  </div>
</div>
<p className="text-xs text-left text-base-800 border border-base-300 p-1 m-2 rounded">This Data is for your live location of timezone {today.timezone}, for utc offset {today.utc_offset} as of {today.date}.</p>
	<button className="border border-base-300 rounded px-1.5 text-sm">See Data for whole month </button>
    </div>
  );
}

/*
"use client"

import React, { useEffect, useState } from "react";



const API_KEY = "ce549ad848684bb2852155006230309";



function Saita() {

 const [weather, setWeather] = useState(null);

 const [locationError, setLocationError] = useState(null);

 const [loading, setLoading] = useState(true);



 useEffect(() => {

  // Step 1: Get user location

  if (navigator.geolocation) {

   navigator.geolocation.getCurrentPosition(

    (position) => {

     const lat = position.coords.latitude;

     const lon = position.coords.longitude;

     fetchWeather(lat, lon);

    },

    (err) => {

     setLocationError("Location access denied or unavailable.");

     setLoading(false);

    }

   );

  } else {

   setLocationError("Geolocation not supported.");

   setLoading(false);

  }

 }, []);



 // Step 2: Fetch weather data

 const fetchWeather = (lat, lon) => {

  fetch(

   `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=no`

  )

   .then((res) => res.json())

   .then((data) => {

    setWeather(data);

    setLoading(false);

   })

   .catch((err) => {

    console.error("Weather API error:", err);

    setLoading(false);

   });

 };



 if (loading) return <p>Loading weather...</p>;

 if (locationError) return <p>{locationError}</p>;

 if (!weather) return <p>Weather data not available.</p>;



 const {

  location,

  current: {

   temp_c,

   condition,

   humidity,

   wind_kph,

   feelslike_c,

   uv,

   last_updated,

  },

 } = weather;



 return (

  <div style={{ padding: "2rem", fontFamily: "Arial", maxWidth: "400px", margin: "auto" }}>

   <h2>🌦️ Current Weather</h2>

   <p><strong>Location:</strong> {location.name}, {location.country}</p>

   <p><strong>Updated:</strong> {last_updated}</p>

   <img src={`https:${condition.icon}`} alt={condition.text} />

   <p><strong>Condition:</strong> {condition.text}</p>

   <p><strong>Temperature:</strong> {temp_c}°C</p>

   <p><strong>Feels like:</strong> {feelslike_c}°C</p>

   <p><strong>Humidity:</strong> {humidity}%</p>

   <p><strong>Wind:</strong> {wind_kph} kph</p>

   <p><strong>UV Index:</strong> {uv}</p>

  </div>

 );

}



export default Saita;*/

/*
"use client";

import { useEffect, useState } from "react";

const WEATHER_API_KEY = "ce549ad848684bb2852155006230309";

export default function SunMoonCycle() {
  const [data, setData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        fetchSunCycle(coords.latitude, coords.longitude);
        fetchWeather(coords.latitude, coords.longitude);
      },
      () => setStatus("Failed to get location")
    );

    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchSunCycle = async (lat, lng) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (d) => d.toISOString().split("T")[0];

    const url = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&timezone=auto&date_start=${formatDate(
      today
    )}&date_end=${formatDate(tomorrow)}`;

    try {
      const res = await fetch(url);
      const json = await res.json();
      setData(json.results);
      setStatus("Success");
    } catch {
      setStatus("Failed to fetch sun data");
    }
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=no`
      );
      const json = await res.json();
      setWeather(json);
    } catch {
      console.error("Weather fetch failed");
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
  if (!weather) return <p>Loading weather...</p>;

  const today = data[0];
  const tomorrow = data[1];

  const now = currentTime;

  const dawn = parseTime(today.dawn, today.date);
  const dusk = parseTime(today.dusk, today.date);
  const sunrise = parseTime(today.sunrise, today.date);
  const sunset = parseTime(today.sunset, today.date);
  const nextDawn = parseTime(tomorrow.dawn, tomorrow.date);

  const isDay = now >= dawn && now <= dusk;

  const progress = isDay
    ? getPercentage(dawn, dusk)
    : now > dusk
      ? getPercentage(dusk, nextDawn)
      : getPercentage(dusk, dawn);

  const {
    current: {
      condition: { icon, text: conditionText },
    },
  } = weather;

  return (
    <div className="max-w-xl mx-auto mt-6 p-4 rounded-xl shadow bg-base-100 text-center space-y-4">
      <h2 className="text-xl font-bold">{isDay ? "Daytime" : "Nighttime"} Cycle</h2>

      <div className="flex flex-wrap justify-center items-center gap-4 text-sm sm:text-base">
        {isDay ? (
          <>
            <CycleItem label="Dawn" value={today.dawn} />
            <CycleItem label="Sunrise" value={today.sunrise} />

            <div className="carousel rounded-box flex flex-col items-center space-y-2">
              <div className="carousel-item text-5xl">☀️</div>

		<div className="carousel-item">
              <img src={`https:${icon}`} alt={conditionText} className="w-10 h-10 " />
              <div className="text-xs text-gray-600">{conditionText}</div>
		</div>
            </div>

            <CycleItem label="Sunset" value={today.sunset} />
            <CycleItem label="Dusk" value={today.dusk} />
          </>
        ) : (
          <>
            <CycleItem label="Sunset" value={today.sunset} />
            <CycleItem label="Dusk" value={today.dusk} />

            <div className="flex flex-col items-center space-y-2">
              <div className="text-5xl">🌙</div>
              <img src={`https:${icon}`} alt={conditionText} className="w-10 h-10" />
              <div className="text-xs text-gray-600">{conditionText}</div>
            </div>

            <CycleItem label="Dawn" value={tomorrow.dawn} />
            <CycleItem label="Sunrise" value={tomorrow.sunrise} />
          </>
        )}
      </div>

      {/* Arc-style progress (optional styling for bent look) 
      <div className="w-full bg-base-200 h-3 rounded-full overflow-hidden border border-base-300">
        <div
          className={`h-full transition-all duration-700 ${isDay ? "bg-yellow-400" : "bg-indigo-600"}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <p className="text-xs text-base-900">
        {progress}% of{" "}
        {isDay ? (
          <>
            {today.day_length.slice(0, 2)}h {today.day_length.slice(3, 5)}m{" "}
            {today.day_length.slice(6, 8)}s of day passed
          </>
        ) : (
          "night passed"
        )}
      </p>
    </div>
  );
}

const CycleItem = ({ label, value }) => (
  <div className="flex flex-col items-center border border-base-300 rounded-xl p-2 w-24 sm:w-28 shadow-sm bg-base-100">
    <div className="text-xs font-semibold text-base-800">{label}</div>
    <div className="text-xs text-base-900">{value}</div>
  </div>
);
*/
