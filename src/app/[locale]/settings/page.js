"use client";
import { useEffect, useState } from "react";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Header from "@/components/Header";

function setCookie(name, value, days = 365) {
  try {
    const v = encodeURIComponent(JSON.stringify(value));
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${v}; expires=${expires}; path=/`;
  } catch (e) {}
}
function getCookie(name) {
  try {
    const match = document.cookie.match(
      new RegExp("(?:^|; )" + name + "=([^;]*)")
    );
    if (!match) return null;
    const v = decodeURIComponent(match[1]);
    return JSON.parse(v);
  } catch (e) {
    return null;
  }
}

export default function page() {
  const [calSettings, setCalSettings] = useState({
    tithi: false,
    nakshatra: false,
    rasi: false,
    enDate: false,
    festivals: false,
    npDigits: false,
    holidayDOW: "saturday",
  });

  useEffect(() => {
    const s = getCookie("calendar_settings");
    if (s && typeof s === "object")
      setCalSettings((prev) => ({ ...prev, ...s }));
  }, []);

  function toggle(key) {
    const next = { ...calSettings, [key]: !calSettings[key] };
    setCalSettings(next);
    setCookie("calendar_settings", next, 365);
  }

  return (
    <>
      <Header />
      <div className="max-w-3xl p-4">
        <h3 className="text-xl font-bold">
          <span>Settings</span>
        </h3>

        <div className="flex items-center justify-between p-4 ">
          <p>
            Appearance <br />
            <span className="text-xs text-base-00">
              select your preferred theme
            </span>
          </p>
          <ThemeSwitcher />
        </div>

        <div className="flex items-center justify-between p-4">
          <p>
            Language
            <br />
            <span className="text-xs  text-base-800">
              select your preferred language
            </span>
          </p>
          <LocaleSwitcher />
        </div>

        <div className="p-4 border rounded-lg mt-2 bg-base-100">
          <div className="font-semibold mb-2">Calendar</div>
          <div className="divide-y divide-base-200">
            <div className="flex items-center justify-between py-3">
              <p>
                Show Tithi
                <br />
                <span className="text-xs text-base-content/60">
                  Display lunar day (tithi) for each date.
                </span>
              </p>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={!!calSettings.tithi}
                onChange={() => toggle("tithi")}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <p>
                Show Nakshatra
                <br />
                <span className="text-xs text-base-content/60">
                  Display the star/constellation (nakshatra).
                </span>
              </p>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={!!calSettings.nakshatra}
                onChange={() => toggle("nakshatra")}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <p>
                Show Rasi
                <br />
                <span className="text-xs text-base-content/60">
                  Display the moon sign (rasi); uses MoonTiming when needed.
                </span>
              </p>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={!!calSettings.rasi}
                onChange={() => toggle("rasi")}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <p>
                Show English date
                <br />
                <span className="text-xs text-base-content/60">
                  Show the corresponding Gregorian date under Nepali date.
                </span>
              </p>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={!!calSettings.enDate}
                onChange={() => toggle("enDate")}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <p>
                Show Festivals
                <br />
                <span className="text-xs text-base-content/60">
                  Display festival notes sourced from data-db.
                </span>
              </p>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={!!calSettings.festivals}
                onChange={() => toggle("festivals")}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <p>
                Show Nepali digits
                <br />
                <span className="text-xs text-base-content/60">
                  Render Nepali dates in Devanagari numerals (e.g., १, २, ३).
                </span>
              </p>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={!!calSettings.npDigits}
                onChange={() => toggle("npDigits")}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <p>
                Weekly holiday
                <br />
                <span className="text-xs text-base-content/60">
                  Choose which weekday is treated as the weekly holiday.
                </span>
              </p>
              <div className="flex gap-3 items-center">
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="holidayDOW"
                    className="radio radio-xs"
                    checked={calSettings.holidayDOW === "saturday"}
                    onChange={() => {
                      const next = { ...calSettings, holidayDOW: "saturday" };
                      setCalSettings(next);
                      setCookie("calendar_settings", next, 365);
                    }}
                  />
                  Saturday
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="holidayDOW"
                    className="radio radio-xs"
                    checked={calSettings.holidayDOW === "sunday"}
                    onChange={() => {
                      const next = { ...calSettings, holidayDOW: "sunday" };
                      setCalSettings(next);
                      setCookie("calendar_settings", next, 365);
                    }}
                  />
                  Sunday
                </label>
              </div>
            </div>
          </div>
          <div className="text-xs text-base-content/60 mt-2">
            These preferences are saved and used by the calendar.
          </div>
        </div>
      </div>
    </>
  );
}
