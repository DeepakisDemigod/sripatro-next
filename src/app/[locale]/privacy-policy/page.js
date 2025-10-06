import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "SriPatro Privacy Policy",
  description:
    "Understand how SriPatro collects, uses, and protects your personal information across our calendar and astrology products.",
};

const sections = [
  {
    heading: "1. Who we are",
    body: `SriPatro is a Nepali-first Panchang, ritual, and astrology companion designed for the global Nepali diaspora. We operate from Kathmandu, Nepal, with contributors across India, the Middle East, Europe, and North America. When we say “we”, “us”, or “our”, we mean the SriPatro product team led by Deepak Shrestha.`,
  },
  {
    heading: "2. Information we collect",
    body: `We collect the minimum information required to deliver reliable Panchang data and personalised experiences. This includes:
• Account details: email address and preferred locale when you sign in using magic links.
• Usage signals: anonymised metrics about the screens you visit and features you tap, so we can prioritise improvements.
• Ritual preferences: optional data you add to personalise notifications, auspicious dates, or saved locations.

We do **not** store passwords, payment cards, or sensitive birth chart information unless you explicitly submit a Kundali request.`,
  },
  {
    heading: "3. How we use your data",
    body: `Your information is used solely to:
• Authenticate you securely via NextAuth magic links.
• Surface relevant Panchang, horoscope, and ritual reminders.
• Respond to support requests and keep you informed about product updates.
• Detect abuse, keep our services resilient, and satisfy legal obligations.

We will never sell your data or share it with advertisers.`,
  },
  {
    heading: "4. Data storage & retention",
    body: `SriPatro runs on encrypted cloud infrastructure hosted in Mumbai (India) and Frankfurt (Germany). Account records are retained while you actively use the service. If you remain inactive for 24 consecutive months, we will anonymise or delete your personal identifiers. You can request deletion at any time by emailing privacy@sripatro.com.`,
  },
  {
    heading: "5. Third-party services",
    body: `We rely on a handful of trusted processors to operate SriPatro:
• MongoDB Atlas for database storage (ISO/IEC 27001 certified).
• Resend for transactional email delivery.
• Vercel for application hosting and performance monitoring.

Each partner is vetted for compliance with GDPR and Nepali privacy regulations.`,
  },
  {
    heading: "6. Your rights",
    body: `Wherever you live, you can exercise these rights at no cost:
• Access: request a copy of the data we hold about you.
• Correct: update inaccurate or incomplete information.
• Delete: ask us to erase your account and associated data.
• Portability: obtain your data in a portable format.
• Objection: opt out of non-essential analytics or notifications.

Email us at privacy@sripatro.com to start any of these requests.`,
  },
  {
    heading: "7. Cookies & tracking",
    body: `SriPatro uses essential cookies to keep you signed in and remember your locale preferences. We optionally use privacy-friendly analytics (Plausible) to understand aggregate usage — no cross-site tracking, advertising cookies, or fingerprinting. You can disable analytics at any time in Settings.`,
  },
  {
    heading: "8. Updates to this policy",
    body: `We review the policy at least twice a year. If we make a material change, we will notify you via email and highlight the update inside the app. Continued use of SriPatro after the effective date means you agree to the revised policy.`,
  },
  {
    heading: "9. Contact",
    body: `Questions about privacy? Reach us at privacy@sripatro.com or write to:
SriPatro Privacy Team
PO Box 1021
Kathmandu 44600, Nepal`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="bg-base-100 text-base-content">
        <section className="mx-auto flex max-w-4xl flex-col gap-12 px-4 py-16 sm:px-6 lg:px-8">
          <header className="space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              Privacy policy
            </span>
            <h1 className="text-4xl font-black sm:text-5xl">
              Your rituals deserve private, respectful software.
            </h1>
            <p className="max-w-3xl text-lg text-base-700 sm:text-xl">
              This document explains what information we collect, how it is
              used, and the safeguards in place to honour your trust in
              SriPatro. We keep the legal language light so it is easy to
              understand.
            </p>
            <p className="text-sm text-base-500">
              Last updated on{" "}
              {new Date().toLocaleDateString("en-GB", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </header>

          <div className="space-y-8">
            {sections.map((section) => (
              <article
                key={section.heading}
                className="rounded-2xl border border-base-200 bg-base-50 p-6 shadow-sm"
              >
                <h2 className="text-2xl font-semibold text-base-900">
                  {section.heading}
                </h2>
                <p className="mt-3 whitespace-pre-line text-base text-base-600">
                  {section.body}
                </p>
              </article>
            ))}
          </div>

          <section className="rounded-3xl border border-primary/40 bg-primary/5 p-8">
            <h2 className="text-2xl font-bold text-primary">
              Need a data export or deletion?
            </h2>
            <p className="mt-2 max-w-2xl text-base text-base-700">
              Email privacy@sripatro.com with the subject "Data request" and we
              will acknowledge within 48 hours. For your safety we may ask for a
              verification code sent to your registered email before fulfilling
              the request.
            </p>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
