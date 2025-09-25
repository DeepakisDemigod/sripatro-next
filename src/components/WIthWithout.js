"use client";
import React from "react";
import { CheckCircle, XCircle } from "phosphor-react";

/**
 * WithWithout Component
 * Side-by-side comparison showing workflow without SriPatro vs with SriPatro.
 */
export default function WithWithout({
  heading = "Tired of juggling astrology tools?",
  withoutTitle = "Workflow without SriPatro",
  withTitle = "Workflow with SriPatro",
  withoutPoints = [
    "Switch between multiple Panchang & calendar sites",
    "Manually convert BS ⇄ AD dates",
    "Re-enter birth data in different tools",
    "Missing localized festivals / tithis",
    "No unified profile or saved preferences",
    "Time lost verifying inconsistent data",
  ],
  withPoints = [
    "Unified Panchang + calendar (BS & AD together)",
    "Auto BS ⇄ AD conversion everywhere",
    "Single profile powering Kundali & predictions",
    "Accurate Nepali festivals & regional layers",
    "Offline-ready PWA for low connectivity",
    "Reliable, consistent astrological data",
  ],
}) {
  return (
    <section className="w-full py-14 sm:py-20 bg-base-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl mb-12">
          {heading}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Without Card */}
          <div className="rounded-2xl bg-rose-100/70 dark:bg-rose-100/10 border border-rose-200/70 dark:border-rose-500/30 p-8 shadow-sm">
            <h3 className="text-center text-rose-700 dark:text-rose-300 font-semibold mb-5 text-lg">
              {withoutTitle}
            </h3>
            <ul className="space-y-3 text-sm sm:text-base">
              {withoutPoints.map((pt, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-rose-800 dark:text-rose-200"
                >
                  <XCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-rose-500"
                  />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* With Card */}
          <div className="rounded-2xl bg-emerald-100/70 dark:bg-emerald-100/10 border border-emerald-200/70 dark:border-emerald-500/30 p-8 shadow-sm">
            <h3 className=" text-center text-emerald-700 dark:text-emerald-300 font-semibold mb-5 text-lg">
              {withTitle}
            </h3>
            <ul className="space-y-3 text-sm sm:text-base">
              {withPoints.map((pt, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-emerald-800 dark:text-emerald-200"
                >
                  <CheckCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
