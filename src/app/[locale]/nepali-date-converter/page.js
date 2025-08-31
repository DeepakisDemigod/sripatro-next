'use client'

import { useState, useEffect } from 'react';
import NepaliDate from 'nepali-date-converter';
import { useTranslations } from 'next-intl';
import { CaretLeft, ArrowUpRight } from 'phosphor-react';
import Link from "next/link"
import Head from 'next/head'
import Header from "../../../components/Header.js"

const nepaliMonths = [
  'बैशाख',
  'जेठ',
  'असार',
  'साउन',
  'भदौ',
  'असोज',
  'कार्तिक',
  'मंसिर',
  'पुष',
  'माघ',
  'फागुन',
  'चैत्र'
];

const englishMonths = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const nepaliDays = [
  'आइतबार',
  'सोमबार',
  'मंगलबार',
  'बुधबार',
  'बिहीबार',
  'शुक्रबार',
  'शनिबार'
];

const englishDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

// Year range
const years = Array.from({ length: 101 }, (_, i) => 2000 + i);

export default function DateConverter() {
  const  t  = useTranslations("NepaliDateConverter");
  const [adDate, setAdDate] = useState('');
  const [bsDate, setBsDate] = useState({ year: 2081, month: 1, date: 1 });
  const [convertedToBs, setConvertedToBs] = useState('');
  const [convertedToAd, setConvertedToAd] = useState('');
  const [bsDay, setBsDay] = useState('');
  const [adDay, setAdDay] = useState('');
  const [maxBsDays, setMaxBsDays] = useState(32);

  // Get number of days in BS month/year using NepaliDate
  const getDaysInBsMonth = (year, month) => {
    try {
      let day = 32;
      while (day > 0) {
        try {
          new NepaliDate(year, month - 1, day);
          return day;
        } catch {
          day--;
        }
      }
    } catch {
      return 30;
    }
  };

  useEffect(() => {
  
    const today = new Date();
    const adString = today.toISOString().split('T')[0];
    setAdDate(adString);

    const nepaliDate = NepaliDate.fromAD(today);
    const year = nepaliDate.getYear();
    const month = nepaliDate.getMonth() + 1;
    const date = nepaliDate.getDate();
    const dayIndex = nepaliDate.getDay();

    setBsDate({ year, month, date });
    setBsDay(nepaliDays[dayIndex]);
    setMaxBsDays(getDaysInBsMonth(year, month));

    handleAdToBs(adString);
    handleBsToAd(year, month, date);
  }, []);

  useEffect(() => {
    const { year, month } = bsDate;
    setMaxBsDays(getDaysInBsMonth(Number(year), Number(month)));
  }, [bsDate.year, bsDate.month]);

  const handleAdToBs = (dateStr = adDate) => {
    try {
      const dateObj = new Date(dateStr);
      const adDayIndex = dateObj.getDay();
      setAdDay(englishDays[adDayIndex]);

      const nepaliDate = NepaliDate.fromAD(dateObj);
      const year = nepaliDate.getYear();
      const month = nepaliDate.getMonth();
      const day = nepaliDate.getDate();
      const bsDayIndex = nepaliDate.getDay();

      setConvertedToBs(
        `${toNepaliNumber(year)} ${nepaliMonths[month]} ${toNepaliNumber(
          day
        )}, ${nepaliDays[bsDayIndex]}`
      );
    } catch (e) {
      alert('Invalid AD date. Use YYYY-MM-DD format.');
    }
  };

  const handleBsToAd = (
    year = bsDate.year,
    month = bsDate.month,
    date = bsDate.date
  ) => {
    try {
      const nepDate = new NepaliDate(
        Number(year),
        Number(month) - 1,
        Number(date)
      );
      const engDate = nepDate.toJsDate();

      const y = engDate.getFullYear();
      const m = engDate.getMonth();
      const d = engDate.getDate();
      const bsDayIndex = nepDate.getDay();

      setBsDay(nepaliDays[bsDayIndex]);
      setConvertedToAd(`${y} ${englishMonths[m]} ${d}`);
    } catch (e) {
      alert(
        'Invalid BS date. Make sure year, month, and date are valid numbers.'
      );
    }
  };

  const toNepaliNumber = num =>
    String(num).replace(/\d/g, d => '०१२३४५६७८९'[d]);

  return (
    <>
    <Head>
      <title>Nepali Date Converter | Sri Patro Best Nepali Patro</title>
      <meta
        name="description"
        content="Convert Indian date (AD) to Nepali date (BS) or vice versa using SriPatro's fast free online Nepali Date Converter tool."
      />
      <meta
        name="keywords"
        content="Nepali Date Converter, Nepali Patro, Bikram Sambat, Gregorian Calendar, AD to BS, BS to AD, SriPatro"
      />
      <meta property="og:type" content="website" />
      <meta
        property="og:title"
        content="Free and Fast Nepali Date Converter | Convert AD to BS | SriPatro"
      />
      <meta
        property="og:description"
        content="Easily convert dates between Indian (Gregorian) and Nepali (Bikram Sambat) calendars with SriPatro's fast, reliable tool."
      />
      <meta property="og:image" content="https://example.com/share-image.png" />
      <meta property="og:url" content="https://sripatro.com/nepali-date-converter" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@deepakisdemigod" />
      <link rel="canonical" href="https://sripatro.com/date-converter" />
    </Head>
    <Header />
    <div className="max-w-md mx-auto my-4 p-4 space-y-6">
  {/* AD to BS */}
  <div className="bg-white rounded-2xl shadow-md p-5">
    <h3 className="text-base font-semibold text-gray-700 mb-3">
      🇮🇳 {t('Indian Date')} <span className="mx-2">→</span> 🇳🇵 {t('Nepali Date')}
    </h3>
    <input
      type="date"
      value={adDate}
      onChange={e => {
        setAdDate(e.target.value);
        handleAdToBs(e.target.value);
      }}
      className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-900 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
    {convertedToBs && (
      <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-center">
        <span className="text-lg font-medium text-gray-800">
          {convertedToBs}
        </span>
      </div>
    )}
  </div>

  {/* Divider */}
  <div className="flex items-center justify-center">
    <span className="px-4 text-sm text-gray-400">OR</span>
  </div>

  {/* BS to AD */}
  <div className="bg-white rounded-2xl shadow-md p-5">
    <h3 className="text-base font-semibold text-gray-700 mb-3">
      🇳🇵 {t('Nepali Date')} <span className="mx-2">→</span> 🇮🇳 {t('Indian Date')}
    </h3>
    <div className="grid grid-cols-3 gap-3">
      {/* Year */}
      <select
        value={bsDate.year}
        onChange={e => {
          const updated = { ...bsDate, year: e.target.value };
          setBsDate(updated);
          handleBsToAd(updated.year, updated.month, updated.date);
        }}
        className="px-3 py-3 rounded-xl bg-gray-100 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {years.map(y => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {/* Month */}
      <select
        value={bsDate.month}
        onChange={e => {
          const updated = { ...bsDate, month: e.target.value };
          setBsDate(updated);
          handleBsToAd(updated.year, updated.month, updated.date);
        }}
        className="px-3 py-3 rounded-xl bg-gray-100 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {nepaliMonths.map((name, idx) => (
          <option key={idx} value={idx + 1}>
            {name}
          </option>
        ))}
      </select>

      {/* Day */}
      <select
        value={bsDate.date}
        onChange={e => {
          const updated = { ...bsDate, date: e.target.value };
          setBsDate(updated);
          handleBsToAd(updated.year, updated.month, updated.date);
        }}
        className="px-3 py-3 rounded-xl bg-base-100 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {Array.from({ length: maxBsDays }, (_, i) => i + 1).map(day => (
          <option key={day} value={day}>
            {day}
          </option>
        ))}
      </select>
    </div>

    {convertedToAd && (
      <div className="mt-4 rounded-2xl bg-base-300 p-4 text-center">
        <span className="text-xl font-medium text-base-content/80">
          {convertedToAd},{" "}
        </span>
        <span className="text-xl font-medium text-base-content/80">{bsDay}</span>
      </div>
    )}
  </div>
</div>
</>
  );
}
