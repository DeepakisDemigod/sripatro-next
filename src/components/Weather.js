"use client";
import React, { useState, useEffect } from "react";
import useTypewriter from "@/hooks/useTypewriter";
import Saita from "./Saita";

import {
  ThermometerSimple,
  Wind,
  Drop,
  Compass,
  Eye,
  Gauge,
  Sun,
} from "phosphor-react";

const API_KEY = "ce549ad848684bb2852155006230309";

export default function WeatherApp() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  // geolocation modal + state
  const [showGeoModal, setShowGeoModal] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null); // 'granted'|'denied'|'prompt'|null
  const [geoError, setGeoError] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [autoFetched, setAutoFetched] = useState(false); // avoid duplicate auto fetch

  const exampleUrls = [
    "Milan, Lombardia, Italy",
    "Gorkha, Gandaki Province, Nepal",
    "Jaipur, Rajasthan, India",
    "Sydney, New South Wales, Australia",
    "New York, United States of America",
  ];
  const placeholderText = useTypewriter(exampleUrls, 50);

  // helper to safely format numbers
  const formatAQ = (v, digits = 1) =>
    v === undefined || v === null || Number.isNaN(Number(v))
      ? "—"
      : Number(v).toFixed(digits);

  // Check permission state on mount and react to changes.
  useEffect(() => {
    let permObj;
    async function checkPermission() {
      if (typeof navigator === "undefined") return;

      if (navigator.permissions?.query) {
        try {
          permObj = await navigator.permissions.query({ name: "geolocation" });
          setPermissionStatus(permObj.state);

          if (permObj.state === "granted") {
            setShowGeoModal(false);
            if (!autoFetched) {
              // best-effort auto fetch once
              requestGeolocation(false);
              setAutoFetched(true);
            }
          } else if (permObj.state === "prompt") {
            setShowGeoModal(true);
          } else if (permObj.state === "denied") {
            setShowGeoModal(false);
            setLocationDenied(true);
          }

          // react to permission changes while page is open
          permObj.onchange = () => setPermissionStatus(permObj.state);
        } catch (e) {
          // Permissions API not available — show modal so user can try
          console.warn("Permissions API not available:", e);
          setShowGeoModal(true);
        }
      } else {
        // Permissions API not available: show the modal so user can try granting location
        setShowGeoModal(true);
      }
    }

    checkPermission();

    return () => {
      if (permObj) permObj.onchange = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // watch permissionStatus and auto-close modal if it becomes granted
  useEffect(() => {
    if (permissionStatus === "granted") {
      setShowGeoModal(false);
      if (!autoFetched) {
        requestGeolocation(false);
        setAutoFetched(true);
      }
    }
    if (permissionStatus === "denied") {
      setShowGeoModal(false);
      setLocationDenied(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionStatus]);

  // autocomplete (unchanged logic)
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

  // Fetch weather forecast (accepts "lat,lon" or location string)
  const fetchWeather = async (location) => {
    setLoading(true);
    setSuggestions([]);
    setGeoError(null);
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=1&aqi=yes&alerts=yes`
      );
      const data = await res.json();
      console.log(data);
      if (data && data.location) {
        setWeather(data);
        setQuery("");
      } else {
        setWeather(null);
        setGeoError("Couldn't fetch weather for that location.");
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
      setWeather(null);
      setGeoError("Network or API error while fetching weather.");
    } finally {
      setLoading(false);
    }
  };

  // Request geolocation when user clicks Allow in modal or when auto-fetching
  const requestGeolocation = (fromUser = true) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation is not available in this browser.");
      setShowGeoModal(false);
      return;
    }

    setGettingLocation(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPermissionStatus("granted");
        setShowGeoModal(false);
        setGettingLocation(false);
        setLocationDenied(false);
        setAutoFetched(true);
        // fetch weather by lat,long
        fetchWeather(`${latitude},${longitude}`);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setGettingLocation(false);
        setShowGeoModal(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setPermissionStatus("denied");
            setLocationDenied(true);
            setGeoError(
              "Location permission denied. You can search a location manually or allow location in your browser settings."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setGeoError("Timed out while trying to get your location.");
            break;
          default:
            setGeoError("An unknown error occurred while retrieving location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60 * 1000 }
    );
  };

  // If user explicitly uses fallback to Gorkha
  const useGorkhaFallback = () => {
    setShowGeoModal(false);
    setLocationDenied(false);
    setGeoError(null);
    fetchWeather("Gorkha, Nepal");
  };

  // Small settings button that re-opens the modal (or lets user retry geolocation)
  const openLocationSettings = () => {
    setShowGeoModal(true);
  };

  const aq = weather?.current?.air_quality;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* ====== GEO PERMISSION MODAL (daisyUI) ====== */}
      <div
        className={`modal ${showGeoModal ? "modal-open" : ""}`}
        aria-hidden={!showGeoModal}
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Allow location for local weather?
          </h3>
          <p className="py-2 text-sm">
            To show weather for your current location (latitude & longitude)
            this site would like to use your device's location. We will only use
            it to fetch weather data (no data is stored).
          </p>

          <div className="text-sm mb-4">
            Permission status:{" "}
            <span className="font-medium">{permissionStatus ?? "unknown"}</span>
          </div>

          {gettingLocation ? (
            <div className="flex items-center gap-2">
              <span className="loading loading-spinner" />
              <span>Getting your location…</span>
            </div>
          ) : (
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => requestGeolocation(true)}
              >
                Allow
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowGeoModal(false);
                  setLocationDenied(true);
                }}
              >
                Deny
              </button>
              <button
                className="btn btn-outline"
                onClick={() => useGorkhaFallback()}
              >
                Use default (Gorkha)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ====== SEARCH BAR / AUTOCOMPLETE + Location settings button ====== */}
      <div className="flex flex-col bg-base-100 border border-base-300 rounded relative mx-auto px-2 mb-6">
        <div className="flex items-center gap-2">
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
            aria-label="Search location"
          />

          {/* small location/settings button */}
          <button
            className={`btn btn-sm btn-ghost ml-2 ${permissionStatus === "granted" ? "btn-success" : ""}`}
            onClick={openLocationSettings}
            title="Location settings / reopen permission modal"
            type="button"
          >
            <Compass size={16} />
            <span className="ml-1 hidden sm:inline">
              {permissionStatus === "granted" ? "Using location" : "Location"}
            </span>
          </button>
        </div>

        {suggestions.length > 0 && (
          <ul className="absolute top-full mt-1 border border-base-300 z-10 rounded w-full max-h-70 overflow-y-auto">
            {suggestions.map((loc, idx) => (
              <li
                key={loc.id ?? idx}
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

      {/* ====== LOADING / ERROR ====== */}
      {loading && (
        <div className="flex items-center justify-center h-[30vh]">
          <span className="loading loading-spinner loading-lg">
            Getting Data ...
          </span>
        </div>
      )}

      {geoError && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
          <p className="text-sm text-yellow-800">{geoError}</p>
          <div className="mt-2 flex gap-2">
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setShowGeoModal(true)}
            >
              Try again
            </button>
            <button className="btn btn-sm" onClick={() => useGorkhaFallback()}>
              Use Gorkha
            </button>
          </div>
        </div>
      )}

      {/* ====== WEATHER DISPLAY (with AQI) ====== */}
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
            <div className="flex items-start gap-4">
              <div className="flex flex-col text-center mt-2">
                <img
                  src={weather.current.condition.icon}
                  alt="weather icon"
                  className="w-[210px]"
                />
                <p className="text-base-800 text-md">
                  {weather.current.condition.text}
                </p>
              </div>

              <div>
                <p className="text-3xl font-bold">{weather.current.temp_c}°C</p>
                <p className="text-3xl font-bold">
                  feels like: {weather.current.feelslike_c}°C
                </p>
                <p className="text-sm text-base-900">
                  Wind: {weather.current.wind_kph} KpH | Precip:{" "}
                  {weather.current.precip_in} In | Humidity:{" "}
                  {weather.current.humidity}%
                </p>

                {/* AQI block - only show if API returned air_quality */}
                {aq && (
                  <div className="mt-2 p-2 bg-base-200 rounded border border-base-300">
                    <div className="text-sm font-medium mb-1">
                      Air Quality (AQI)
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div>PM2.5: {formatAQ(aq.pm2_5)} μg/m³</div>
                      <div>PM10: {formatAQ(aq.pm10)} μg/m³</div>
                      <div>O₃: {formatAQ(aq.o3)} ppb</div>
                      <div>NO₂: {formatAQ(aq.no2)} ppb</div>
                      <div>SO₂: {formatAQ(aq.so2)} ppb</div>
                      <div>CO: {formatAQ(aq.co, 1)} μg/m³</div>
                      <div className="ml-1">
                        US-EPA index: {aq["us-epa-index"] ?? "—"}
                      </div>
                      <div>GB-DEFRA index: {aq["gb-defra-index"] ?? "—"}</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Values from WeatherAPI air_quality.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Saita
            lat={weather.location.lat}
            lng={weather.location.lon}
            imgSrc={weather.current.condition.icon}
          />

          <h3 className="text-lg font-bold mb-2">Hourly Forecast (24 hours)</h3>
          <div className="flex overflow-scroll gap-2">
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

          <h3 className="text-lg font-semibold text-base-900 my-4">
            Additional Information For Day
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-start gap-1 p-4 bg-base-100 border border-base-300 rounded">
              <span className="text-sm font-semibold text-base-content/60 flex items-center gap-1">
                <Drop size={19} /> Dew Point
              </span>
              <span className="text-xl font-bold text-base-900">
                {weather.current.dewpoint_c}°C | {weather.current.dewpoint_f}°F
              </span>
            </div>

            <div className="flex flex-col items-start gap-1 p-4 bg-base-100 border border-base-300 rounded">
              <span className="text-sm font-semibold text-base-content/60 flex items-center gap-1">
                <ThermometerSimple size={19} /> Heat Index
              </span>
              <span className="text-lg font-bold text-base-900">
                {weather.current.heatindex_c}°C | {weather.current.heatindex_f}
                °F
              </span>
            </div>

            <div className="flex flex-col items-start gap-1 p-4 bg-base-100 border border-base-300 rounded">
              <span className="text-sm font-semibold text-base-content/60 flex items-center gap-1">
                <Wind size={19} /> Wind Chill
              </span>
              <span className="text-lg font-bold text-base-900">
                {weather.current.windchill_c}°C | {weather.current.windchill_f}
                °F
              </span>
            </div>

            <div className="flex flex-col items-start gap-1 p-4 bg-base-100 border border-base-300 rounded">
              <span className="text-sm font-semibold text-base-content/60 flex items-center gap-1">
                <Wind size={19} /> Gust
              </span>
              <span className="text-lg font-bold text-base-900">
                {weather.current.gust_kph} KpH | {weather.current.gust_mph} MpH
              </span>
            </div>

            <div className="flex flex-col items-start gap-1 p-4 bg-base-100 border border-base-300 rounded">
              <span className="text-sm font-semibold text-base-content/60 flex items-center gap-1">
                <Gauge size={19} /> Pressure
              </span>
              <span className="text-lg font-bold text-base-900">
                {weather.current.pressure_in} In | {weather.current.pressure_mb}{" "}
                mB
              </span>
            </div>

            <div className="flex flex-col items-start gap-1 p-4 bg-base-100 border border-base-300 rounded">
              <span className="text-sm font-semibold text-base-content/60 flex items-center gap-1">
                <Eye size={19} /> Visibility
              </span>
              <span className="text-lg font-bold text-base-900">
                {weather.current.vis_km} Km | {weather.current.vis_miles} Mi
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
        <div className="flex flex-col bg-base-100 border border-base-300 rounded relative max-w-sm mx-auto px-2 mb-6 h-30 " />
      )}
    </div>
  );
}
