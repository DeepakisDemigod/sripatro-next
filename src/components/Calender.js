"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import NepaliDate from "nepali-date-converter";
import { CaretLeft, CaretRight, Coffee } from "phosphor-react";

const Calendar = () => {
  const t = useTranslations("");
  const [days, setDays] = useState([]);
  const [currentNepaliMonth, setCurrentNepaliMonth] = useState("");
  const [viewYear, setViewYear] = useState(2025); // Default to 2025
  const [viewMonth, setViewMonth] = useState(5); // Default to June (5)
  const [holidays, setHolidays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); // Track selected date

  // Fetch holidays from Calendarific API
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await fetch(
          `https://calendarific.com/api/v2/holidays?&api_key=vlf1H1shbVAkNiFuWQhzfVZnNbF55NBW&country=IN&year=${viewYear}`
        );
        const data = await response.json();
        if (data.meta.code === 200) {
          setHolidays(data.response.holidays);
        }
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    };
    fetchHolidays();
  }, [viewYear]);

  useEffect(() => {
    const generateCalendar = () => {
      const minYear = 2000;
      const maxYear = 2090;
      const isValidRange = viewYear >= minYear && viewYear <= maxYear;

      if (!isValidRange) {
        setDays([]); // Empty the calendar if outside range
        setCurrentNepaliMonth("N/A");
        return;
      }

      const year = viewYear;
      const month = viewMonth;
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const calendarDays = [];
      let nepaliMonthForHeading = "";

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDay; i++) calendarDays.push(null);
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const engDate = new Date(year, month, day);
        const nepDate = new NepaliDate(engDate);
        const bs = nepDate.getBS();
        if (!nepaliMonthForHeading) {
          nepaliMonthForHeading = nepaliMonthName(bs.month);
        }

        const holiday = holidays.find(
          (h) =>
            h.date.datetime.year === year &&
            h.date.datetime.month === month + 1 &&
            h.date.datetime.day === day
        );

        calendarDays.push({
          day,
          nepDate: bs.date,
          nepMonth: nepaliMonthName(bs.month),
          isTodayNepali: isTodayNepali(bs),
          holiday: holiday ? holiday : null,
        });
      }
      setDays(calendarDays);
      setCurrentNepaliMonth(nepaliMonthForHeading);

      // Set today's date as selected by default
      const today = new Date();
      if (
        year === today.getFullYear() &&
        month === today.getMonth() &&
        !selectedDate
      ) {
        const todayObj = calendarDays.find(
          (d) => d && d.day === today.getDate()
        );
        if (todayObj) setSelectedDate(todayObj);
      }
    };
    generateCalendar();
  }, [viewYear, viewMonth, holidays, selectedDate]);

  const today = new Date(); // Current date
  const currentMonth = new Date(viewYear, viewMonth).toLocaleString("default", {
    month: "long",
  });
  const currentYear = viewYear;

  const dayKeys = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isTodayNepali = (bs) => {
    const todayBS = new NepaliDate();
    return (
      todayBS.getYear() === bs.year &&
      todayBS.getMonth() === bs.month &&
      todayBS.getDate() === bs.date
    );
  };

  const nepaliMonthName = (index) => {
    const months = [
      "Baisakh",
      "Jestha",
      "Ashadh",
      "Shrawan",
      "Bhadra",
      "Ashwin",
      "Kartik",
      "Mangsir",
      "Paush",
      "Magh",
      "Falgun",
      "Chaitra",
    ];
    return months[index];
  };

  const handleDateClick = (dayObj) => {
    setSelectedDate(dayObj);
  };

  const renderSelectedDateEvents = () => {
    const displayDate =
      selectedDate ||
      days.find(
        (d) =>
          d &&
          d.day === today.getDate() &&
          viewYear === today.getFullYear() &&
          viewMonth === today.getMonth()
      );
    if (!displayDate) return null;

    const { holiday } = displayDate;
    const isHoliday =
      holiday &&
      (holiday.type.includes("National holiday") ||
        holiday.type.includes("Gazetted Holiday"));
    return (
      <div className="w-[300px] card bg-base-100 shadow-xl p-6">
        <h3 className="text-xl font-bold text-red-600 mb-4">
          Selected Date Events
        </h3>
        <div className="space-y-3">
          <p className="text-gray-700">
            <span className="font-semibold">Nepali Date:</span>{" "}
            {viewYear >= 2000 && viewYear <= 2090
              ? `${displayDate.nepDate} ${displayDate.nepMonth}`
              : "N/A"}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Gregorian Date:</span>{" "}
            {`${displayDate.day} ${currentMonth} ${viewYear}`}
          </p>
          {viewYear >= 2000 && viewYear <= 2090 && holiday && (
            <>
              <p className="text-gray-700">
                <span className="font-semibold">Event/Festival:</span>{" "}
                {holiday.name}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Description:</span>{" "}
                {holiday.description}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Holiday:</span>{" "}
                <span
                  className={`badge ${
                    isHoliday ? "bg-red-700 text-white" : ""
                  }`}
                >
                  {isHoliday ? (
                    <div className="flex gap-2 py-2">
                      <Coffee size={15} />
                      <p className="text-sm">Holiday</p>
                    </div>
                  ) : (
                    "No Holiday"
                  )}
                </span>
              </p>
            </>
          )}
          {viewYear >= 2000 && viewYear <= 2090 && !holiday && (
            <p className="text-gray-700">No events or holidays on this date.</p>
          )}
          {viewYear < 2000 ||
            (viewYear > 2090 && (
              <p className="text-gray-700">No data available for this date.</p>
            ))}
        </div>
      </div>
    );
  };

  // Group days into weeks for vertical layout
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="container mx-auto p-2 min-h-screen bg-base-100">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:flex-1">
          <div className="mb-6">
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={() =>
                  setViewMonth((prev) => (prev === 0 ? 11 : prev - 1)) ||
                  (viewMonth === 0 && setViewYear((y) => y - 1))
                }
                className="text-red-500 btn btn-outline btn-sm"
              >
                Previous
              </button>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value))}
                className="select select-bordered"
              >
                {Array.from(
                  { length: 2090 - 2000 + 1 },
                  (_, i) => 2000 + i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value))}
                className="select select-bordered w-32"
              >
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  setViewMonth((prev) => (prev === 11 ? 0 : prev + 1)) ||
                  (viewMonth === 11 && setViewYear((y) => y + 1))
                }
                className="text-red-500 btn btn-outline btn-sm"
              >
                Next
              </button>
            </div>
            <div className="flex gap-2 text-3xl font-bold mt-2">
              <h1 className="text-red-600">{currentNepaliMonth || "N/A"}</h1>
              <h2 className="text-xl text-gray-600 mt-2">
                ({currentMonth}/{currentYear})
              </h2>
            </div>
          </div>
          <div className="w-[330px] shadow-lg">
            {/* Day Headers */}
            <div className="grid grid-cols-7">
              {dayKeys.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-red-600 p-2 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-red-900 via-red-700 to-red-800 text-white rounded"
                >
                  {day}
                </div>
              ))}
            </div>
            {/* Weeks as Rows */}
            {weeks.length > 0 ? (
              weeks.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  className="grid grid-cols-7 border-t border-gray-200"
                >
                  {week.map((dayObj, dayIndex) => (
                    <div
                      key={dayIndex}
                      onClick={() => dayObj && handleDateClick(dayObj)}
                      className={`text-center cursor-pointer p-2
                        ${
                          selectedDate?.day === dayObj?.day &&
                          viewYear === today.getFullYear() &&
                          viewMonth === today.getMonth()
                            ? "bg-red-600 text-white"
                            : dayObj?.day === today.getDate() &&
                              viewYear === today.getFullYear() &&
                              viewMonth === today.getMonth()
                            ? "bg-red-200 text-gray-800 border-2 border-red-400"
                            : "hover:bg-red-100 text-gray-800"
                        }
                        border-r border-b border-gray-200 shadow-sm`}
                    >
                      {dayObj ? (
                        <div>
                          <div className="flex items-end justify-center">
                            <div className="text-xl">{dayObj.day}</div>
                            <div className="text-xs text-base-500 ml-1">
                              {dayObj.nepDate}
                            </div>
                          </div>
                          <div className="text-sm opacity-75">
                            {dayObj.holiday?.name || ""}
                          </div>
                        </div>
                      ) : (
                        <div>&nbsp;</div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 p-4">
                No calendar data available for this date range.
              </div>
            )}
          </div>
        </div>
        <div className="lg:flex-1 lg:pl-6">{renderSelectedDateEvents()}</div>
      </div>
    </div>
  );
};

export default Calendar;
