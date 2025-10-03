"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "phosphor-react";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute("data-theme", storedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "black" ? "light" : "black";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleTheme}
        className="btn border border-base-300 p-3 rounded text-base-800 bg-base-100 flex items-center gap-2 h-90"
      >
        {theme === "light" ? (
          <>
            <Moon weight="bold" size={20} /> Night
          </>
        ) : (
          <>
            <Sun weight="bold" size={20} /> Light
          </>
        )}
      </button>
      {/* <span className="ml-2 text-xs text-green-600 font-semibold">
        {astrologersOnline} astrologer{astrologersOnline === 1 ? "" : "s"}{" "}
        online
      </span> */}
    </div>
  );
}
