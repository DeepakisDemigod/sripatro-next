"use client";

import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";
import {
  ArrowCounterClockwise,
  FileArrowDown,
  ShareNetwork,
  CaretLeft,
  Trash,
  X,
  CircleNotch,
} from "phosphor-react";
import { useState, useEffect, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import { useTranslations } from "next-intl";
import Comments from "./Comments/Comments";

function pad(n) {
  return String(n).padStart(2, "0");
}

function Kundali({
  initialLoadEntry = null,
  embedded = false,
  onClose = null,
  autoShareOnce = false,
  onShared = null,
}) {
  const t = useTranslations();
  const [planets, setPlanets] = useState(null);
  const [ascendantSign, setAscendantSign] = useState(null);
  const [dateTime, setDateTime] = useState(null);
  const [latitude, setLatitude] = useState(28.5185347);
  const [longitude, setLongitude] = useState(77.1659952);
  const [country, setCountry] = useState("IN"); // IN or NP when embedded
  const kundaliRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userName, setUserName] = useState("");

  // History state
  const [history, setHistory] = useState([]);
  const HISTORY_KEY = "kundali_history";
  const [pendingScroll, setPendingScroll] = useState(false);
  const autoSharedRef = useRef(false);
  const initFromEntryRef = useRef(false);

  const loadHistory = () => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem(HISTORY_KEY)
          : null;
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  const saveHistory = (arr) => {
    try {
      if (typeof window !== "undefined")
        localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
    } catch {}
  };

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // On-demand fetch only when user clicks Get Kundali
  const handleGetKundali = async ({ skipSave = false } = {}) => {
    setIsProcessing(true);
    try {
      if (!dateTime) {
        alert(
          t
            ? t("kundali.pleaseSelectDateTimeFirst")
            : "Please select date and time first."
        );
        return;
      }
      const response = await fetch(
        "https://json.apiastro.com/planets/extended",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "gsH9JZc46V6ReDRpCLQen6DJhw1gquqG3H7NIeeI",
          },
          body: JSON.stringify({
            year: dateTime.year,
            month: dateTime.month,
            date: dateTime.date,
            hours: dateTime.hours,
            minutes: dateTime.minutes,
            seconds: dateTime.seconds,
            latitude:
              embedded && country === "NP"
                ? 27.7172
                : embedded && country === "IN"
                  ? 28.6139
                  : latitude,
            longitude:
              embedded && country === "NP"
                ? 85.324
                : embedded && country === "IN"
                  ? 77.209
                  : longitude,
            timezone: 5.5,
            settings: {
              observation_point: "topocentric",
              ayanamsha: "lahiri",
              language: "en",
            },
          }),
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const responseData = await response.json();
      setPlanets(responseData.output);
      setAscendantSign(responseData.output.Ascendant.zodiac_sign_name);
      if (pendingScroll && kundaliRef.current) {
        try {
          kundaliRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } catch {}
        setPendingScroll(false);
      }
      if (!skipSave) {
        const jsDate = new Date(
          dateTime.year,
          dateTime.month - 1,
          dateTime.date,
          dateTime.hours,
          dateTime.minutes,
          dateTime.seconds || 0
        );
        const englishStr = jsDate.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const effLat =
          embedded && country === "NP"
            ? 27.7172
            : embedded && country === "IN"
              ? 28.6139
              : latitude;
        const effLong =
          embedded && country === "NP"
            ? 85.324
            : embedded && country === "IN"
              ? 77.209
              : longitude;
        const payload = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: userName || "",
          generatedAt: new Date().toISOString(),
          input: {
            dateTime: jsDate.toISOString(),
            latitude: effLat,
            longitude: effLong,
          },
          englishDateTime: englishStr,
          ascendant: responseData?.output?.Ascendant?.zodiac_sign_name || null,
          summary: {
            moonSign: responseData?.output?.Moon?.zodiac_sign_name || null,
            sunSign: responseData?.output?.Sun?.zodiac_sign_name || null,
          },
        };
        addHistoryEntry(payload);
      }
    } catch (err) {
      console.error("Error fetching planets:", err);
      alert("Failed to generate Kundali. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // If an initial saved entry is provided (e.g., opened from a list), load it
  useEffect(() => {
    if (!initialLoadEntry) return;
    const h = initialLoadEntry;
    if (h.input) {
      if (h.input.dateTime) {
        const d = new Date(h.input.dateTime);
        if (!isNaN(d.getTime())) {
          setDateTime({
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            date: d.getDate(),
            hours: d.getHours(),
            minutes: d.getMinutes(),
            seconds: d.getSeconds(),
          });
        }
      }
      if (embedded) {
        if (
          typeof h.input?.latitude === "number" &&
          typeof h.input?.longitude === "number"
        ) {
          if (
            Math.abs(h.input.latitude - 27.7172) < 0.1 &&
            Math.abs(h.input.longitude - 85.324) < 0.1
          ) {
            setCountry("NP");
          } else if (
            Math.abs(h.input.latitude - 28.6139) < 0.1 &&
            Math.abs(h.input.longitude - 77.209) < 0.1
          ) {
            setCountry("IN");
          }
        }
      } else {
        if (typeof h.input.latitude === "number") setLatitude(h.input.latitude);
        if (typeof h.input.longitude === "number")
          setLongitude(h.input.longitude);
      }
    }
    setUserName(h.name || "");
    setPendingScroll(true);
    initFromEntryRef.current = !autoShareOnce;
  }, [initialLoadEntry]);

  // After dateTime is set from saved entry, trigger generation once
  useEffect(() => {
    if (!initFromEntryRef.current) return;
    if (!dateTime) return;
    initFromEntryRef.current = false;
    handleGetKundali({ skipSave: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateTime]);

  // Auto-share: if requested, fetch if needed first, then share
  useEffect(() => {
    if (!autoShareOnce || autoSharedRef.current) return;
    autoSharedRef.current = true;
    (async () => {
      try {
        if (!planets) {
          await handleGetKundali({ skipSave: true });
        }
        await new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r))
        );
        await handleShare();
      } catch (_) {
      } finally {
        if (onShared) onShared();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoShareOnce]);

  // ---------- Helpers ----------
  const zodiacSigns = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];
  const getSignNumberForHouse = (houseNumber) => {
    if (!ascendantSign) return "";
    const ascendantIndex = zodiacSigns.indexOf(ascendantSign);
    if (ascendantIndex < 0) return "";
    const houseIndex = (ascendantIndex + houseNumber - 1) % 12;
    return houseIndex + 1;
  };
  const organizePlanetsByHouse = () => {
    const houses = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
      10: [],
      11: [],
      12: [],
    };
    if (!planets) return houses;
    Object.entries(planets).forEach(([planetName, planetData]) => {
      if (planetName !== "Ascendant") {
        const houseNumber = planetData.house_number;
        if (houses[houseNumber])
          houses[houseNumber].push({ name: planetName, data: planetData });
      }
    });
    return houses;
  };
  const houses = organizePlanetsByHouse();
  const houseCoordinates = {
    1: { x: 150, y: 100 },
    2: { x: 80, y: 35 },
    3: { x: 40, y: 75 },
    4: { x: 85, y: 150 },
    5: { x: 35, y: 228 },
    6: { x: 80, y: 260 },
    7: { x: 150, y: 220 },
    8: { x: 223, y: 255 },
    9: { x: 265, y: 228 },
    10: { x: 215, y: 150 },
    11: { x: 265, y: 75 },
    12: { x: 220, y: 35 },
  };
  const planetData = planets
    ? Object.entries(planets).map(([planetName, planetDetails]) => ({
        name: planetName,
        sign: planetDetails.zodiac_sign_name,
        fullDegree: planetDetails.fullDegree,
        normDegree: planetDetails.normDegree,
        isRetro: planetDetails.isRetro,
        nakshatraName: planetDetails.nakshatra_name,
        nakshatraPada: planetDetails.nakshatra_pada,
      }))
    : [];

  const moonChartHouses = (() => {
    const moon = planets ? planets.Moon : null;
    if (!moon) return null;
    const moonHouse = moon.house_number;
    const out = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
      10: [],
      11: [],
      12: [],
    };
    Object.entries(planets).forEach(([planetName, planetData]) => {
      if (planetName !== "Ascendant") {
        let houseNumber = planetData.house_number - moonHouse + 1;
        houseNumber = houseNumber < 1 ? houseNumber + 12 : houseNumber;
        houseNumber = houseNumber % 12;
        houseNumber = houseNumber === 0 ? 12 : houseNumber;
        if (out[houseNumber])
          out[houseNumber].push({ name: planetName, data: planetData });
      }
    });
    return out;
  })();

  const getMoonChartSignNumberForHouse = (houseNumber) => {
    const moon = planets ? planets.Moon : null;
    if (!moon) return "";
    const moonSignIndex = zodiacSigns.indexOf(moon.zodiac_sign_name);
    const houseIndex = (moonSignIndex + houseNumber - 1) % 12;
    return houseIndex + 1;
  };

  const planetEmojis = {
    Sun: "☉",
    Moon: "☾",
    Mars: "♂",
    Mercury: "☿️",
    Jupiter: "♃",
    Venus: "♀",
    Saturn: "♄",
    Rahu: "☊",
    Ketu: "☋",
    Uranus: "⛢",
    Neptune: "♆",
    Pluto: "♇",
    Ascendant: "🔺",
  };

  // ---------- History helpers ----------
  const avatarForName = (name) => {
    const n = (name || "Unnamed").trim();
    const initials =
      n
        .split(/\s+/)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() || "")
        .join("") || "UN";
    const palette = [
      "#f97316",
      "#ef4444",
      "#8b5cf6",
      "#06b6d4",
      "#22c55e",
      "#eab308",
      "#ec4899",
      "#0ea5e9",
    ];
    let hash = 0;
    for (let i = 0; i < n.length; i++)
      hash = (hash * 31 + n.charCodeAt(i)) >>> 0;
    const color = palette[hash % palette.length];
    return { initials, color };
  };

  const addHistoryEntry = (entry) => {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 50);
      saveHistory(next);
      return next;
    });
  };
  const deleteHistoryEntry = (id) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveHistory(next);
      return next;
    });
  };
  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const saveCurrentReport = () => {
    if (!planets) return;
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const jsDate = new Date(
      dateTime.year,
      dateTime.month - 1,
      dateTime.date,
      dateTime.hours,
      dateTime.minutes,
      dateTime.seconds || 0
    );
    const englishStr = jsDate.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const payload = {
      id,
      name: userName || "",
      generatedAt: new Date().toISOString(),
      input: {
        dateTime: jsDate.toISOString(),
        latitude,
        longitude,
      },
      englishDateTime: englishStr,
      ascendant: ascendantSign || null,
      summary: {
        moonSign: planets?.Moon?.zodiac_sign_name || null,
        sunSign: planets?.Sun?.zodiac_sign_name || null,
      },
    };
    addHistoryEntry(payload);
  };

  // ---------- Sanitization & capture (same robust flow) ----------
  const inlineWatermarkSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="220" height="80" viewBox="0 0 220 80">
      <rect width="220" height="80" fill="none"/>
      <text x="110" y="44" text-anchor="middle" font-family="sans-serif" font-size="20" fill="rgba(0,0,0,0.08)">SriPatro</text>
    </svg>
  `;

  const sanitizeSVGElements = (orig, clone) => {
    try {
      const origSvgs = orig.querySelectorAll("svg");
      const cloneSvgs = clone.querySelectorAll("svg");
      for (let i = 0; i < origSvgs.length; i++) {
        const oSvg = origSvgs[i];
        const cSvg = cloneSvgs[i];
        if (!cSvg) continue;

        const viewBox = oSvg.getAttribute("viewBox");
        if (viewBox && !cSvg.getAttribute("viewBox"))
          cSvg.setAttribute("viewBox", viewBox);
        if (oSvg.getAttribute("width"))
          cSvg.setAttribute("width", oSvg.getAttribute("width"));
        if (oSvg.getAttribute("height"))
          cSvg.setAttribute("height", oSvg.getAttribute("height"));

        const svgChildren = cSvg.querySelectorAll("*");
        const origChildren = oSvg.querySelectorAll("*");

        for (let j = 0; j < svgChildren.length; j++) {
          const oc = origChildren[j];
          const cc = svgChildren[j];
          if (!cc) continue;
          const tag = cc.tagName.toLowerCase();
          const cs = oc ? window.getComputedStyle(oc) : null;

          if (
            [
              "line",
              "rect",
              "path",
              "circle",
              "ellipse",
              "polyline",
              "polygon",
            ].includes(tag)
          ) {
            const stroke =
              cc.getAttribute("stroke") || (cs && cs.stroke) || "#000";
            const strokeWidth =
              cc.getAttribute("stroke-width") || (cs && cs.strokeWidth) || "1";
            const fillAttr =
              cc.getAttribute("fill") || (cs && cs.fill) || "none";
            cc.setAttribute("stroke", stroke === "none" ? "#000" : stroke);
            cc.setAttribute("stroke-width", strokeWidth);
            if (fillAttr && fillAttr !== "none")
              cc.setAttribute("fill", fillAttr);
            else cc.setAttribute("fill", "none");
            cc.setAttribute("vector-effect", "non-scaling-stroke");
          }

          if (tag === "text" || tag === "tspan") {
            const fill = cc.getAttribute("fill") || (cs && cs.color) || "#000";
            cc.setAttribute(
              "fill",
              fill && fill.indexOf("oklch") === -1 ? fill : "#000"
            );
            if (cs) {
              if (cs.fontSize) cc.setAttribute("font-size", cs.fontSize);
              if (cs.fontFamily)
                cc.setAttribute(
                  "font-family",
                  cs.fontFamily.split(",")[0].replace(/["']/g, "")
                );
              if (cs.fontWeight) cc.setAttribute("font-weight", cs.fontWeight);
            }
          }
        }
      }
    } catch (e) {
      console.warn("SVG sanitize error", e);
    }
  };

  const createSanitizedClone = (el) => {
    const clone = el.cloneNode(true);
    const origNodes = el.querySelectorAll("*");
    const cloneNodes = clone.querySelectorAll("*");

    for (let i = 0; i < origNodes.length; i++) {
      const orig = origNodes[i];
      const c = cloneNodes[i];
      if (!c || !orig) continue;
      const cs = window.getComputedStyle(orig);

      let bg = cs.backgroundColor || cs.background;
      if (
        !bg ||
        typeof bg !== "string" ||
        bg.includes("oklch") ||
        bg.includes("color(")
      )
        bg = "#ffffff";
      c.style.background = bg;

      let color = cs.color || "#000";
      if (
        typeof color !== "string" ||
        color.includes("oklch") ||
        color.includes("color(")
      )
        color = "#000000";
      c.style.color = color;

      c.style.filter = "none";
      c.style.backdropFilter = "none";
      c.style.boxShadow = "none";

      if (cs.borderRadius) c.style.borderRadius = cs.borderRadius;
      if (cs.border) c.style.border = cs.border;

      if (c.tagName && c.tagName.toLowerCase() === "img") {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = inlineWatermarkSVG;
        c.replaceWith(wrapper.firstElementChild);
      }
    }

    const imgs = clone.querySelectorAll("img");
    imgs.forEach((img) => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = inlineWatermarkSVG;
      img.replaceWith(wrapper.firstElementChild);
    });

    sanitizeSVGElements(el, clone);

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-9999px";
    wrapper.style.top = "0";
    wrapper.style.pointerEvents = "none";
    wrapper.style.background = "#ffffff";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    return { wrapper, clone };
  };

  const captureToBlob = async (el) => {
    const { wrapper, clone } = createSanitizedClone(el);
    try {
      const canvas = await html2canvas(clone, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
        logging: false,
      });
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (blob) {
        try {
          document.body.removeChild(wrapper);
        } catch (_) {}
        return blob;
      }
    } catch (hcErr) {
      console.warn("html2canvas failed:", hcErr);
    }

    try {
      const blob = await domtoimage.toBlob(clone);
      if (blob) {
        try {
          document.body.removeChild(wrapper);
        } catch (_) {}
        return blob;
      }
    } catch (domErr) {
      console.warn("dom-to-image failed:", domErr);
    }
    try {
      document.body.removeChild(wrapper);
    } catch (_) {}
    throw new Error(
      "Capture failed (both html2canvas and dom-to-image failed)"
    );
  };

  const downloadKundali = async () => {
    if (!kundaliRef.current) return;
    setIsProcessing(true);
    try {
      const blob = await captureToBlob(kundaliRef.current);
      saveAs(blob, "kundali_report.png");
    } catch (err) {
      console.error("Download error:", err);
      alert(
        t
          ? t("kundali.errorCreatingImageSeeConsole")
          : "Error creating image. See console."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!kundaliRef.current) return;
    setIsProcessing(true);
    try {
      const blob = await captureToBlob(kundaliRef.current);
      const file = new File([blob], "kundali_report.png", {
        type: "image/png",
      });
      const canShareFiles = !!(
        navigator.canShare && navigator.canShare({ files: [file] })
      );
      if (navigator.share && canShareFiles) {
        await navigator.share({
          title: "Kundali Report",
          text: "Generated by SriPatro",
          files: [file],
        });
        setIsProcessing(false);
        return;
      }
      if (
        navigator.clipboard &&
        navigator.clipboard.write &&
        window.ClipboardItem
      ) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          alert(
            t
              ? t("kundali.imageCopiedToClipboard")
              : "Image copied to clipboard"
          );
          setIsProcessing(false);
          return;
        } catch (clipErr) {
          console.warn("Clipboard write failed:", clipErr);
        }
      }
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 20000);
    } catch (err) {
      console.error("Share error:", err);
      alert(
        t ? t("kundali.errorSharingSeeConsole") : "Error sharing. See console."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------- NEW: handlers for inputs ----------
  const handleDateTimeInput = (e) => {
    const val = e.target.value; // expected format "YYYY-MM-DDTHH:mm"
    if (!val) {
      setDateTime(null);
      return;
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return;
    setDateTime({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      date: d.getDate(),
      hours: d.getHours(),
      minutes: d.getMinutes(),
      seconds: d.getSeconds(),
    });
  };
  const handleLatChange = (e) => setLatitude(parseFloat(e.target.value || 0));
  const handleLongChange = (e) => setLongitude(parseFloat(e.target.value || 0));

  // compute value for datetime-local input
  const datetimeLocalValue = dateTime
    ? `${dateTime.year}-${pad(dateTime.month)}-${pad(dateTime.date)}T${pad(dateTime.hours)}:${pad(dateTime.minutes)}`
    : "";

  return (
    <div
      className={
        embedded ? "w-full" : "bg-base-100 flex flex-col items-center py-8"
      }
    >
      <div className="w-full max-w-6xl mx-auto p-3 sm:p-4">
        <div className="bg-base-100/95  backdrop-blur-sm rounded-2xl p-3 sm:p-5">
          {/* Top row: back + inputs + actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-3">
              {embedded ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  aria-label="Close"
                  onClick={() => onClose && onClose()}
                >
                  <X size={18} />
                </button>
              ) : (
                <a
                  href="/"
                  className="inline-flex items-center gap-2 text-base-700 hover:underline"
                >
                  <CaretLeft size={18} />
                  <span className="font-medium">{t ? t("Back") : "Back"}</span>
                </a>
              )}
              <div className="text-sm text-neutral-500">
                {t ? t("Kundali Report") : "Kundali Report"}
              </div>
              {isProcessing && (
                <span
                  className="inline-flex items-center gap-1 text-xs text-blue-600"
                  role="status"
                  aria-live="polite"
                >
                  <CircleNotch size={14} className="animate-spin" />
                  <span>{t ? t("kundali.generating") : "Generating…"}</span>
                </span>
              )}
            </div>

            <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
              {/* Date/time input */}
              <div className="flex items-center gap-2 bg-base-100 rounded-full px-2 sm:px-3 py-1 shadow-sm border border-base-300 w-full sm:w-auto">
                <label className="sr-only" htmlFor="datetime">
                  {t ? t("Date and time") : "Date and time"}
                </label>
                <input
                  id="datetime"
                  name="datetime"
                  type="datetime-local"
                  value={datetimeLocalValue}
                  onChange={handleDateTimeInput}
                  className="appearance-none bg-transparent outline-none text-sm px-2 w-full sm:w-auto"
                />
              </div>

              {/* Coordinates: country radio (embedded) or manual lat/long (non-embedded) */}
              {embedded ? (
                <fieldset className="w-full sm:w-auto">
                  <legend className="text-xs text-neutral-500 mb-1">
                    Country
                  </legend>
                  <div className="flex flex-col gap-2 w-full sm:w-[320px]">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="country"
                        value="IN"
                        checked={country === "IN"}
                        onChange={() => setCountry("IN")}
                        className="peer sr-only"
                      />
                      <div className="rounded-xl bg-base-100 border border-base-300 hover:border-blue-400 hover:bg-base-100/80 transition shadow-sm peer-checked:ring-2 peer-checked:ring-blue-500 peer-checked:border-blue-500 px-3 py-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-grid place-items-center w-4 h-4 rounded-full border border-neutral-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-transparent peer-checked:bg-blue-500"></span>
                          </span>
                          <span className="text-sm font-medium">India</span>
                        </div>
                        <div
                          className="w-16 h-10 rounded-md bg-gradient-to-r from-indigo-400 to-blue-500 shadow-inner"
                          aria-hidden="true"
                        />
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="country"
                        value="NP"
                        checked={country === "NP"}
                        onChange={() => setCountry("NP")}
                        className="peer sr-only"
                      />
                      <div className="rounded-xl bg-base-100 border border-base-300 hover:border-blue-400 hover:bg-base-100/80 transition shadow-sm peer-checked:ring-2 peer-checked:ring-blue-500 peer-checked:border-blue-500 px-3 py-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-grid place-items-center w-4 h-4 rounded-full border border-neutral-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-transparent peer-checked:bg-blue-500"></span>
                          </span>
                          <span className="text-sm font-medium">Nepal</span>
                        </div>
                        <div
                          className="w-16 h-10 rounded-md bg-gradient-to-r from-pink-400 to-rose-500 shadow-inner"
                          aria-hidden="true"
                        />
                      </div>
                    </label>
                  </div>
                </fieldset>
              ) : (
                <div className="flex items-center gap-2 bg-base-100 rounded-full px-2 sm:px-3 py-1 shadow-sm border border-base-300 w-full sm:w-auto">
                  <label className="sr-only" htmlFor="lat">
                    Lat
                  </label>
                  <input
                    id="lat"
                    type="number"
                    step="0.000001"
                    value={latitude}
                    onChange={handleLatChange}
                    className="w-full sm:w-[110px] bg-transparent outline-none text-sm px-2"
                  />
                  <span className="text-xs text-neutral-400">|</span>
                  <label className="sr-only" htmlFor="long">
                    Lng
                  </label>
                  <input
                    id="long"
                    type="number"
                    step="0.000001"
                    value={longitude}
                    onChange={handleLongChange}
                    className="w-full sm:w-[110px] bg-transparent outline-none text-sm px-2"
                  />
                </div>
              )}

              {/* Name input */}
              <div className="flex items-center gap-2 bg-base-100 rounded-full px-2 sm:px-3 py-1 shadow-sm border border-base-300 w-full sm:w-auto">
                <label className="sr-only" htmlFor="uname">
                  Name
                </label>
                <input
                  id="uname"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={t ? t("Name") : "Name"}
                  className="w-full sm:w-[160px] bg-transparent outline-none text-sm px-2"
                />
              </div>

              {/* Actions (get/download/share) */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setPendingScroll(true);
                    handleGetKundali();
                  }}
                  disabled={isProcessing}
                  className="flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-full shadow-sm w-full sm:w-auto"
                >
                  <ShareNetwork size={18} weight="bold" />
                  <span className="text-sm font-medium">
                    {t ? t("Get Kundali") : "Get Kundali"}
                  </span>
                </button>

                <button
                  onClick={downloadKundali}
                  disabled={isProcessing || !planets}
                  className="flex items-center justify-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border w-full sm:w-auto"
                >
                  <FileArrowDown size={18} className="text-red-600" />
                  <span className="text-sm font-medium text-neutral-800">
                    {t ? t("Download Kundali") : "Download"}
                  </span>
                </button>

                <button
                  onClick={handleShare}
                  disabled={isProcessing || !planets}
                  className="flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-full shadow-sm w-full sm:w-auto"
                >
                  <ShareNetwork size={18} weight="bold" />
                  <span className="text-sm font-medium">
                    {t ? t("Share Report") : "Share"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Capture area */}
          <div
            ref={kundaliRef}
            className="p-3 sm:p-4 rounded-xl bg-base-100 shadow-inner border border-base-300"
          >
            {!planets && (
              <div className="mb-3 p-3 rounded-lg bg-base-100 border border-base-300 text-sm text-base-600">
                {t
                  ? t("kundali.instruction")
                  : "Set your date, time and location, then click Get Kundali to generate your chart."}
              </div>
            )}
            <div className="breadcrumbs mb-3 text-xs sm:text-sm text-neutral-500 break-words">
              <ul>
                <li>
                  {t ? t("Generated by SriPatro") : "Generated by SriPatro"}
                </li>
              </ul>
            </div>

            {/* charts */}
            <div className="flex flex-wrap gap-6 justify-center items-start">
              <div className="relative w-full max-w-[350px] aspect-square flex-none bg-transparent">
                <svg
                  viewBox="0 0 350 350"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-full block"
                >
                  <rect
                    x="10"
                    y="10"
                    width="280"
                    height="280"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                  <line
                    x1="150"
                    y1="10"
                    x2="290"
                    y2="150"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                  <line
                    x1="290"
                    y1="150"
                    x2="150"
                    y2="290"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                  <line
                    x1="150"
                    y1="290"
                    x2="10"
                    y2="150"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                  <line
                    x1="10"
                    y1="150"
                    x2="150"
                    y2="10"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                  <line
                    x1="10"
                    y1="10"
                    x2="290"
                    y2="290"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                  <line
                    x1="290"
                    y1="10"
                    x2="10"
                    y2="290"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />

                  {Object.keys(houses).map((houseNumber) => {
                    const planetsInHouse = houses[houseNumber];
                    const coords = houseCoordinates[houseNumber];
                    return (
                      <g key={`d1-${houseNumber}`}>
                        <text
                          x={coords.x}
                          y={coords.y}
                          textAnchor="middle"
                          fill="currentColor"
                          fontSize="15"
                        >
                          {getSignNumberForHouse(parseInt(houseNumber))}
                        </text>
                        {planetsInHouse.map((planet, idx) => (
                          <text
                            key={`${planet.name}-${idx}`}
                            x={coords.x}
                            y={coords.y + 18 + idx * 14}
                            textAnchor="middle"
                            fill="currentColor"
                            fontSize="18"
                            fontWeight="700"
                          >
                            {t
                              ? t(`planets.${planet.name.slice(0, 2)}`)
                              : planet.name.slice(0, 2)}
                          </text>
                        ))}
                      </g>
                    );
                  })}
                </svg>

                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30"
                  dangerouslySetInnerHTML={{ __html: inlineWatermarkSVG }}
                />
              </div>

              <div className="relative w-full max-w-[350px] aspect-square flex-none bg-transparent">
                <svg
                  viewBox="0 0 350 350"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-full block"
                >
                  <rect
                    x="10"
                    y="10"
                    width="280"
                    height="280"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                  <line
                    x1="150"
                    y1="10"
                    x2="290"
                    y2="150"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                  <line
                    x1="290"
                    y1="150"
                    x2="150"
                    y2="290"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                  <line
                    x1="150"
                    y1="290"
                    x2="10"
                    y2="150"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                  <line
                    x1="10"
                    y1="150"
                    x2="150"
                    y2="10"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                  <line
                    x1="10"
                    y1="10"
                    x2="290"
                    y2="290"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                  <line
                    x1="290"
                    y1="10"
                    x2="10"
                    y2="290"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />

                  {moonChartHouses &&
                    Object.keys(moonChartHouses).map((houseNumber) => {
                      const planetsInHouse = moonChartHouses[houseNumber];
                      const coords = houseCoordinates[houseNumber];
                      return (
                        <g key={`moon-${houseNumber}`}>
                          <text
                            x={coords.x}
                            y={coords.y}
                            textAnchor="middle"
                            fill="currentColor"
                            fontSize="15"
                          >
                            {getMoonChartSignNumberForHouse(
                              parseInt(houseNumber)
                            )}
                          </text>
                          {planetsInHouse.map((planet, idx) => (
                            <text
                              key={`${planet.name}-${idx}`}
                              x={coords.x}
                              y={coords.y + 18 + idx * 14}
                              textAnchor="middle"
                              fill="currentColor"
                              fontSize="18"
                              fontWeight="700"
                            >
                              {t
                                ? t(`planets.${planet.name.slice(0, 2)}`)
                                : planet.name.slice(0, 2)}
                            </text>
                          ))}
                        </g>
                      );
                    })}
                </svg>

                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30"
                  dangerouslySetInnerHTML={{ __html: inlineWatermarkSVG }}
                />
              </div>
            </div>

            <div className="h-px bg-gray-100 my-4" />

            {/* table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs sm:text-sm">
                <thead>
                  <tr className="bg-red-600 text-white">
                    <th className="p-2 text-left text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                      {t ? t("Planet Name (Retro)") : "Planet"}
                    </th>
                    <th className="p-2 text-left text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                      {t ? t("Full Degree") : "Full Degree"}
                    </th>
                    <th className="p-2 text-left text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                      {t ? t("Norm Degree") : "Norm"}
                    </th>
                    <th className="p-2 text-left text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                      {t ? t("Sign") : "Sign"}
                    </th>
                    <th className="p-2 text-left text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                      {t ? t("Nakshatra (Pada)") : "Nakshatra"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {planetData.map((planet) => (
                    <tr key={planet.name} className="border-b">
                      <td className="p-2 align-top">
                        <div className="flex items-center gap-2">
                          <span className="text-base sm:text-lg">
                            {planetEmojis[planet.name] || ""}
                          </span>
                          <div>
                            <div className="font-medium text-xs sm:text-sm">
                              {t ? t(`planetFull.${planet.name}`) : planet.name}
                            </div>
                            {planet.isRetro === "true" && (
                              <div className="text-[10px] sm:text-xs text-red-600 flex items-center gap-1">
                                <ArrowCounterClockwise size={14} />
                                <span>{t ? t("Retrograde") : "Retro"}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-xs sm:text-sm whitespace-nowrap">
                        {planet.fullDegree.toFixed(2)}°
                      </td>
                      <td className="p-2 text-xs sm:text-sm whitespace-nowrap">
                        {planet.normDegree.toFixed(2)}°
                      </td>
                      <td className="p-2 text-xs sm:text-sm whitespace-nowrap">
                        {t ? t(`rasi.${planet.sign}`) : planet.sign}
                      </td>
                      <td className="p-2 text-xs sm:text-sm">
                        {t
                          ? t(`nakshatra.${planet.nakshatraName}`)
                          : planet.nakshatraName}{" "}
                        ({planet.nakshatraPada})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* bottom action */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="text-sm text-neutral-500">
              {t ? t("Date/Time") : "Date/Time"}:{" "}
              {dateTime
                ? `${dateTime.year}-${pad(dateTime.month)}-${pad(dateTime.date)} ${pad(dateTime.hours)}:${pad(dateTime.minutes)}`
                : t
                  ? t("kundali.pleaseSelectDateTimeFirst")
                  : "Please select date and time first."}
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

          {/* Saved Kundalis (history) */}
          {!embedded && (
            <div className="mt-6 rounded-xl p-4 bg-base-100 border border-base-300">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-base-800">
                  {t ? t("Saved Kundalis") : "Saved Kundalis"}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-xs gap-1"
                    onClick={handleShare}
                    disabled={!planets || isProcessing}
                    title={
                      t
                        ? t("Share current report as image")
                        : "Share current report as image"
                    }
                  >
                    <ShareNetwork size={14} />
                    <span className="hidden sm:inline sm:ml-1">
                      {t ? t("Share PNG") : "Share PNG"}
                    </span>
                  </button>
                  {history.length > 0 && (
                    <button
                      className="btn btn-xs gap-1"
                      onClick={clearHistory}
                      title={t ? t("Clear all") : "Clear all"}
                    >
                      <Trash size={14} />
                      <span className="hidden sm:inline sm:ml-1">
                        {t ? t("Clear All") : "Clear All"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
              {history.length === 0 ? (
                <div className="text-xs text-base-500">
                  {t
                    ? t("kundali.noSavedReportsTip")
                    : "No saved reports yet. Generate and save one."}
                </div>
              ) : (
                <ul className="space-y-2 max-h-72 overflow-auto pr-1">
                  {history.map((h) => {
                    const created = new Date(h.generatedAt);
                    const when = created.toLocaleString();
                    const label = h.name || "Unnamed";
                    const av = avatarForName(label);
                    const sub = `${h.englishDateTime || ""} · ${h.input?.latitude?.toFixed?.(2) ?? h.input?.latitude}, ${h.input?.longitude?.toFixed?.(2) ?? h.input?.longitude}`;
                    return (
                      <li
                        key={h.id}
                        className="border border-base-300 rounded-lg p-2 flex items-center justify-between cursor-pointer hover:bg-base-100/60"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.currentTarget.click();
                          }
                        }}
                        onClick={() => {
                          try {
                            if (h.input?.dateTime) {
                              const d = new Date(h.input.dateTime);
                              if (!isNaN(d.getTime()))
                                setDateTime({
                                  year: d.getFullYear(),
                                  month: d.getMonth() + 1,
                                  date: d.getDate(),
                                  hours: d.getHours(),
                                  minutes: d.getMinutes(),
                                  seconds: d.getSeconds(),
                                });
                            }
                            if (embedded) {
                              if (
                                typeof h.input?.latitude === "number" &&
                                typeof h.input?.longitude === "number"
                              ) {
                                if (
                                  Math.abs(h.input.latitude - 27.7172) < 0.1 &&
                                  Math.abs(h.input.longitude - 85.324) < 0.1
                                ) {
                                  setCountry("NP");
                                } else if (
                                  Math.abs(h.input.latitude - 28.6139) < 0.1 &&
                                  Math.abs(h.input.longitude - 77.209) < 0.1
                                ) {
                                  setCountry("IN");
                                }
                              }
                            } else {
                              if (typeof h.input?.latitude === "number")
                                setLatitude(h.input.latitude);
                              if (typeof h.input?.longitude === "number")
                                setLongitude(h.input.longitude);
                            }
                            setUserName(h.name || "");
                            setPendingScroll(true);
                          } catch (_) {}
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: av.color }}
                            title={label}
                            aria-hidden="true"
                          >
                            {av.initials}
                          </div>
                          <div className="text-xs">
                            <div className="font-semibold text-base-700">
                              {label}
                            </div>
                            <div className="text-base-600">{sub}</div>
                            <div className="text-base-400">
                              {t ? t("Saved") : "Saved"}: {when}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteHistoryEntry(h.id);
                            }}
                          >
                            <Trash size={14} />
                            <span className="hidden sm:inline sm:ml-1">
                              {t ? t("Delete") : "Delete"}
                            </span>
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* FAQ */}
          {!embedded && (
            <div className="mt-6 rounded-xl p-4 bg-base-100">
              {/* <h3 className="text-sm font-bold text-base-800 mb-2">
                {t ? t("Kundali FAQs") : "Kundali FAQs"}
              </h3> */}
              <div className="join join-vertical w-full">
                <div className="collapse collapse-arrow join-item border border-base-300">
                  <input type="checkbox" />
                  <div className="collapse-title text-sm font-medium">
                    {t ? t("kundali.faq.whatIsQuestion") : "What is a Kundali?"}
                  </div>
                  <div className="collapse-content text-xs text-base-600">
                    {t
                      ? t("kundali.faq.whatIsAnswer")
                      : "A Kundali (birth chart) is a celestial map calculated for your birth date, time and place. It shows planetary positions used in Vedic astrology."}
                  </div>
                </div>
                <div className="collapse collapse-arrow join-item border border-t-0 border-base-300">
                  <input type="checkbox" />
                  <div className="collapse-title text-sm font-medium">
                    {t
                      ? t("kundali.faq.accuracyQuestion")
                      : "How accurate is this?"}
                  </div>
                  <div className="collapse-content text-xs text-base-600">
                    {t
                      ? t("kundali.faq.accuracyAnswer")
                      : "Accuracy depends on correct date, time and coordinates. We use topocentric Lahiri ayanamsha."}
                  </div>
                </div>
                <div className="collapse collapse-arrow join-item border border-t-0 border-base-300">
                  <input type="checkbox" />
                  <div className="collapse-title text-sm font-medium">
                    {t
                      ? t("kundali.faq.shareQuestion")
                      : "Can I share or download?"}
                  </div>
                  <div className="collapse-content text-xs text-base-600">
                    {t
                      ? t("kundali.faq.shareAnswer")
                      : "Yes, use Share or Download above. You can also save reports which appear below for quick access."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comments */}
          {!embedded && (
            <div className="mt-6">
              <Comments />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Kundali;
