"use client"

import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';
import { ArrowCounterClockwise, FileArrowDown, ShareNetwork, CaretLeft } from 'phosphor-react';
import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useTranslations } from 'next-intl';

function pad(n) { return String(n).padStart(2, '0'); }

function Kundali() {
  const t = useTranslations();
  const [planets, setPlanets] = useState(null);
  const [ascendantSign, setAscendantSign] = useState(null);
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      date: now.getDate(),
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds()
    };
  });
  const [latitude, setLatitude] = useState(28.5185347);
  const [longitude, setLongitude] = useState(77.1659952);
  const kundaliRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch planets when dateTime / lat / long change
  useEffect(() => {
    const fetchPlanets = async () => {
      try {
        const response = await fetch('https://json.apiastro.com/planets/extended', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'gsH9JZc46V6ReDRpCLQen6DJhw1gquqG3H7NIeeI'
          },
          body: JSON.stringify({
            year: dateTime.year,
            month: dateTime.month,
            date: dateTime.date,
            hours: dateTime.hours,
            minutes: dateTime.minutes,
            seconds: dateTime.seconds,
            latitude,
            longitude,
            timezone: 5.5,
            settings: { observation_point: 'topocentric', ayanamsha: 'lahiri', language: 'en' }
          })
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const responseData = await response.json();
        setPlanets(responseData.output);
        setAscendantSign(responseData.output.Ascendant.zodiac_sign_name);
      } catch (err) {
        console.error('Error fetching planets:', err);
      }
    };
    fetchPlanets();
  }, [dateTime, latitude, longitude]);

  // ---------- Helpers ----------
  const zodiacSigns = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const getSignNumberForHouse = houseNumber => {
    const ascendantIndex = zodiacSigns.indexOf(ascendantSign);
    const houseIndex = (ascendantIndex + houseNumber - 1) % 12;
    return houseIndex + 1;
  };
  const organizePlanetsByHouse = () => {
    const houses = {1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[],10:[],11:[],12:[]};
    if (!planets) return houses;
    Object.entries(planets).forEach(([planetName, planetData]) => {
      if (planetName !== 'Ascendant') {
        const houseNumber = planetData.house_number;
        if (houses[houseNumber]) houses[houseNumber].push({ name: planetName, data: planetData });
      }
    });
    return houses;
  };
  const houses = organizePlanetsByHouse();
  const houseCoordinates = {
    1:{x:150,y:100},2:{x:80,y:35},3:{x:40,y:75},4:{x:85,y:150},
    5:{x:35,y:228},6:{x:80,y:260},7:{x:150,y:220},8:{x:223,y:255},
    9:{x:265,y:228},10:{x:215,y:150},11:{x:265,y:75},12:{x:220,y:35}
  };
  const planetData = planets ? Object.entries(planets).map(([planetName, planetDetails])=>({
    name: planetName,
    sign: planetDetails.zodiac_sign_name,
    fullDegree: planetDetails.fullDegree,
    normDegree: planetDetails.normDegree,
    isRetro: planetDetails.isRetro,
    nakshatraName: planetDetails.nakshatra_name,
    nakshatraPada: planetDetails.nakshatra_pada
  })) : [];

  const moonChartHouses = (() => {
    const moon = planets ? planets.Moon : null;
    if (!moon) return null;
    const moonHouse = moon.house_number;
    const out = {1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[],10:[],11:[],12:[]};
    Object.entries(planets).forEach(([planetName, planetData]) => {
      if (planetName !== 'Ascendant') {
        let houseNumber = planetData.house_number - moonHouse + 1;
        houseNumber = houseNumber < 1 ? houseNumber + 12 : houseNumber;
        houseNumber = houseNumber % 12;
        houseNumber = houseNumber === 0 ? 12 : houseNumber;
        if (out[houseNumber]) out[houseNumber].push({ name: planetName, data: planetData });
      }
    });
    return out;
  })();

  const getMoonChartSignNumberForHouse = houseNumber => {
    const moon = planets ? planets.Moon : null;
    if (!moon) return '';
    const moonSignIndex = zodiacSigns.indexOf(moon.zodiac_sign_name);
    const houseIndex = (moonSignIndex + houseNumber - 1) % 12;
    return houseIndex + 1;
  };

  const planetEmojis = { Sun:'☉', Moon:'☾', Mars:'♂', Mercury:'☿️', Jupiter:'♃', Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋', Uranus:'⛢', Neptune:'♆', Pluto:'♇', Ascendant:'🔺' };

  // ---------- Sanitization & capture (same robust flow) ----------
  const inlineWatermarkSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="220" height="80" viewBox="0 0 220 80">
      <rect width="220" height="80" fill="none"/>
      <text x="110" y="44" text-anchor="middle" font-family="sans-serif" font-size="20" fill="rgba(0,0,0,0.08)">SriPatro</text>
    </svg>
  `;

  const sanitizeSVGElements = (orig, clone) => {
    try {
      const origSvgs = orig.querySelectorAll('svg');
      const cloneSvgs = clone.querySelectorAll('svg');
      for (let i = 0; i < origSvgs.length; i++) {
        const oSvg = origSvgs[i];
        const cSvg = cloneSvgs[i];
        if (!cSvg) continue;

        const viewBox = oSvg.getAttribute('viewBox');
        if (viewBox && !cSvg.getAttribute('viewBox')) cSvg.setAttribute('viewBox', viewBox);
        if (oSvg.getAttribute('width')) cSvg.setAttribute('width', oSvg.getAttribute('width'));
        if (oSvg.getAttribute('height')) cSvg.setAttribute('height', oSvg.getAttribute('height'));

        const svgChildren = cSvg.querySelectorAll('*');
        const origChildren = oSvg.querySelectorAll('*');

        for (let j = 0; j < svgChildren.length; j++) {
          const oc = origChildren[j];
          const cc = svgChildren[j];
          if (!cc) continue;
          const tag = cc.tagName.toLowerCase();
          const cs = oc ? window.getComputedStyle(oc) : null;

          if (['line','rect','path','circle','ellipse','polyline','polygon'].includes(tag)) {
            const stroke = cc.getAttribute('stroke') || (cs && cs.stroke) || '#000';
            const strokeWidth = cc.getAttribute('stroke-width') || (cs && cs.strokeWidth) || '1';
            const fillAttr = cc.getAttribute('fill') || (cs && cs.fill) || 'none';
            cc.setAttribute('stroke', stroke === 'none' ? '#000' : stroke);
            cc.setAttribute('stroke-width', strokeWidth);
            if (fillAttr && fillAttr !== 'none') cc.setAttribute('fill', fillAttr);
            else cc.setAttribute('fill', 'none');
            cc.setAttribute('vector-effect', 'non-scaling-stroke');
          }

          if (tag === 'text' || tag === 'tspan') {
            const fill = cc.getAttribute('fill') || (cs && cs.color) || '#000';
            cc.setAttribute('fill', (fill && fill.indexOf('oklch') === -1 ? fill : '#000'));
            if (cs) {
              if (cs.fontSize) cc.setAttribute('font-size', cs.fontSize);
              if (cs.fontFamily) cc.setAttribute('font-family', cs.fontFamily.split(',')[0].replace(/["']/g, ''));
              if (cs.fontWeight) cc.setAttribute('font-weight', cs.fontWeight);
            }
          }
        }
      }
    } catch (e) { console.warn('SVG sanitize error', e); }
  };

  const createSanitizedClone = (el) => {
    const clone = el.cloneNode(true);
    const origNodes = el.querySelectorAll('*');
    const cloneNodes = clone.querySelectorAll('*');

    for (let i = 0; i < origNodes.length; i++) {
      const orig = origNodes[i];
      const c = cloneNodes[i];
      if (!c || !orig) continue;
      const cs = window.getComputedStyle(orig);

      let bg = cs.backgroundColor || cs.background;
      if (!bg || typeof bg !== 'string' || bg.includes('oklch') || bg.includes('color(')) bg = '#ffffff';
      c.style.background = bg;

      let color = cs.color || '#000';
      if (typeof color !== 'string' || color.includes('oklch') || color.includes('color(')) color = '#000000';
      c.style.color = color;

      c.style.filter = 'none';
      c.style.backdropFilter = 'none';
      c.style.boxShadow = 'none';

      if (cs.borderRadius) c.style.borderRadius = cs.borderRadius;
      if (cs.border) c.style.border = cs.border;

      if (c.tagName && c.tagName.toLowerCase() === 'img') {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = inlineWatermarkSVG;
        c.replaceWith(wrapper.firstElementChild);
      }
    }

    const imgs = clone.querySelectorAll('img');
    imgs.forEach(img => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = inlineWatermarkSVG;
      img.replaceWith(wrapper.firstElementChild);
    });

    sanitizeSVGElements(el, clone);

    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '0';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.background = '#ffffff';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    return { wrapper, clone };
  };

  const captureToBlob = async (el) => {
    const { wrapper, clone } = createSanitizedClone(el);
    try {
      const canvas = await html2canvas(clone, { useCORS: true, scale: 2, backgroundColor: null, logging: false });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob) { try { document.body.removeChild(wrapper); } catch(_) {} return blob; }
    } catch (hcErr) { console.warn('html2canvas failed:', hcErr); }

    try {
      const blob = await domtoimage.toBlob(clone);
      if (blob) { try { document.body.removeChild(wrapper); } catch(_) {} return blob; }
    } catch (domErr) { console.warn('dom-to-image failed:', domErr); }
    try { document.body.removeChild(wrapper); } catch(_) {}
    throw new Error('Capture failed (both html2canvas and dom-to-image failed)');
  };

  const downloadKundali = async () => {
    if (!kundaliRef.current) return;
    setIsProcessing(true);
    try {
      const blob = await captureToBlob(kundaliRef.current);
      saveAs(blob, 'kundali_report.png');
    } catch (err) {
      console.error('Download error:', err);
      alert(t ? t('Error creating image. See console.') : 'Error creating image. See console.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!kundaliRef.current) return;
    setIsProcessing(true);
    try {
      const blob = await captureToBlob(kundaliRef.current);
      const file = new File([blob], 'kundali_report.png', { type: 'image/png' });
      const canShareFiles = !!(navigator.canShare && navigator.canShare({ files: [file] }));
      if (navigator.share && canShareFiles) {
        await navigator.share({ title: 'Kundali Report', text: 'Generated by SriPatro', files: [file] });
        setIsProcessing(false);
        return;
      }
      if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          alert(t ? t('Image copied to clipboard') : 'Image copied to clipboard');
          setIsProcessing(false);
          return;
        } catch (clipErr) { console.warn('Clipboard write failed:', clipErr); }
      }
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 20000);
    } catch (err) {
      console.error('Share error:', err);
      alert(t ? t('Error sharing. See console.') : 'Error sharing. See console.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------- NEW: handlers for inputs ----------
  const handleDateTimeInput = (e) => {
    const val = e.target.value; // expected format "YYYY-MM-DDTHH:mm"
    if (!val) return;
    const d = new Date(val);
    if (isNaN(d.getTime())) return;
    setDateTime({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      date: d.getDate(),
      hours: d.getHours(),
      minutes: d.getMinutes(),
      seconds: d.getSeconds()
    });
  };
  const handleLatChange = (e) => setLatitude(parseFloat(e.target.value || 0));
  const handleLongChange = (e) => setLongitude(parseFloat(e.target.value || 0));

  // compute value for datetime-local input
  const datetimeLocalValue = `${dateTime.year}-${pad(dateTime.month)}-${pad(dateTime.date)}T${pad(dateTime.hours)}:${pad(dateTime.minutes)}`;

  if (!planets) {
    return (
      <div className='bg-base-100 text-base-content gap-2 flex h-[60vh] items-center justify-center'>
        <span className='loading loading-spinner loading-lg'></span>
      </div>
    );
  }

  return (
    <div className='bg-base-100 flex flex-col items-center py-8'>
      <div className='w-full max-w-6xl mx-auto p-4'>
        <div className='bg-base-100/95  backdrop-blur-sm rounded-2xl shadow-2xl p-5'>
          {/* Top row: back + inputs + actions */}
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4'>
            <div className='flex items-center gap-3'>
              <a href='/' className='inline-flex items-center gap-2 text-base-700 hover:underline'>
                <CaretLeft size={18} />
                <span className='font-medium'>{t ? t('Back') : 'Back'}</span>
              </a>
              <div className='text-sm text-neutral-500'>{t ? t('Kundali Report') : 'Kundali Report'}</div>
            </div>

            <div className='flex gap-3 items-center'>
              {/* Date/time input */}
              <div className='flex items-center gap-2 bg-base-100 rounded-full px-3 py-1 shadow-sm border border-base-300'>
                <label className='sr-only' htmlFor='datetime'>{t ? t('Date and time') : 'Date and time'}</label>
                <input
                  id='datetime'
                  name='datetime'
                  type='datetime-local'
                  value={datetimeLocalValue}
                  onChange={handleDateTimeInput}
                  className='appearance-none bg-transparent outline-none text-sm px-2'
                />
              </div>

              {/* Latitude / Longitude */}
              <div className='flex items-center gap-2 bg-base-100 rounded-full px-3 py-1 shadow-sm border border-base-300'>
                <label className='sr-only' htmlFor='lat'>Lat</label>
                <input id='lat' type='number' step='0.000001' value={latitude} onChange={handleLatChange} className='w-[110px] bg-transparent outline-none text-sm px-2' />
                <span className='text-xs text-neutral-400'>|</span>
                <label className='sr-only' htmlFor='long'>Lng</label>
                <input id='long' type='number' step='0.000001' value={longitude} onChange={handleLongChange} className='w-[110px] bg-transparent outline-none text-sm px-2' />
              </div>

              {/* Actions (download/share) */}
              <div className='flex items-center gap-2'>
                <button onClick={downloadKundali} disabled={isProcessing} className='flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border'>
                  <FileArrowDown size={18} className='text-red-600' />
                  <span className='text-sm font-medium text-neutral-800'>{t ? t('Download Kundali') : 'Download'}</span>
                </button>

                <button onClick={handleShare} disabled={isProcessing} className='flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-full shadow-sm'>
                  <ShareNetwork size={18} weight='bold' />
                  <span className='text-sm font-medium'>{t ? t('Share Report') : 'Share'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Capture area */}
          <div ref={kundaliRef} className='p-4 rounded-xl bg-base-100 shadow-inner border border-base-300'>
            <div className='breadcrumbs mb-3 text-sm text-neutral-500'>
              <ul><li>{t ? t('Generated by SriPatro') : 'Generated by SriPatro'}</li></ul>
            </div>

            {/* charts */}
            <div className='flex flex-wrap gap-6 justify-center items-start'>
              <div className='relative w-[350px] h-[350px] flex-none bg-transparent'>
                <svg width='350' height='350' viewBox='0 0 350 350' xmlns='http://www.w3.org/2000/svg' className='block'>
                  <rect x='10' y='10' width='280' height='280' fill='none' stroke='currentColor' strokeWidth='1.25' />
                  <line x1='150' y1='10' x2='290' y2='150' stroke='currentColor' strokeWidth='1.25' />
                  <line x1='290' y1='150' x2='150' y2='290' stroke='currentColor' strokeWidth='1.25' />
                  <line x1='150' y1='290' x2='10' y2='150' stroke='currentColor' strokeWidth='1.25' />
                  <line x1='10' y1='150' x2='150' y2='10' stroke='currentColor' strokeWidth='1.25' />
                  <line x1='10' y1='10' x2='290' y2='290' stroke='currentColor' strokeWidth='1.25' />
                  <line x1='290' y1='10' x2='10' y2='290' stroke='currentColor' strokeWidth='1.25' />

                  {Object.keys(houses).map(houseNumber => {
                    const planetsInHouse = houses[houseNumber];
                    const coords = houseCoordinates[houseNumber];
                    return (
                      <g key={`d1-${houseNumber}`}>
                        <text x={coords.x} y={coords.y} textAnchor='middle' fill='currentColor' fontSize='15'>{getSignNumberForHouse(parseInt(houseNumber))}</text>
                        {planetsInHouse.map((planet, idx) => (
                          <text key={`${planet.name}-${idx}`} x={coords.x} y={coords.y + 18 + idx * 14} textAnchor='middle' fill='currentColor' fontSize='18' fontWeight='700'>
                            {t ? t(`planets.${planet.name.slice(0,2)}`) : planet.name.slice(0,2)}
                          </text>
                        ))}
                      </g>
                    );
                  })}
                </svg>

                <div className='pointer-events-none absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30' dangerouslySetInnerHTML={{__html: inlineWatermarkSVG}} />
              </div>

              <div className='relative w-[350px] h-[350px] flex-none bg-transparent'>
                <svg width='350' height='350' viewBox='0 0 350 350' xmlns='http://www.w3.org/2000/svg' className='block'>
                  <rect x='10' y='10' width='280' height='280' fill='none' stroke='currentColor' strokeWidth='1.25' />
                  <line x1='150' y1='10' x2='290' y2='150' stroke='currentColor' strokeWidth='1.25' />
                  <line x1='290' y1='150' x2='150' y2='290' stroke='currentColor' strokeWidth='1.25' />
                  <line x1='150' y1='290' x2='10' y2='150' stroke='currentColor' strokeWidth='1.25' />
                  <line x1='10' y1='150' x2='150' y2='10' stroke='currentColor' strokeWidth='1.25' />
                  <line x1='10' y1='10' x2='290' y2='290' stroke='currentColor' strokeWidth='1.25' />
                  <line x1='290' y1='10' x2='10' y2='290' stroke='currentColor' strokeWidth='1.25' />

                  {moonChartHouses && Object.keys(moonChartHouses).map(houseNumber => {
                    const planetsInHouse = moonChartHouses[houseNumber];
                    const coords = houseCoordinates[houseNumber];
                    return (
                      <g key={`moon-${houseNumber}`}>
                        <text x={coords.x} y={coords.y} textAnchor='middle' fill='currentColor' fontSize='15'>{getMoonChartSignNumberForHouse(parseInt(houseNumber))}</text>
                        {planetsInHouse.map((planet, idx) => (
                          <text key={`${planet.name}-${idx}`} x={coords.x} y={coords.y + 18 + idx * 14} textAnchor='middle' fill='currentColor' fontSize='18' fontWeight='700'>
                            {t ? t(`planets.${planet.name.slice(0,2)}`) : planet.name.slice(0,2)}
                          </text>
                        ))}
                      </g>
                    );
                  })}
                </svg>

                <div className='pointer-events-none absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30' dangerouslySetInnerHTML={{__html: inlineWatermarkSVG}} />
              </div>
            </div>

            <div className='h-px bg-gray-100 my-4' />

            {/* table */}
            <div className='overflow-x-auto'>
              <table className='min-w-full'>
                <thead>
                  <tr className='bg-red-600 text-white'>
                    <th className='p-2 text-left text-xs font-semibold'>{t ? t('Planet Name (Retro)') : 'Planet'}</th>
                    <th className='p-2 text-left text-xs font-semibold'>{t ? t('Full Degree') : 'Full Degree'}</th>
                    <th className='p-2 text-left text-xs font-semibold'>{t ? t('Norm Degree') : 'Norm'}</th>
                    <th className='p-2 text-left text-xs font-semibold'>{t ? t('Sign') : 'Sign'}</th>
                    <th className='p-2 text-left text-xs font-semibold'>{t ? t('Nakshatra (Pada)') : 'Nakshatra'}</th>
                  </tr>
                </thead>
                <tbody>
                  {planetData.map(planet => (
                    <tr key={planet.name} className='border-b'>
                      <td className='p-2'>
                        <div className='flex items-center gap-2'>
                          <span className='text-lg'>{planetEmojis[planet.name] || ''}</span>
                          <div>
                            <div className='font-medium text-sm'>{t ? t(`planetFull.${planet.name}`) : planet.name}</div>
                            {planet.isRetro === 'true' && (
                              <div className='text-xs text-red-600 flex items-center gap-1'>
                                <ArrowCounterClockwise size={14} />
                                <span>{t ? t('Retrograde') : 'Retro'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='p-2 text-sm'>{planet.fullDegree.toFixed(2)}°</td>
                      <td className='p-2 text-sm'>{planet.normDegree.toFixed(2)}°</td>
                      <td className='p-2 text-sm'>{t ? t(`rasi.${planet.sign}`) : planet.sign}</td>
                      <td className='p-2 text-sm'>{t ? t(`nakshatra.${planet.nakshatraName}`) : planet.nakshatraName} ({planet.nakshatraPada})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* bottom action */}
          <div className='mt-6 flex flex-col sm:flex-row gap-3 justify-between items-center'>
            <div className='text-sm text-neutral-500'>
              {t ? t('Date/Time') : 'Date/Time'}: {dateTime.year}-{pad(dateTime.month)}-{pad(dateTime.date)} {pad(dateTime.hours)}:{pad(dateTime.minutes)}
            </div>

	  {/* <div className='flex gap-3'>
              <button onClick={downloadKundali} disabled={isProcessing} className='flex items-center gap-2 px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow-md'>
                <FileArrowDown size={16} className='text-red-600' />
                <span className='text-sm font-medium'>{t ? t('Download Kundali') : 'Download Kundali'}</span>
              </button>

              <button onClick={handleShare} disabled={isProcessing} className='flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white shadow-sm hover:opacity-95'>
                <ShareNetwork size={16} weight='bold' />
                <span className='text-sm font-medium'>{t ? t('Share Kundali') : 'Share Kundali'}</span>
              </button>
            </div>*/}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Kundali;

