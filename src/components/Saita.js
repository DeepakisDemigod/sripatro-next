/*export default function Saita() {
  return (
    <div>
      <h3>अथ प्रतिदिननियम्यानुसाराष्टचोघडिवारचेलाफलम्</h3>
<table border="1" cellPadding="8" cellspacing="0">
  <thead>
    <tr>
      <th>वा</th><th>घ.प्र.</th><th>३:३०</th><th>७:१५</th><th>१०:१५</th><th>१:३०</th><th>४:३०</th><th>७:१५</th><th>१०:१०</th>
    </tr>
    <tr>
      <th>र</th><th>ध.मि.शक</th><th>३:१०</th><th>४:३०</th><th>६:१०</th><th>७:३०</th><th>९:१०</th><th>१०:३०</th><th>१२:१०</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>आ.</td><td>उद्वेग</td><td>चर</td><td>लाभ</td><td>अमृत</td><td>काल</td><td>शुभ</td><td>रोग</td><td>उद्वेग</td></tr>
    <tr><td>सो.</td><td>अमृत</td><td>काल</td><td>शुभ</td><td>रोग</td><td>उद्वेग</td><td>चर</td><td>लाभ</td><td>अमृत</td></tr>
    <tr><td>मं.</td><td>रोग</td><td>उद्वेग</td><td>चर</td><td>लाभ</td><td>अमृत</td><td>काल</td><td>शुभ</td><td>रोग</td></tr>
    <tr><td>बु.</td><td>लाभ</td><td>अमृत</td><td>काल</td><td>शुभ</td><td>रोग</td><td>उद्वेग</td><td>चर</td><td>लाभ</td></tr>
    <tr><td>गु.</td><td>शुभ</td><td>रोग</td><td>उद्वेग</td><td>चर</td><td>लाभ</td><td>अमृत</td><td>काल</td><td>शुभ</td></tr>
    <tr><td>शु.</td><td>चर</td><td>लाभ</td><td>अमृत</td><td>काल</td><td>शुभ</td><td>रोग</td><td>उद्वेग</td><td>चर</td></tr>
    <tr><td>श.</td><td>काल</td><td>शुभ</td><td>रोग</td><td>उद्वेग</td><td>चर</td><td>लाभ</td><td>अमृत</td><td>काल</td></tr>
  </tbody>
</table>

    </div>
  )
i}*/

"use client";
/*
import { useEffect, useState } from 'react';

export default function Saita() {
  const [data, setData] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSunData = async () => {
      const url = 'https://api.sunrisesunset.io/json?lat=38.907192&lng=-77.036873';
      const start = performance.now(); // start time

      try {
        const response = await fetch(url);
        const json = await response.json();
        const end = performance.now(); // end time

        setData(json.results);
        setResponseTime((end - start).toFixed(2)); // in milliseconds
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      }
    };

    fetchSunData();
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ fontFamily: 'Arial', padding: '1rem' }}>
      <h2>Sunrise Sunset Info (Washington, DC)</h2>
      <p><strong>Response Time:</strong> {responseTime} ms</p>
      <ul>
        <li><strong>Sunrise:</strong> {data.sunrise}</li>
        <li><strong>Sunset:</strong> {data.sunset}</li>
        <li><strong>Solar Noon:</strong> {data.solar_noon}</li>
        <li><strong>Golden Hour:</strong> {data.golden_hour}</li>
        <li><strong>Day Length:</strong> {data.day_length}</li>
        <li><strong>Timezone:</strong> {data.timezone}</li>
      </ul>
    </div>
  );
};


*/
/*

import { useEffect, useState } from 'react';

export default function Saita() {
  const [data, setData] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Step 1: Get location from Geolocation API
    const getLocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
        },
        (err) => {
          setError('Permission denied or location unavailable');
          console.error(err);
        }
      );
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (!location) return;

    const fetchSunData = async () => {
      const { lat, lon } = location;
      const url = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}`;
      const start = performance.now();

      try {
        const response = await fetch(url);
        const json = await response.json();
        const end = performance.now();

        if (json.status === 'OK') {
          setData(json.results);
          setResponseTime((end - start).toFixed(2));
        } else {
          setError('Failed to retrieve sun data');
        }
      } catch (err) {
        setError('API request failed');
        console.error(err);
      }
    };

    fetchSunData();
  }, [location]);

  return (
    <div style={{  padding: '1rem' }}>
      <h2>🌞 Sunrise & Sunset Info</h2>

      {!location && !error && <p>Getting your location...</p>}
      {error && <p style={{ color: 'red' }}>⚠️ {error}</p>}
      {location && !data && !error && <p>Fetching sun data...</p>}

      {data && (
        <>
          <p><strong>Response Time:</strong> {responseTime} ms</p>
          <ul>
            <li><strong>Date:</strong> {data.date}</li>
            <li><strong>Sunrise:</strong> {data.sunrise}</li>
            <li><strong>Sunset:</strong> {data.sunset}</li>
            <li><strong>Solar Noon:</strong> {data.solar_noon}</li>
            <li><strong>Golden Hour:</strong> {data.golden_hour}</li>
            <li><strong>Day Length:</strong> {data.day_length}</li>
            <li><strong>Timezone:</strong> {data.timezone}</li>
          </ul>
        </>
      )}
    </div>
  );
};

//export default SunriseSunsetWithLocation;
*/

