'use client';

import React, { useEffect, useState } from 'react';
import { MhahPanchang } from 'mhah-panchang';
import NepaliDate from 'nepali-date-converter';

export default function LivePanchangCard() {
  const [now, setNow] = useState(new Date());
  const [panchang, setPanchang] = useState(null);
  const [sun, setSun] = useState(null);

  // 1) Tick the clock every second
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  // 2) Recalculate Panchang whenever `now` changes
  useEffect(() => {
    const obj = new MhahPanchang();
    // you can tweak lat/lng to your location
    const data = obj.calendar(now, 28.7041, 77.1025);
    console.log(data);
    setPanchang(data);
  }, [now]);

  // 3) Fetch sunrise/sunset once
  useEffect(() => {
    fetch(
      'https://api.sunrise-sunset.org/json?lat=28.7041&lng=77.1025&formatted=0'
    )
      .then(r => r.json())
      .then(j =>
        setSun({
          sunrise: new Date(j.results.sunrise),
          sunset: new Date(j.results.sunset)
        })
      )
      .catch(console.error);
  }, []);

  if (!panchang || !sun)
    return (
      <div className='max-w-md mx-auto bg-base-100 rounded-2xl shadow-lg overflow-hidden font-sans animate-pulse p-4 space-y-4'>
        <div className='flex justify-between'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <div className='skeleton w-2 h-2 rounded-full' />
              <div className='skeleton h-3 w-12 rounded' />
            </div>
            <div className='skeleton h-4 w-32 rounded' />
            <div className='skeleton h-3 w-20 rounded' />
          </div>
          <div className='text-right space-y-2'>
            <div className='skeleton h-4 w-20 rounded' />
            <div className='skeleton h-4 w-32 rounded' />
            <div className='skeleton h-4 w-28 rounded' />
            <div className='skeleton h-3 w-24 rounded' />
          </div>
        </div>

        <div className='flex justify-center'>
          <div className='skeleton w-24 h-24 rounded-full' />
        </div>

        <div className='flex justify-around text-sm py-2'>
          <div className='skeleton h-4 w-20 rounded' />
          <div className='skeleton h-4 w-20 rounded' />
        </div>

        <div className='space-y-2 text-sm'>
          <div className='skeleton h-3 w-40 rounded' />
          <div className='skeleton h-3 w-36 rounded' />
          <div className='skeleton h-3 w-48 rounded' />
          <div className='skeleton h-3 w-44 rounded' />
          <div className='skeleton h-3 w-38 rounded' />
        </div>
      </div>
    );

  // AD date parts
  const weekday = now.toLocaleDateString('en-GB', { weekday: 'long' });
  const adFull = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // BS date in Nepali script
  const bs = NepaliDate.fromAD(now);
  const bsFull = bs.format('YYYY MMMM D', 'np'); // e.g. "२०८२ जेठ १६"

  // Moon phase path
  const pakshaDir =
    panchang.Paksha.name_en_IN === 'Shukla' ? 'shukla' : 'krishna';
  const tithiName = panchang.Tithi.name_en_IN; // must match your PNG filenames
  const moonSrc = `moon/${pakshaDir}/${tithiName}.png`;

  return (
    <div className='max-w-md mx-auto bg-base-100 rounded-2xl shadow-lg overflow-hidden font-sans'>
      {/* header */}
      <div className='flex justify-between p-4'>
        <div className='flex flex-col justify-start items-start gap-2'>
          <div className='flex items-center gap-2'>
            <p className='w-2 h-2 bg-red-600 rounded-full animate-ping'></p>
            <span className='text-xs font-semibold uppercase'>Live</span>
          </div>
          <div className=' pb-2 text-center text-base-800 font-thin text-lg'>
            {panchang.Masa.name_en_IN}{' '}
            {pakshaDir === 'shukla' ? 'शुक्ल' : 'कृष्ण'} {tithiName}
            <div className='flex gap-1'>
              <p className='text-xs text-base-800'>सिद्धार्थी</p>{' '}
              <span className='text-xs text-base-800'>(२०५६)</span>
            </div>
          </div>
        </div>

        <div className='text-right text-sm'>
          <div className='font-medium'>{weekday}</div>
          <div className='text-lg font-semibold'>{adFull}</div>
          <div className='text-base-800'>{bsFull}</div>
          <div className='flex items-center gap-1 text-base   -800 mt-1'>
            ⏰ {timeStr}
          </div>
        </div>
      </div>

      {/* moon */}
      <div className='flex justify-center py-2'>
        <img
          src={moonSrc}
          alt='Moon phase'
          className='w-24 h-24 rounded-full border-4 border-base-600'
          onError={e => (e.target.style.display = 'none')}
        />
      </div>

      {/* sunrise / sunset */}
      <div className='flex justify-around text-sm font-semibold text-base-800 py-2 '>
        <div className='flex items-center gap-1'>
          🌅{' '}
          {sun.sunrise.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
        <div className='flex items-center gap-1'>
          🌇{' '}
          {sun.sunset.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
      </div>

      {/* panchang details */}
      <div className='p-4 space-y-1 text-sm'>
        <div>
          <strong>Tithi:</strong> {tithiName}, {panchang.Paksha.name_en_IN}{' '}
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
