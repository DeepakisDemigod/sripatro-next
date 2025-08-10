"use client"

import { useEffect, useState } from "react";
import { Play, Pause } from "phosphor-react";
import { useSpeech } from "react-text-to-speech";
//import ScrollTop from "./ScrollTop.jsx";

function HoroscopeForm() {
  const [day, setDay] = useState("today");
  const [horoscopeData, setHoroscopeData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSign, setActiveSign] = useState(null);

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

  const fetchHoroscopes = async () => {
    setLoading(true);
    setError(null);
    try {
      const responses = await Promise.all(
        zodiacSigns.map(({ sign }) =>
          fetch("https://sripatro-server.vercel.app/get-horoscope/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sign, day }),
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoroscopes();
  }, [day]);

  const { Text, speechStatus, start, pause } = useSpeech({
    text: horoscopeData[activeSign]?.data?.horoscope_data || "",
    pitch: 1,
    rate: 1,
    volume: 1,
    lang: "en_AU",
    voiceURI: "English Australia",
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

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex items-center justify-center">
      <div className="min-h-screen bg-base-100 shadow-lg rounded-lg p-6 w-full max-w-6xl mx-auto">
        {/* <h3 className="text-2xl font-semibold text-gray-800 mb-6 underline">
          Daily Horoscope for All Signs
        </h3> */}

        {error && <p className="text-red-600 text-center">{error}</p>}

        {loading ? (
          <div className="flex justify-center my-10">
            <span className="loading loading-spinner loading-lg text-black"></span>
          </div>
        ) : (
          <div className="carousel space-x-2 w-full overflow-x-auto snap-x snap-mandatory">
            {zodiacSigns.map(({ sign, emoji }) =>
              horoscopeData[sign] ? (
                <div key={sign} className="carousel-item flex flex-col w-60 p-4 bg-base-100 rounded-lg shadow snap-center">
                  <div className="flex items-center justify-between bg-base-200 rounded-full p-2 ">
                    <div className="flex gap-2 items-center">
                      <h2 className="text-5xl font-bold bg-base-100 rounded-full p-2">
                        {emoji}
                      </h2>
                      <h2 className="text-2xl font-bold capitalize text-base-900">
                        {sign}
                      </h2>
                    </div>
                    <button onClick={() => toggleSpeech(sign)}>
                      {activeSign === sign && speechStatus === "started" ? (
                        <div className="bg-red-600 rounded-full p-2 text-white">
                          <Pause size={21} weight="bold" className="" />
                        </div>
                      ) : (
                        <div className="btn bg-red-600 rounded-full p-2 text-white">
                          <Play size={21} weight="bold" className="" />
                        </div>
                      )}
                    </button>
                  </div>
                  <span className="text-xs text-base-500">
                    {horoscopeData[sign].data.week}
                  </span>
                  <p className="text-sm text-base-700">
                    {horoscopeData[sign].data.horoscope_data}
                  </p>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
	  {/* <ScrollTop />*/}
    </div>
  );
}

export default HoroscopeForm;
