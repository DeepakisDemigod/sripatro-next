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
    <div className='max-w-lg mx-auto my-1 p-4 pt-4 rounded-2xl bg-base-100 text-base-800'>
      <Link
        href='/'
        className='hover:underline'
      >
        <div className='breadcrumbs border border-2 border-base-300 rounded pl-2 text-sm hover:bg-base-200'>
          <ul>
            <li className='hover:border'>
              <CaretLeft size={17} weight="bold" /> 
	  <span>{t('Back')}</span>
            </li>
          </ul>
        </div>
      </Link>
	  {/*
      <div className='mt-2 pt-2 px-2 flex flex-col justify-between bg-base-100 rounded-md border border-2 border-base-300 border-t-red-500'>
        <div>
          <h3 className='flex items-center gap-1 font-bold text-lg'>
            <span>Daily Panchang</span>
          </h3>
          <p className='text-xs px-.5'>
            Get Daily Panchang with Indian Date (AD) Anno Domini and Nepali Date
            (BS) bikram sambat date and Many more infomation for the day.
          </p>
        </div>
        <div>
          <div className=''>
            <a
              href='/nepalitoenglish'
              className='my-2 border border-2 border-base-300 flex justify-between bg-base-900 items-center gap-2 text-base-800 rounded-md shadow-sm transition pr-2'
            >
              <span className='text-2xl'>
                🇳🇵
                <span className='text-sm'>{t('Nepali Date')}</span>
              </span>
              <ArrowUpRight weight='bold' />
            </a>
            <a
              href='/birthpanchang'
              className='my-2 border border-2 border-base-300 flex justify-between bg-base-900 items-center gap-2 text-base-800 rounded-md shadow-sm transition pr-2'
            >
              <span className='text-xl pl-1'>
                🇮🇳
                <span className='text-sm'> {t('Indian Date')}</span>
              </span>
              <ArrowUpRight weight='bold' />
            </a>
          </div>
        </div>
      </div>*/}

      <br />
	  {/* <h2 className='text-3xl font-bold mb-6'>🗓 {t('Date Converter')}</h2>*/}
      <div className='max-w-lg mx-auto'>
        {/* AD to BS */}
        <div className='mb-8'>
          <h3 className='text-lg font-semibold mb-2'>
            🇮🇳 {t('Indian Date')} <span className='text-2xl font-bold'>→</span>{' '}
            🇳🇵 {t('Nepali Date')}
          </h3>
          <input
            type='date'
            value={adDate}
            onChange={e => {
              setAdDate(e.target.value);
              handleAdToBs(e.target.value);
            }}
            className='input input-bordered w-full text-lg'
          />
          {convertedToBs && (
            <div className='mt-3 p-4 bg-base-300 text-lg space-y-1'>
              <div>
                <span className='text-xl text-base-400'>{convertedToBs}</span>
              </div>
            </div>
          )}
        </div>

        <div className='divider'>OR</div>

        {/* BS to AD */}
        <div>
          <h3 className='text-lg font-semibold mb-2'>
            🇳🇵 {t('Nepali Date')} <span className='text-2xl font-bold'>→</span>{' '}
            🇮🇳 {t('Indian Date')}
          </h3>
          <div className='grid grid-cols-3 gap-2'>
            {/* BS Year */}
            <select
              value={bsDate.year}
              onChange={e => {
                const updated = { ...bsDate, year: e.target.value };
                setBsDate(updated);
                handleBsToAd(updated.year, updated.month, updated.date);
              }}
              className='select select-bordered text-lg'
            >
              {years.map(y => (
                <option
                  key={y}
                  value={y}
                >
                  {y}
                </option>
              ))}
            </select>

            {/* BS Month */}
            <select
              value={bsDate.month}
              onChange={e => {
                const updated = { ...bsDate, month: e.target.value };
                setBsDate(updated);
                handleBsToAd(updated.year, updated.month, updated.date);
              }}
              className='select select-bordered text-lg'
            >
              {nepaliMonths.map((name, idx) => (
                <option
                  key={idx}
                  value={idx + 1}
                >
                  {name}
                </option>
              ))}
            </select>

            {/* BS Date */}
            <select
              value={bsDate.date}
              onChange={e => {
                const updated = { ...bsDate, date: e.target.value };
                setBsDate(updated);
                handleBsToAd(updated.year, updated.month, updated.date);
              }}
              className='select select-bordered text-lg'
            >
              {Array.from({ length: maxBsDays }, (_, i) => i + 1).map(day => (
                <option
                  key={day}
                  value={day}
                >
                  {day}
                </option>
              ))}
            </select>
          </div>

          {convertedToAd && (
            <div className='mt-3 p-4 bg-base-300 text-lg space-y-1'>
              <div>
                <span className='text-xl '>{convertedToAd}</span>
                {' , '}
                <span className='text-xl'>{bsDay}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className=' text-sm my-8 text-justify'>
        {t(
          'If you are looking to convert Indian date to Nepali date or Nepali date to English/Indian date, the SriPatro Date Converter is the best free tool available online   Using the Indian to Nepali Date Converter, you can simply enter a Gregorian (AD) date like 13/06/2025, and it will instantly return the corresponding Nepali date — in this case, २०८२ जेठ ३१, शुक्रवार   Similarly, the reverse function lets you select a Nepali date (Bikram Sambat) such as 2082 Jestha 31 and get the exact English date — June 13, 2025, which is a Friday   This Nepali Patro app works by mapping the Bikram Sambat calendar with the Gregorian calendar through a pre programmed algorithm that considers leap years, month differences, and the 56  7 year gap between the two systems   Whether you are a student, traveler, or working with government forms in Nepal, SriPatro’s accurate, bilingual Nepali calendar date conversion feature ensures that you never make a mistake while translating dates   It’s fast, reliable, and perfect for daily use on mobile and web  '
        )}
      </p>
    </div>
    </>
  );
}
