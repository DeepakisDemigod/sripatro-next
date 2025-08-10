"use client";

import { useState } from "react";
import Horoscope from "./Horoscope";
import HoroscopeWeekly from "./HoroscopeWeekly";
import HoroscopeMonthly from "./HoroscopeMonthly";

const HoroscopePredictions = () => {
  const [activeTab, setActiveTab] = useState("daily");

  return (
    <div className="w-full bg-base-100 text-base-content shadow-lg">
      <div className="flex justify-center gap-4 border-b-2 border-base-200">
        {["daily", "weekly", "monthly"].map((tab) => (
          <button
            key={tab}
            className={`px-6 py-2 text-md font-semibold capitalize border-b-2 transition-all ${
              activeTab === tab
                ? "text-red-600 border-red-600"
                : "text-base-600 border-transparent hover:text-red-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "daily" && <Horoscope />}
        {activeTab === "weekly" && <HoroscopeWeekly />}
        {activeTab === "monthly" && <HoroscopeMonthly />}
      </div>
    </div>
  );
};

export default HoroscopePredictions;
