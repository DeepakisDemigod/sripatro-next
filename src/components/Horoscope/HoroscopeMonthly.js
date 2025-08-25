/*"use client"

import { useEffect, useState } from "react";
import { Play, Pause, CaretDown, CaretUp, ThumbsUp, ThumbsDown } from "phosphor-react";
import { useSpeech } from "react-text-to-speech";
//import ScrollTop from "./ScrollTop.jsx";

function HoroscopeMonthly() {
  const [horoscopeData, setHoroscopeData] = useState({});
  const [error, setError] = useState(null);
  const [activeSign, setActiveSign] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  const zodiacSigns = [
    { sign: "aries", emoji: "🐏" },
    { sign: "taurus", emoji: "🐂" },
    { sign: "gemini", emoji: "👬" },
    { sign: "cancer", emoji: "🦀" },
    { sign: "leo", emoji: "🦁" },
    { sign: "virgo", emoji: "🧚" },
    { sign: "libra", emoji: "⚖️" },
    { sign: "scorpio", emoji: "🦂" },
    { sign: "sagittarius", emoji: "🐎" },
    { sign: "capricorn", emoji: "🐐" },
    { sign: "aquarius", emoji: "💧" },
    { sign: "pisces", emoji: "🐟" },
  ];

  useEffect(() => {
    const fetchHoroscopes = async () => {
      setError(null);
      setLoading(true);
      try {
        const responses = await Promise.all(
          zodiacSigns.map(({ sign }) =>
            fetch("https://sripatro-server.vercel.app/get-horoscope-monthly", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sign }),
            }).then((res) => res.json().then((data) => ({ sign, data })))
          )
        );

        const updatedHoroscopeData = responses.reduce((acc, { sign, data }) => {
          acc[sign] = data;
          return acc;
        }, {});

        setHoroscopeData(updatedHoroscopeData);
      } catch (err) {
        console.error("Error fetching horoscope:", err);
        setError("Failed to fetch horoscope.");
      }
      setLoading(false);
    };

    fetchHoroscopes();
  }, []);

  const { speechStatus, start, pause } = useSpeech({
    text: horoscopeData[activeSign]?.data?.horoscope_data || "",
    pitch: 1,
    rate: 1,
    volume: 1,
    lang: "en_GB",
    voiceURI: "Hindi India",
    autoPlay: false,
    highlightText: false,
  });

  const toggleSpeech = (sign) => {
    if (activeSign === sign && speechStatus === "started") {
      pause();
    } else {
      setActiveSign(sign);
      start();
    }
  };

  const toggleExpand = (sign) => {
    setExpanded((prev) => ({ ...prev, [sign]: !prev[sign] }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="min-h-screen bg-base-100 border-t border-red-600 shadow-lg rounded-lg p-6 w-full max-w-6xl mx-auto">
      {/*  <h3 className="text-2xl font-semibold text-gray-800 mb-6 underline">
          Monthly Horoscope for All Signs
        </h3> 

        {loading ? (
          // DaisyUI spinner
          <div className="flex justify-center my-10">
            <span className="loading loading-spinner loading-lg text-black"></span>
          </div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <div className="carousel">

            {zodiacSigns.map(({ sign, emoji }) =>
              horoscopeData[sign] ? (
                <div key={sign} className="carousel-item p-4 bg-gray-100 rounded-lg shadow flex flex-col w-80 overflowx-auto">
                  <div className="flex items-center justify-between bg-base-300 rounded-lg py-2">
                    <div className="flex gap-2 items-center">
                      <h2 className="text-5xl font-bold text-gray-900">
                        {emoji}
                      </h2>
                      <h2 className="text-2xl font-bold text-gray-900 capitalize">
                        {sign}
                      </h2>
                    </div>
                    <button onClick={() => toggleSpeech(sign)}>
                      {activeSign === sign && speechStatus === "started" ? (
                        <p className="bg-red-600 rounded-full p-2">
                          <Pause
                            size={21}
                            weight="bold"
                            className="text-white"
                          />
                        </p>
                      ) : (
                        <p className="bg-red-600 rounded-full p-2">
                          <Play
                            size={21}
                            weight="bold"
                            className="text-white"
                          />
                        </p>
                      )}
                    </button>
                  </div>
		      <div className="flex items-center gap-1 my-2">
		       <span className="inline flex items-center gap-2 border border-blue-600 bg-[#0000ff50] text-sm text-blue-900 rounded px-1 font-bold">
                    {horoscopeData[sign].data.month}
                  </span>

  <span className="inline flex items-center gap-2 border border-green-600 bg-[#00800050] text-sm text-green-900 rounded px-1 font-bold">
                    <ThumbsUp size={19} className="text-green-600" /> {horoscopeData[sign].data.standout_days}
                  </span>

                  <br />
                  <span className="inline flex items-center gap-2 border border-red-600 bg-[#ff000050] text-sm text-red-900 rounded px-1 font-bold">
                   <ThumbsDown size={19} className="text-red-600" />                    {horoscopeData[sign].data.challenging_days}
                  </span>
                		      </div>
                 
                  <p className="text-sm text-gray-700 mt-2 text-justify">
                    {expanded[sign]
                      ? horoscopeData[sign].data.horoscope_data
                      : horoscopeData[sign].data.horoscope_data
                          .split(" ")
                          .slice(0, 25)
                          .join(" ") + "..."}
                  </p>

                  <button
                    className="flex items-center gap-1 text-blue-600 font-semibold mt-2"
                    onClick={() => toggleExpand(sign)}
                  >
                    {expanded[sign] ? "Show Less" : "Read More"}
                    {expanded[sign] ? (
                      <CaretUp size={18} />
                    ) : (
                      <CaretDown size={18} />
                    )}
                  </button>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
      {/*<ScrollTop />
    </div>
  );
}

export default HoroscopeMonthly;*/


