"use client";

import { useState, useEffect } from "react";
import { CaretRight } from "phosphor-react";
import Header from "@/components/Header";

const panchang = [
  { label: "Daily Panchang", icon: "🗓️", tag: "AD", href: "/daily-panchang" },
];

const jyotish = [
  {
    label: "Kundali",
    icon: "🪐",
    tag: "AD",
    href: "/kundali",
    desc: "Generate Kundali by birth details",
  },
  {
    label: "Cheena",
    icon: "🧧",
    tag: "AD",
    // href intentionally removed for now
    comingSoon: true,
    desc: "Nepali Cheena astrology chart",
  },
];

const daily = [
  {
    label: "Shubh Saita",
    icon: "🪔",
    tag: "AD",
    href: "/shubh-saita",
    desc: "Find auspicious timings for rituals",
  },
  {
    label: "Horoscope",
    icon: "🐏",
    tag: "AD",
    href: "/horoscope",
    desc: "Daily Horoscope for all zodiac signs",
  },
];

const utilities = [
  {
    label: "Date Converter",
    icon: "🗓",
    tag: "BS",
    href: "/nepali-date-converter",
    desc: "Convert between Nepali (BS) and English (AD) dates",
  },
  {
    label: "Shradh Tithi",
    icon: "🎋",
    tag: "AD",
    href: "/shradh-tithi",
    desc: "Shradh Tithi and Date for 2025",
  },

  {
    label: "Weather",
    icon: "🌪️",
    tag: "AD",
    href: "/weather",
    desc: "Check today’s local weather",
  },
];

const personalise = [
  {
    label: "Settings",
    icon: "⚙️",
    tag: "AD",
    href: "/settings",
    desc: "Personalize your preferences",
  },
];

const company = [
  {
    label: "About",
    icon: "🌿",
    tag: "",
    href: "/about",
    desc: "Meet the maker and the mission behind SriPatro",
  },
  {
    label: "Contact Us",
    icon: "✉️",
    tag: "",
    href: "/contact-us",
    desc: "Reach support, partnerships, or the press team",
  },
  {
    label: "Privacy Policy",
    icon: "🔒",
    tag: "",
    href: "/privacy-policy",
    desc: "Learn how we protect your data and rituals",
  },
];

const Section = ({ title, items }) => (
  <div className="mb-6">
    <h3 className="px-4 pb-2 text-xs font-semibold text-base-content/70 uppercase tracking-wide">
      {title}
    </h3>
    <div className="bg-base-100 rounded-2xl shadow-sm divide-y divide-base-200">
      {items.map(({ label, icon, href, desc, comingSoon }) => {
        const content = (
          <div className="flex items-center justify-between px-4 py-3 transition">
            <div className="flex items-center gap-4">
              <div className="text-2xl">{icon}</div>
              <div>
                <div className="text-sm font-medium text-base-content">
                  {label}
                </div>
                <div className="text-xs text-base-content/70">{desc}</div>
              </div>
            </div>
            {comingSoon ? (
              <span className="badge badge-outline text-xs">Coming Soon</span>
            ) : (
              <CaretRight className="text-base-content/60" />
            )}
          </div>
        );

        return href && !comingSoon ? (
          <a key={href} href={href} className="block hover:bg-base-200">
            {content}
          </a>
        ) : (
          <div
            key={label}
            className="block opacity-80 cursor-not-allowed"
            aria-disabled="true"
          >
            {content}
          </div>
        );
      })}
    </div>
  </div>
);

const Menu = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto my-4 p-4">
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-base-200 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-base-100/10 text-base-content max-w-3xl mx-auto my-4 px-2">
        <Section title="Panchang" items={panchang} />
        <Section title="Jyotish" items={jyotish} />
        <Section title="Daily" items={daily} />
        <Section title="Utilities" items={utilities} />
        <Section title="Personalise" items={personalise} />
        <Section title="Company" items={company} />
      </div>
    </>
  );
};

export default Menu;
