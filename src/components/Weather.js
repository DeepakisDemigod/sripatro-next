
"use client";
import React, { useState, useEffect } from "react";
import useTypewriter from "@/hooks/useTypewriter";
import Saita from "./Saita"

import {
  ThermometerSimple,
  Wind,
  Drop,
  Compass,
  ArrowsClockwise,
  Sun,
  Eye,
  Gauge,
} from "phosphor-react";

const API_KEY = "ce549ad848684bb2852155006230309";

export default function WeatherApp() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const exampleUrls = [
    "Milan, Lombardia, Italy",
    "Gorkha, Gandaki Province, Nepal",
    "Jaipur, Rajasthan, India",
    "Sydney, New South Wales, Australia",
    "New York, United States of America",
  ];
  const placeholderText = useTypewriter(exampleUrls, 50);

  // Fetch autocomplete results
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 2) {
        fetch(
          `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`
        )
          .then((res) => res.json())
          .then((data) => setSuggestions(data))
          .catch((err) => console.error("Autocomplete error:", err));
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Fetch weather forecast
  const fetchWeather = async (location) => {
    setLoading(true);
    setSuggestions([]);
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=1&aqi=yes&alerts=yes`
      );
      const data = await res.json();
	    console.log(data)
      setWeather(data);
      setQuery("")
    } catch (error) {
      console.error("Error fetching weather:", error);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
 fetchWeather("Gorkha, Nepal")
},[])

  return (
    <div className="max-w-3xl mx-auto p-4">
	  <div className="flex flex-col bg-base-100 border border-base-300 rounded relative  mx-auto px-2 mb-6">
  <div className="flex items-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="25"
      fill="#ccc"
      viewBox="0 0 256 256"
    >
      <path d="M112,80a16,16,0,1,1,16,16A16,16,0,0,1,112,80ZM64,80a64,64,0,0,1,128,0c0,59.95-57.58,93.54-60,94.95a8,8,0,0,1-7.94,0C121.58,173.54,64,140,64,80Zm16,0c0,42.2,35.84,70.21,48,78.5,12.15-8.28,48-36.3,48-78.5a48,48,0,0,0-96,0Zm122.77,67.63a8,8,0,0,0-5.54,15C213.74,168.74,224,176.92,224,184c0,13.36-36.52,32-96,32s-96-18.64-96-32c0-7.08,10.26-15.26,26.77-21.36a8,8,0,0,0-5.54-15C29.22,156.49,16,169.41,16,184c0,31.18,57.71,48,112,48s112-16.82,112-48C240,169.41,226.78,156.49,202.77,147.63Z" />
    </svg>
    <input
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={placeholderText}
      className="w-full p-2 rounded bg-base-100 font-thin outline-none"
    />
  </div>

  {suggestions.length > 0 && (
    <ul className="absolute top-full mt-1 border border-base-300 backdrop-blur-sm z-10 rounded w-full max-h-70 overflow-y-auto backdrop-bg-sm">
      {suggestions.map((loc) => (
        <li
          key={loc.id}
          className="flex items-center gap-2 p-2 hover:bg-blue-100 cursor-pointer"
          onClick={() => {
            setQuery(`${loc.name}, ${loc.country}`);
            fetchWeather(`${loc.lat},${loc.lon}`);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="#ccc"
            viewBox="0 0 256 256"
          >
            <path d="M184,72a56,56,0,1,0-64,55.42V232a8,8,0,0,0,16,0V127.42A56.09,56.09,0,0,0,184,72Zm-56,40a40,40,0,1,1,40-40A40,40,0,0,1,128,112Z" />
          </svg>
          {loc.name}, {loc.region}, {loc.country}
        </li>
      ))}
    </ul>
  )}
</div>


      {loading && <div className="flex items-center justify-center  h-[30vh]"><span className="loading loading-spinner loading-lg">Getting Data ...</span></div>}

	  {weather?.alerts?.alert?.length > 0 && (
  <div className="space-y-4 mb-4">
    {weather.alerts.alert
      // remove duplicates (optional, but helpful)
      .filter((alert, index, self) =>
        index === self.findIndex(a =>
          a.event === alert.event && a.expires === alert.expires
        )
      )
      .map((alert, i) => (
        <div key={i} className="bg-red-100 border-l-4 border-red-500 p-2 rounded h-20 overflow-scroll">
          <h2 className="font-bold text-red-800 mb-1">{alert.headline}</h2>
          <p className="text-sm whitespace-pre-wrap text-red-900">{alert.desc.trim()}</p>
          <p className="text-xs mt-2 text-red-800 font-medium">
            <strong>Instructions:</strong> {alert.instruction.trim()}
          </p>
        </div>
      ))}
  </div>
)}


      {weather ? (
        <div>
          <div className="bg-base-100 rounded border border-base-300 p-4 mb-6">
            <h2 className="text-xl font-semibold mb-2">
              {weather.location.name}, {weather.location.region}{" "}
              {weather.location.country}{" "}
              <span className="text-sm font-medium border border-base-300 rounded px-1">
                {weather.location.tz_id}
              </span>
            </h2>
            <div className="flex items-center gap-4">
              <img src={weather.current.condition.icon} alt="weather icon"  />
              <div>
                <p className="text-3xl font-bold">{weather.current.temp_c}°C</p>
		<p className="text-3xl font-bold">feels like: {weather.current.feelslike_c}°C</p>
                <p className="text-base-800">
                  {weather.current.condition.text}
                </p>
                <p className="text-sm text-base-900">
                   Wind: {weather.current.wind_kph} KpH |  Precip: {weather.current.precip_in} In | Humidity:{" "}
                  {weather.current.humidity}%
                </p>
              </div>
            </div>
          </div>



	   
	      <Saita lat={weather.location.lat} lng={weather.location.lon} />




          <h3 className="text-lg font-bold mb-2">Hourly Forecast (24 hours)</h3>
          <div className="flex overflow-scroll">
            {weather.forecast.forecastday[0].hour.map((hour) => (
              <div
                key={hour.time_epoch}
                className="bg-base-100 rounded border border-base-300 p-2 text-center"
              >
                <p className="text-sm font-medium">
                  {new Date(hour.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <img
                  src={hour.condition.icon}
                  alt={hour.condition.text}
                  className="mx-auto"
                />
                <p className="text-sm">{hour.temp_c}°C</p>
                <p className="text-xs text-gray-600">{hour.condition.text}</p>
              </div>
            ))}
          </div>
	    

<h3 className="text-lg font-semibold text-base-900 my-4">Additional Information For Day</h3>

<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
  {/* Tile */}
  <div className="flex flex-col items-start gap-1 p-4 bg-base-100 border border-base-300 rounded">
    <span className="text-sm font-semibold text-base-800 flex items-center gap-1">
      <Drop size={19} /> Dew Point
    </span>
    <span className="text-xl font-bold text-base-900">
      {weather.current.dewpoint_c}°C | {weather.current.dewpoint_f}°F

    </span>
  </div>


  <div className="flex flex-col items-start gap-1 p-4 bg-base-100 border border-base-300 rounded">
    <span className="text-sm font-semibold text-base-800 flex items-center gap-1">
      <ThermometerSimple size={19} /> Heat Index
    </span>
    <span className="text-lg font-bold text-base-900">
      {weather.current.heatindex_c}°C |       {weather.current.heatindex_f}°F

    </span>
  </div>



  <div className="flex flex-col items-start gap-1 p-4 bg-base-100 border border-base-300 rounded">
    <span className="text-sm font-semibold text-base-800 flex items-center gap-1">
      <Wind size={19} /> Wind Chill
    </span>
    <span className="text-lg font-bold text-base-900">
      {weather.current.windchill_c}°C | {weather.current.windchill_f}°F 
    </span>
  </div>

  <div className="flex flex-col items-start gap-1 p-4 bg-base-100 border border-base-300 rounded">
    <span className="text-sm font-semibold text-base-800 flex items-center gap-1">
      <Wind size={19} /> Gust
    </span>
    <span className="text-lg font-bold text-base-900">
      {weather.current.gust_kph} KpH |       {weather.current.gust_mph} MpH  
    </span>
  </div>





  <div className="flex flex-col items-start gap-1 p-4 bg-base-100 border border-base-300 rounded">
    <span className="text-sm font-semibold text-base-800 flex items-center gap-1">
      <Gauge size={19} /> Pressure
    </span>
    <span className="text-lg font-bold text-base-900">
      {weather.current.pressure_in} In | {weather.current.pressure_mb} mB

    </span>
  </div>



  <div className="flex flex-col items-start gap-1 p-4 bg-base-100 border border-base-300 rounded">
    <span className="text-sm font-semibold text-base-800 flex items-center gap-1">
      <Eye size={19} /> Visibility
    </span>
    <span className="text-lg font-bold text-base-900">
      {weather.current.vis_km} Km |  {weather.current.vis_miles} Mi

    </span>
  </div>



  <div className="flex flex-col items-start gap-1 p-4 bg-base-100 border border-base-300 rounded">
    <span className="text-sm font-semibold text-base-800 flex items-center gap-1">
      <Compass size={19} /> Wind Degree
    </span>
    <span className="text-lg font-bold text-base-900">
      {weather.current.wind_degree}°
    </span>
  </div>

  <div className="flex flex-col items-start gap-1 p-4 bg-base-100 border border-base-300 rounded">
    <span className="text-sm font-semibold text-base-800 flex items-center gap-1">
      <Compass size={19} /> Wind Dir
    </span>
    <span className="text-lg font-bold text-base-900">
      {weather.current.wind_dir}
    </span>
  </div>


  <div className="flex flex-col items-start gap-1 p-4 bg-base-100 border border-base-300 rounded">
    <span className="text-sm font-semibold text-base-800 flex items-center gap-1">
      <Sun size={19} /> UV Index
    </span>
    <span className="text-lg font-bold text-base-900">
      {weather.current.uv}
    </span>
  </div>

</div>





        </div>
      ) : (
 <div className="flex flex-col bg-base-100 border border-base-300 rounded relative max-w-sm mx-auto px-2 mb-6 h-30 "></div>

      )}
    </div>
  );
}
