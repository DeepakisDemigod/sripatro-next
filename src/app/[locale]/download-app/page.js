"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useParams } from "next/navigation";
import InstallAppCard from "@/components/InstallAppCard";
import InstallPromptButton from "@/components/InstallPromptButton";
import Comments from "@/components/Comments/Comments";

const BASE_URL = "https://sripatro.com";

const installSteps = [
  {
    platform: "Android & Desktop (Chrome, Edge)",
    steps: [
      "Open SriPatro in your browser.",
      "Tap the install banner or the ⋮ menu > Install app.",
      "Confirm to add SriPatro to your home screen or launcher.",
    ],
  },
  {
    platform: "iOS & iPadOS (Safari)",
    steps: [
      "Tap the share icon in Safari.",
      'Scroll and choose "Add to Home Screen".',
      "Confirm the name and tap Add — the app appears like any native app.",
    ],
  },
];

export default function DownloadAppPage() {
  const params = useParams();
  const locale = params?.locale ?? "en";
  const canonicalUrl = `${BASE_URL}/${locale}/download-app`;
  const metaTitle =
    "Download SriPatro App | Nepali Panchang & Festival Calendar";
  const seoDescription =
    "SriPatro is the trusted Nepali Panchang and Patro app delivering Bikram Sambat dates, festival timings, horoscope tools, and auspicious saita to Nepalis worldwide.";
  const metaKeywords = [
    "SriPatro app download",
    "Nepali calendar app",
    "Nepali Patro",
    "Bikram Sambat calendar",
    "Nepali Panchang mobile app",
    "festival reminders Nepal",
    "tithi calendar Nepal",
    "Panchang app for Nepali diaspora",
  ].join(", ");
  const ogImage = `${BASE_URL}/logo-with-name.png`;

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SriPatro",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Android, iOS, Web",
    description: seoDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "25000",
    },
    downloadUrl: "https://play.google.com/store/apps/details?id=com.sripatro",
    url: canonicalUrl,
    author: {
      "@type": "Organization",
      name: "SriPatro",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "SriPatro",
      url: BASE_URL,
    },
    sameAs: [
      "https://www.facebook.com/sripatro",
      "https://twitter.com/deepakisdemigod",
      "https://www.youtube.com/@SriPatro",
    ],
  };

  const structuredData = JSON.stringify(softwareSchema);

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={metaKeywords} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="SriPatro" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:creator" content="@deepakisdemigod" />
        <meta name="twitter:image" content={ogImage} />
        <meta name="robots" content="index, follow" />
      </Head>
      <main className="space-y-12 pb-24">
        <Script
          id="download-app-structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {structuredData}
        </Script>
        <InstallAppCard />

        <section className="relative overflow-hidden rounded-3xl border border-base-300 bg-gradient-to-br from-primary/10 via-base-100 to-base-100 shadow-lg">
          <div className="absolute -top-20 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

          <div className="relative z-10 grid gap-10 px-6 py-10 lg:grid-cols-[1.1fr,0.9fr] lg:px-12 lg:py-14">
            <div className="space-y-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                SriPatro App
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-base-content sm:text-4xl">
                Download the Nepali Patro app trusted for Panchang, tithi, and
                festival alerts worldwide.
              </h1>
              <p className="text-base text-base-content/70 sm:text-lg">
                Install SriPatro today to access the most loved Nepali calendar
                wherever you are. Get real-time Bikram Sambat dates, auspicious
                saita, and community rituals in an offline-friendly experience
                built for Nepalis at home and abroad.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <InstallPromptButton
                  fallback={
                    <Link
                      href="https://play.google.com/store/apps/details?id=com.sripatro"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
                    >
                      <span aria-hidden>📱</span>
                      <span>Get the Android app</span>
                    </Link>
                  }
                />

                <span className="text-xs text-base-content/60">
                  iOS users: Add to Home Screen via the share menu.
                </span>
              </div>
            </div>
            <div className="relative hidden items-center justify-center lg:flex">
              <div className="relative max-w-md">
                <Image
                  src="/shubh-saita.png.webp"
                  alt="SriPatro Nepali calendar mobile app screenshot with saita, Panchang, and festivals"
                  width={640}
                  height={960}
                  className="mx-auto rounded-3xl border border-base-300 bg-base-100 shadow-xl"
                  priority
                />
                <div className="absolute -bottom-6 left-1/2 w-4/5 -translate-x-1/2 rounded-3xl bg-base-100/90 p-4 text-center text-xs text-base-content/70 shadow-lg">
                  Optimised for Android, iOS (PWA), tablets, and desktop
                  browsers.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm sm:grid-cols-2 sm:p-10">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-base-content">
              Install SriPatro in three simple steps
            </h2>
            <p className="text-sm text-base-content/70">
              SriPatro works brilliantly as a Progressive Web App (PWA). Install
              it to enjoy full-screen navigation, offline access, and
              lightning-fast launches.
            </p>
          </div>
          <div className="space-y-6">
            {installSteps.map((group) => (
              <div
                key={group.platform}
                className="rounded-2xl border border-base-200 bg-base-50/60 p-5"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/60">
                  {group.platform}
                </h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-base-content/70">
                  {group.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-base-content">
                Reviews & community feedback
              </h2>
              <p className="text-sm text-base-content/70">
                Already using SriPatro? Share your experience to help Nepalis
                everywhere find their daily rhythm.
              </p>
            </div>
            <Link
              href="https://www.producthunt.com/products/sri-patro"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-base-200 px-4 py-2 text-xs font-semibold text-base-content transition hover:border-primary/40 hover:text-primary"
            >
              Leave a review on Product Hunt ↗
            </Link>
          </div>
          <Comments currentUserId="1" />
        </section>
      </main>
    </>
  );
}
