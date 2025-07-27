"use client";

import React, { useEffect, useState } from "react";

import { MhahPanchang } from "mhah-panchang";

import NepaliDate from "nepali-date-converter";

export default function LivePanchangCard() {
  const [now, setNow] = useState(new Date());

  const [panchang, setPanchang] = useState(null);

  // 1) Clock: updates every second

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);

    return () => clearInterval(interval);
  }, []);

  // 2) Panchang: calculate once on component mount

  useEffect(() => {
    const obj = new MhahPanchang();

    const data = obj.calendar(new Date(), 28.7041, 77.1025); // Delhi coords

    setPanchang(data);
  }, []);

  if (!panchang) {
    return (
      <div className="max-w-md mx-4 bg-base-100 rounded-2xl border border-base-300 overflow-hidden font-sans animate-pulse p-4 space-y-4">
        {/* skeleton loader same as before */}

        <div className="skeleton w-full h-6 rounded"></div>

        <div className="skeleton w-full h-32 rounded"></div>

        <div className="skeleton w-full h-4 rounded"></div>
      </div>
    );
  }

  const weekday = now.toLocaleDateString("en-GB", { weekday: "long" });

  const adFull = now.toLocaleDateString("en-GB", {
    day: "2-digit",

    month: "long",

    year: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",

    minute: "2-digit",

    second: "2-digit",
  });

  const bs = NepaliDate.fromAD(now);

  const bsFull = bs.format("YYYY MMMM D", "np");

  const pakshaDir =
    panchang.Paksha.name_en_IN === "Shukla" ? "shukla" : "krishna";

  const tithiName = panchang.Tithi.name_en_IN;

  const moonSrc = `moon/${pakshaDir}/${tithiName}.png`;

  return (
    <div className="max-w-md mx-4 bg-base-100 rounded-2xl border border-base-300  overflow-hidden ">
      {/* header */}

      <div className="flex justify-between p-4">
        <div className="flex flex-col justify-start items-start gap-2">
          <div className="flex items-center gap-2 border border-base-300 bg-base-100 rounded px-2 py-.5">
            <p className="w-1 h-1 bg-red-600 rounded-full animate-ping"></p>

            <span className="text-xs font-semibold uppercase">Live</span>
          </div>

          <div className="pb-2 text-center text-base-800 text-sm font-semibold">
            {panchang.Masa.name_en_IN}{" "}
            {pakshaDir === "shukla" ? "शुक्ल" : "कृष्ण"} {tithiName}
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs font-thin text-base-800">
                {" "}
                ने. सं. ११४५ गुंलाथ्व पारू
              </span>
              <p className="text-xs font-thin text-base-800">सिद्धार्थी</p>{" "}
            </div>
          </div>
        </div>

        <div className="text-right text-sm">
          <div className="font-medium">{weekday}</div>

          <div className="text-md font-semibold">{adFull}</div>

          <div className="text-base-800">({bsFull})</div>

          {/* <div className="flex items-center gap-1 text-base-800 mt-1">

      ⏰ {timeStr}

     </div>*/}
        </div>
      </div>

      {/* moon */}

      <div className="flex justify-center py-2">
        <img
          src={moonSrc}
          alt="Moon phase"
          className="w-24 h-24 rounded-full border border-base-600"
          onError={(e) => (e.target.style.display = "none")}
        />
      </div>

      {/* panchang details */}

      <div className="p-4 space-y-1 text-sm">
        <div>
          <strong>Tithi:</strong> {tithiName}, {panchang.Paksha.name_en_IN}{" "}
          Paksha
        </div>

        <div>
          <strong>Rasi:</strong> {panchang.Raasi.name_en_UK}
        </div>

        <div>
          <strong>Nakshatra:</strong> {panchang.Nakshatra.name_en_IN}
        </div>

        <div>
          <strong>Yoga:</strong> {panchang.Yoga.name_en_IN}
        </div>

        <div>
          <strong>Karna:</strong> {panchang.Karna.name_en_IN}
        </div>
      </div>
    </div>
  );
}
