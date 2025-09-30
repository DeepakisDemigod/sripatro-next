import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "About SriPatro",
  description:
    "Meet the maker of SriPatro and discover the vision behind the Nepali-first calendar and astrology companion.",
};

const highlights = [
  {
    title: "Community-first design",
    description:
      "SriPatro was born to serve Nepali communities across the globe with tools that feel familiar, fast, and trustworthy.",
  },
  {
    title: "Rooted in tradition",
    description:
      "Every feature is crafted with respect for Vedic timekeeping, Panchang accuracy, and rituals that anchor our culture.",
  },
  {
    title: "Modern craftsmanship",
    description:
      "Built with accessible design, progressive web app foundations, and privacy-aware engineering from day one.",
  },
];

const milestones = [
  {
    year: "2020",
    headline: "Dreamt of a better Panchang",
    copy: "Frustrated by clunky Panchang apps, I started sketching a lightweight experience that blended tradition with modern UX.",
  },
  {
    year: "2022",
    headline: "Prototype to community beta",
    copy: "Released an early build to friends and family, iterating rapidly on translations, rituals, and diaspora-friendly utilities.",
  },
  {
    year: "2024",
    headline: "SriPatro goes public",
    copy: "Launched SriPatro with daily Panchang, Shradh tithi lookup, and horoscope dashboards tailored for mobile-first usage.",
  },
  {
    year: "Today",
    headline: "Scaling with purpose",
    copy: "Focused on double opt-in newsletters, reliable notifications, and collaborating with astrologers to serve the wider Nepali world.",
  },
];

const values = [
  {
    label: "Clarity over complexity",
    detail:
      "Each interaction is designed to explain sacred concepts in language anyone can understand without diluting meaning.",
  },
  {
    label: "Respecting rituals",
    detail:
      "We prioritize accuracy and authenticity, verifying data with pandits and community elders before shipping new features.",
  },
  {
    label: "Listening loops",
    detail:
      "Feature requests, bug reports, and field feedback shape the roadmap more than trend-chasing or vanity metrics.",
  },
];

const currentFocus = [
  "Expanding Nepali-first localization so every festival feels personal on any device.",
  "Partnering with astrologers to surface trusted guidance alongside the daily Panchang.",
  "Building community programs that spotlight Nepali makers keeping heritage alive.",
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="bg-base-100 text-base-content">
        <section className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              Meet the maker
            </span>
            <h1 className="text-4xl font-black sm:text-5xl">
              Hi, I&apos;m Deepak.
            </h1>
            <p className="max-w-3xl text-lg text-base-700 sm:text-xl">
              I build SriPatro to make Vedic timekeeping and astrology
              approachable for Nepalis everywhere. From authentic Panchang data
              to daily rituals, my goal is to translate cultural wisdom into a
              modern, reliable companion.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="mailto:hello@sripatro.com"
                className="btn btn-primary"
              >
                Say hello
              </Link>
              <Link
                href="https://sripatro.canny.io/feature-requests"
                className="btn btn-outline"
              >
                Share feedback
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((highlight) => (
              <div
                key={highlight.title}
                className="rounded-2xl border border-base-200 bg-base-50 p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-base-900">
                  {highlight.title}
                </h2>
                <p className="mt-3 text-base text-base-600">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-base-900 sm:text-3xl">
                From a personal itch to a public roadmap
              </h2>
              <p className="text-base text-base-600">
                SriPatro has always been about bridging the distance between
                home and the diaspora. Here&apos;s how the journey has unfolded
                so far.
              </p>
              <div className="space-y-6">
                {milestones.map((milestone) => (
                  <article
                    key={milestone.year}
                    className="rounded-xl border border-base-200 bg-base-50 p-6"
                  >
                    <div className="text-sm font-semibold uppercase tracking-wide text-primary">
                      {milestone.year}
                    </div>
                    <h3 className="mt-2 text-xl font-semibold text-base-900">
                      {milestone.headline}
                    </h3>
                    <p className="mt-2 text-base text-base-600">
                      {milestone.copy}
                    </p>
                  </article>
                ))}
              </div>
            </div>
            <aside className="flex flex-col gap-6 rounded-2xl border border-base-200 bg-base-50 p-6">
              <div>
                <h2 className="text-2xl font-bold text-base-900">
                  What guides every release
                </h2>
                <p className="mt-2 text-base text-base-600">
                  I lean on a few core principles whenever new features ship or
                  feedback rolls in.
                </p>
              </div>
              <ul className="space-y-4">
                {values.map((value) => (
                  <li
                    key={value.label}
                    className="rounded-xl border border-base-200 bg-base-100 p-4"
                  >
                    <h3 className="text-lg font-semibold text-base-900">
                      {value.label}
                    </h3>
                    <p className="mt-1 text-sm text-base-600">{value.detail}</p>
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          <section className="rounded-3xl border border-dashed border-primary/50 bg-primary/5 p-8">
            <h2 className="text-2xl font-bold text-primary sm:text-3xl">
              What&apos;s happening now
            </h2>
            <p className="mt-2 max-w-3xl text-base text-base-700">
              The roadmap keeps evolving with the community. Here&apos;s what
              I&apos;m actively exploring this season:
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {currentFocus.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-base-100 p-4 shadow-sm"
                >
                  <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span className="text-base text-base-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col items-start gap-4 rounded-3xl border border-base-200 bg-base-50 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-base-900">
                Let&apos;s build the Nepali future together
              </h2>
              <p className="mt-2 max-w-xl text-base text-base-600">
                Whether you&apos;re an astrologer, developer, or culture
                champion, I&apos;d love to hear how SriPatro can support your
                ideas.
              </p>
            </div>
            <Link
              href="https://github.com/DeepakisDemigod"
              className="btn btn-primary"
            >
              Collaborate with me
            </Link>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