/*
"use client";

import React, { useEffect, useState } from "react";

export default function Saita() {
  const [responseTime, setResponseTime] = useState(null);
  const [data, setData] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const start = performance.now();
        try {
          const res = await fetch(
            `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}`
          );
          const end = performance.now();
          const timeTaken = (end - start).toFixed(2);

          const json = await res.json();
          setData(json.results);
          setResponseTime(timeTaken);
        } catch (error) {
          setLocationError("Failed to fetch data from API.");
        }
      },
      (err) => {
        setLocationError("Location access denied or unavailable.");
      }
    );
  }, []);

  if (locationError) return <p className="text-red-500">{locationError}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-4 border rounded shadow max-w-md mx-auto mt-4 bg-white text-black">
      <h2 className="text-xl font-semibold mb-2">Sunrise & Sunset Info</h2>
      <ul className="space-y-1">
        <li>📅 Date: {data.date}</li>
        <li>🌅 Sunrise: {data.sunrise}</li>
        <li>🌇 Sunset: {data.sunset}</li>
        <li>🌤 First Light: {data.first_light}</li>
        <li>🌙 Last Light: {data.last_light}</li>
        <li>🌄 Dawn: {data.dawn}</li>
        <li>🌆 Dusk: {data.dusk}</li>
        <li>☀️ Solar Noon: {data.solar_noon}</li>
        <li>🌟 Golden Hour: {data.golden_hour}</li>
        <li>🕒 Day Length: {data.day_length}</li>
        <li>🌐 Timezone: {data.timezone}</li>
        <li>🕰 UTC Offset: {data.utc_offset}</li>
        <li>⏱ API Response Time: {responseTime} ms</li>
      </ul>
    </div>
  );
};
*/

"use client";

import React, { useEffect, useState } from "react";

export default function Saita() {
  const [responseTime, setResponseTime] = useState(null);
  const [data, setData] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const start = performance.now();
        try {
          const res = await fetch(
            `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}`
          );
          const end = performance.now();
          const timeTaken = (end - start).toFixed(4);

          const json = await res.json();
          setData(json.results);
          setResponseTime(timeTaken);
        } catch (error) {
          setLocationError("Failed to fetch data from API.");
        }
      },
      (err) => {
        setLocationError("Location access denied or unavailable.");
      }
    );
  }, []);

  if (locationError) return <p className="text-red-500">{locationError}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-4 border border-base-300 rounded shadow max-w-md mx-auto mt-4 bg-base-100 text-base-800">
      <h2 className="text-xl font-semibold mb-2">Sunrise & Sunset Info</h2>
      <ul className="space-y-1">
        <div className="flex font-thin">
         <li>{data.timezone}</li>
          (<li><abbr title="utc offset">{data.utc_offset}</abbr></li>)        </div>
        <li>🌅 Sunrise: {data.sunrise}</li>
        <li>🌇 Sunset: {data.sunset}</li>
        <li>🌤 First Light: {data.first_light}</li>
        <li>🌙 Last Light: {data.last_light}</li>
        <li>🌄 Dawn: {data.dawn}</li>
        <li>🌆 Dusk: {data.dusk}</li>
        <li>☀️ Solar Noon: {data.solar_noon}</li>
        <li>🌟 Golden Hour: {data.golden_hour}</li>
        <li>🕒 Day Length: {data.day_length}</li>
      </ul>
    </div>
  );
}
