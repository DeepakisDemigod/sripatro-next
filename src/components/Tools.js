"use client";

import Link from "next/link";

const sections = [
  {
    title: "Jyotish",
    links: [
      { label: "Panchang Today (Live)", href: "/" },
      { label: "Date Converter", href: "/date-converter" },
      { label: "Birth Panchang (AD)", href: "/birthpanchang" },
      { label: "Bikram Sambat to Panchang (BS)", href: "/nepalitoenglish" },
      { label: "Birth Kundali (AD)", href: "/kundali" },
    ],
  },
  {
    title: "Horoscope",
    links: [
      { label: "Daily Horoscope", href: "/horoscope" },
      { label: "Weekly Horoscope", href: "/horoscope" },
      { label: "Monthly Horoscope", href: "/horoscope" },
    ],
  },
  {
    title: "Help & Support",
    links: [{ label: "Settings", href: "/settings" }],
  },
];

const Tools = ({ className = "" }) => {
  const gridClass = [
    "grid gap-8 sm:grid-cols-2 lg:grid-cols-3",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={gridClass} aria-label="Footer navigation">
      {sections.map((section) => (
        <div key={section.title} className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/70">
            {section.title}
          </h3>
          <ul className="space-y-2 text-sm">
            {section.links.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-base-content/80 transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="lg:col-span-3">
        <a
          href="https://www.producthunt.com/products/sri-patro/reviews?utm_source=badge-product_review&utm_medium=badge&utm_souce=badge-sri&#0045;patro"
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-3 rounded-2xl border border-base-300 bg-base-200/60 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=864650&theme=light"
            alt="Sri Patro reviews on Product Hunt"
            className="h-12 w-auto"
            loading="lazy"
          />
          <span className="text-sm text-base-content/70">
            Loved SriPatro? Share a review on Product Hunt.
          </span>
        </a>
      </div>
    </nav>
  );
};

export default Tools;
