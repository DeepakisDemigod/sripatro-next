"use client"

import { useEffect, useState } from "react";
import { Play, Pause, CaretUp, CaretDown } from "phosphor-react"; // Import icons
// import ScrollTop from "./ScrollTop.jsx";

function HoroscopeWeekly() {
  const [day, setDay] = useState("today");
  const [horoscopeData, setHoroscopeData] = useState({});
  const [expanded, setExpanded] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(null);

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
          fetch("https://sripatro-server.vercel.app/get-horoscope-weekly", {
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

  const toggleExpand = (sign) => {
    setExpanded((prev) => ({ ...prev, [sign]: !prev[sign] }));
  };

  const toggleSpeech = (sign, text) => {
    if (speaking === sign) {
      window.speechSynthesis.cancel();
      setSpeaking(null);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeaking(null);
      window.speechSynthesis.speak(utterance);
      setSpeaking(sign);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center ">
      <div className="min-h-screen bg-base-100 border-t border-red-600 shadow-lg rounded-lg p-6 w-full max-w-6xl mx-auto">
        {error && <p className="text-red-600 text-center">{error}</p>}

        {loading ? (
          <div className="bg-base-100 flex justify-center my-10">
            <span className="loading loading-spinner loading-lg text-red-600"></span>
          </div>
        ) : (
          <div className="carousel space-x-2 w-full overflow-x-auto snap-x snap-mandatory">
            {zodiacSigns.map(({ sign, emoji }) =>
              horoscopeData[sign] ? (
                <div key={sign} className="carousel-item flex flex-col w-60 p-4 m-1 bg-base-100 rounded-lg shadow snap-center">
                  <div className="flex items-center justify-between bg-base-200 rounded-full p-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-5xl font-bold">{emoji}</h2>
                      <h2 className="text-2xl font-bold capitalize text-base-900">
                        {sign}
                      </h2>
                    </div>
                    <button
                      onClick={() =>
                        toggleSpeech(
                          sign,
                          horoscopeData[sign].data.horoscope_data
                        )
                      }
                      className="ml-4 text-green-600 text-sm p-2 bg-red-600 rounded-full"
                    >
                      {speaking === sign ? (
                        <Pause size={21} color="white" />
                      ) : (
                        <Play size={21} color="white" />
                      )}
                    </button>
                  </div>
                  <span className="flex inline my-1 mt-2 border border-blue-600 bg-[#0000ff50] rounded px-1 text-xs text-blue-600">
                    {horoscopeData[sign].data.week}
                  </span>
                  <p className="text-sm text-base-700">
                    {expanded[sign]
                      ? horoscopeData[sign].data.horoscope_data
                      : horoscopeData[sign].data.horoscope_data.substring(
                          0,
                          180
                        ) + "..."}
                  </p>
                  <button
                    onClick={() => toggleExpand(sign)}
                    className="flex text-blue-500 underline text-sm mt-2"
                  >
                    {expanded[sign] ? "Show Less" : "Read More"}
                    {expanded[sign] ? (
                      <CaretUp size={18} weight="bold" />
                    ) : (
                      <CaretDown size={18} weight="bold" />
                    )}
                  </button>
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

export default HoroscopeWeekly;
