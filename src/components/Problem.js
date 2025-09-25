"use client";
import React from "react";
import Image from "next/image";
import { ArrowRight, GlobeHemisphereEast, CalendarCheck } from "phosphor-react";

/**
 * Problem Component
 * Visual section highlighting mismatch between existing (mostly Indian) astrology tooling
 * and the needs of Nepali users (BS calendar, Panchang context, localized data).
 */
export default function Problem() {
  return (
    <section className="w-full bg-base-100 text-base-content py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            80% of astrology tools are built for the Indian system — not Nepali
            users
          </h2>
          <p className="mt-4 text-base sm:text-lg text-base-content/70">
            Nepali users juggle Bikram Sambat dates, Panchang details, festivals
            & regional nuances while most platforms default to Indian AD
            workflows and assumptions. The result? Manual conversions, data
            inconsistency, and missed cultural context.
          </p>
        </div>

        {/* Flow Row */}
        <div className="hidden md:flex items-center justify-center gap-6 text-base-content/80 mb-16">
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl mb-2">🧮</span>
            <p className="font-semibold">Manual BS ⇄ AD conversions</p>
            <p className="text-xs text-base-content/50">
              Slows daily astrology work
            </p>
          </div>
          <ArrowRight size={32} className="opacity-40" />
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl mb-2">😓</span>
            <p className="font-semibold">Fragmented Panchang data</p>
            <p className="text-xs text-base-content/50">
              Cross-checking multiple sources
            </p>
          </div>
          <ArrowRight size={32} className="opacity-40" />
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl mb-2">⏱️</span>
            <p className="font-semibold">Time drains & errors</p>
            <p className="text-xs text-base-content/50">
              Reduced confidence & adoption
            </p>
          </div>
          <ArrowRight size={32} className="opacity-40" />
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl mb-2">🚫</span>
            <p className="font-semibold">Missed opportunities</p>
            <p className="text-xs text-base-content/50">Users abandon tools</p>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-14">
          {/* Nepali Needs */}
          <div className="relative rounded-2xl border border-base-300/60 bg-gradient-to-br from-emerald-600/10 via-emerald-500/5 to-emerald-700/10 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="https://purecatamphetamine.github.io/country-flag-icons/3x2/NP.svg"
                alt="Nepal flag"
                width={40}
                height={28}
                className="rounded-sm ring-1 ring-base-300"
              />
              <h3 className="text-xl font-bold">Nepali Context (BS)</h3>
            </div>
            <ul className="space-y-2 text-sm leading-relaxed">
              <li>
                <span className="font-semibold">Bikram Sambat first:</span>{" "}
                Native BS calendar orientation.
              </li>
              <li>
                <span className="font-semibold">Localized Panchang:</span>{" "}
                Tithi, Nakshatra, Yoga, Karna, festivals.
              </li>
              <li>
                <span className="font-semibold">Hybrid date display:</span> BS +
                AD for clarity.
              </li>
              <li>
                <span className="font-semibold">Regional festivals:</span>{" "}
                Accurate Nepali event layering.
              </li>
              <li>
                <span className="font-semibold">Offline & PWA ready:</span>{" "}
                Works in low-connectivity zones.
              </li>
            </ul>
            <div className="mt-5 inline-flex items-center gap-2 text-emerald-600 font-medium text-sm bg-emerald-600/10 px-3 py-1 rounded-full">
              <CalendarCheck size={18} /> Built for Nepal
            </div>
          </div>

          {/* Typical Indian-Focused Tools */}
          <div className="relative rounded-2xl border border-base-300/60 bg-gradient-to-br from-red-600/10 via-rose-500/5 to-orange-700/10 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="https://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg"
                alt="India flag"
                width={40}
                height={28}
                className="rounded-sm ring-1 ring-base-300"
              />
              <h3 className="text-xl font-bold">Indian-Centric Defaults</h3>
            </div>
            <ul className="space-y-2 text-sm leading-relaxed">
              <li>
                <span className="font-semibold">AD-only workflows:</span> Manual
                BS conversion needed.
              </li>
              <li>
                <span className="font-semibold">Generic Panchang:</span> Lacks
                Nepali regional specificity.
              </li>
              <li>
                <span className="font-semibold">Festival mismatch:</span> Events
                misaligned or missing.
              </li>
              <li>
                <span className="font-semibold">No local settings:</span>{" "}
                Holiday / tithi variations ignored.
              </li>
              <li>
                <span className="font-semibold">Lower adoption:</span> Users
                drop off after friction.
              </li>
            </ul>
            <div className="mt-5 inline-flex items-center gap-2 text-rose-600 font-medium text-sm bg-rose-600/10 px-3 py-1 rounded-full">
              <GlobeHemisphereEast size={18} /> One-size-fits-all
            </div>
          </div>
        </div>

        {/* CTA / Transition */}
        <div className="text-center">
          <p className="text-base-content/60 text-sm mb-4">
            SriPatro bridges this gap with a Nepali-first astrological
            experience.
          </p>
          <a
            href="/home"
            className="btn btn-primary rounded-full font-semibold px-8"
          >
            Explore SriPatro
          </a>
        </div>
      </div>
    </section>
  );
}
