"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image"
import {Wind, DropHalf, Eye, Compass, Sun} from "phosphor-react"

const API_KEY = "ce549ad848684bb2852155006230309";



export default function Weather() {

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
	   console.log(data )	

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
	  temp_f,

   condition,

   humidity,

   wind_kph,

   feelslike_c,

   uv,
	  vis_km,

   last_updated,
	  wind_dir

  },

 } = weather;



 return (

  <div className="border border-base-300 rounded-box p-2 m-4">
	 <div className=" flex items-start justify-between">
	<div><h3 className="text-4xl font-bold">{temp_c}°C</h3><span className="text-xs border border-base-300 text-base-800 px-1 rounded">Feels like {feelslike_c}°C</span></div>

<div>
<Image src={`https:${condition.icon}`} alt={condition.text} width={70} height={70}/>


	 </div>

	 </div>



   <p className="text-sm font-medium text-base-800">{condition.text}</p>
















   <p>{location.name},{location.region}, {location.country}</p>

<p>{location.tz_id}</p>

   

   <p><strong><DropHalf /></strong> {humidity}%</p>

   <p><strong><Wind /></strong> {wind_kph} kph</p>
	 <p><strong><Eye /></strong>{vis_km} km</p>
<p><strong><Compass /></strong>{wind_dir}</p>
   <p><strong><Sun /></strong> {uv}</p>

  </div>

 );

}