"use client";

import { useEffect, useState } from "react";
import { Play, Pause, CaretDown, CaretUp, ThumbsUp, ThumbsDown } from "phosphor-react";
import { useSpeech } from "react-text-to-speech";

function HoroscopeMonthly() {
  const [horoscopeData, setHoroscopeData] = useState({});
  const [error, setError] = useState(null);
  const [activeSign, setActiveSign] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  const zodiacSigns = [
    { sign: "aries", emoji: "🐏" },
    { sign: "taurus", emoji: "🐂" },
    { sign: "gemini", emoji: "👬" },
    { sign: "cancer", emoji: "🦀" },
    { sign: "leo", emoji: "🦁" },
    { sign: "virgo", emoji: "🧚" },
    { sign: "libra", emoji: "⚖️" },
    { sign: "scorpio", emoji: "🦂" },
    { sign: "sagittarius", emoji: "🐎" },
    { sign: "capricorn", emoji: "🐐" },
    { sign: "aquarius", emoji: "💧" },
    { sign: "pisces", emoji: "🐟" },
  ];

  useEffect(() => {
    const fetchHoroscopes = async () => {
      setError(null);
      setLoading(true);
      try {
        const responses = await Promise.all(
          zodiacSigns.map(({ sign }) =>
            fetch("https://sripatro-server.vercel.app/get-horoscope-monthly", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sign }),
            }).then((res) => res.json().then((data) => ({ sign, data })))
          )
        );

        const updatedHoroscopeData = responses.reduce((acc, { sign, data }) => {
          acc[sign] = data;
          return acc;
        }, {});

        setHoroscopeData(updatedHoroscopeData);
      } catch (err) {
        console.error("Error fetching horoscope:", err);
        setError("Failed to fetch horoscope.");
      }
      setLoading(false);
    };

    fetchHoroscopes();
  }, []);

  const { speechStatus, start, pause } = useSpeech({
    text: horoscopeData[activeSign]?.data?.horoscope_data || "",
    pitch: 1,
    rate: 1,
    volume: 1,
    lang: "en_GB",
    voiceURI: "Hindi India",
    autoPlay: false,
    highlightText: false,
  });

  const toggleSpeech = (sign) => {
    if (activeSign === sign && speechStatus === "started") {
      pause();
    } else {
      setActiveSign(sign);
      start();
    }
  };

  const toggleExpand = (sign) => {
    setExpanded((prev) => ({ ...prev, [sign]: !prev[sign] }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="min-h-screen bg-base-100 border-t border-red-600 shadow-lg rounded-lg m-2  w-full max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center my-10">
            <span className="loading loading-spinner loading-lg text-base-content"></span>
          </div>
        ) : error ? (
          <p className="text-error">Error: {error}</p>
        ) : (
          <div className="carousel px-4 space-x-4 w-full overflow-x-auto snap-x snap-mandatory">
            {zodiacSigns.map(({ sign, emoji }) =>
              horoscopeData[sign] ? (
                <div
                  key={sign}
                  className="carousel-item flex flex-col w-60 p-4 bg-base-100 rounded-lg shadow snap-center"
                >
                  <div className="flex items-center justify-between bg-base-300 rounded-lg py-2 px-2">
                    <div className="flex gap-2 items-center">
                      <h2 className="text-5xl font-bold text-base-content">{emoji}</h2>
                      <h2 className="text-2xl font-bold text-base-content capitalize">
                        {sign}
                      </h2>
                    </div>
                    <button onClick={() => toggleSpeech(sign)}>
                      {activeSign === sign && speechStatus === "started" ? (
                        <p className="bg-red-600 rounded-full p-2">
                          <Pause size={21} weight="bold" className="text-white" />
                        </p>
                      ) : (
                        <p className="bg-red-600 rounded-full p-2">
                          <Play size={21} weight="bold" className="text-white" />
                        </p>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1 my-2 flex-wrap">
                    <span className="inline-flex items-center gap-2 border border-blue-600 bg-[#0000ff50] text-sm text-blue-900 rounded px-1 font-bold">
                      {horoscopeData[sign].data.month}
                    </span>

                    <span className="inline-flex items-center gap-2 border border-green-600 bg-[#00800050] text-sm text-green-900 rounded px-1 font-bold">
                      <ThumbsUp size={19} className="text-green-600" />{" "}
                      {horoscopeData[sign].data.standout_days}
                    </span>

                    <span className="inline-flex items-center gap-2 border border-red-600 bg-[#ff000050] text-sm text-red-900 rounded px-1 font-bold">
                      <ThumbsDown size={19} className="text-red-600" />{" "}
                      {horoscopeData[sign].data.challenging_days}
                    </span>
                  </div>

                  <p className="text-sm text-base-content mt-2 text-justify">
                    {expanded[sign]
                      ? horoscopeData[sign].data.horoscope_data
                      : horoscopeData[sign].data.horoscope_data
                          .split(" ")
                          .slice(0, 25)
                          .join(" ") + "..."}
                  </p>

                  <button
                    className="flex items-center gap-1 text-primary font-semibold mt-2"
                    onClick={() => toggleExpand(sign)}
                  >
                    {expanded[sign] ? "Show Less" : "Read More"}
                    {expanded[sign] ? <CaretUp size={18} /> : <CaretDown size={18} />}
                  </button>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HoroscopeMonthly;

