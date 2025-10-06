import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Contact SriPatro",
  description:
    "Reach the SriPatro team for product support, partnerships, media, or general questions.",
};

const contactCards = [
  {
    title: "Product support",
    description:
      "Need help with your account, Panchang data, or app behaviour? Send us the details and we will follow up within 24 hours.",
    email: "support@sripatro.com",
    cta: "support@sripatro.com",
  },
  {
    title: "Partnerships",
    description:
      "We collaborate with astrologers, community groups, and Nepali organisations to bring verified guidance to the diaspora.",
    email: "partners@sripatro.com",
    cta: "partners@sripatro.com",
  },
  {
    title: "Media & press",
    description:
      "Looking to feature SriPatro or request product assets? We are happy to share interviews, screenshots, and brand guidelines.",
    email: "press@sripatro.com",
    cta: "press@sripatro.com",
  },
];

const responseHighlights = [
  "Average response time under 24 hours on business days.",
  "Engineering and astrology experts review every technical or ritual query.",
  "No auto-replies — every message is read by the core team.",
];

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="bg-base-100 text-base-content">
        <section className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              Contact SriPatro
            </span>
            <h1 className="text-4xl font-black sm:text-5xl">
              We are here to help — day or night.
            </h1>
            <p className="max-w-3xl text-lg text-base-700 sm:text-xl">
              Whether you are reporting an issue, requesting a new feature, or
              planning a collaboration, the quickest way to reach us is through
              email. Tell us how we can support you and we will respond with a
              personalised plan.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {contactCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-base-200 bg-base-50 p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-base-900">
                  {card.title}
                </h2>
                <p className="mt-3 text-sm text-base-600">{card.description}</p>
                <a
                  href={`mailto:${card.email}`}
                  className="btn btn-primary btn-sm mt-4 w-full"
                >
                  {card.cta}
                </a>
              </div>
            ))}
          </div>

          <section className="rounded-3xl border border-base-200 bg-base-50 p-8 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-base-900">
                  Prefer to fill out a quick form?
                </h2>
                <p className="max-w-xl text-base text-base-600">
                  Complete the fields below and we will route your message to
                  the right teammate instantly. You will also receive a copy of
                  your submission for records.
                </p>
                <ul className="space-y-2 text-sm text-base-600">
                  {responseHighlights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="min-w-[260px] rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm">
                <form
                  method="POST"
                  action="https://formspree.io/f/xgegeqgk"
                  className="space-y-4"
                >
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-base-700">
                      Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="input input-bordered input-sm w-full"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-base-700">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="input input-bordered input-sm w-full"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-base-700">
                      Topic
                    </label>
                    <select
                      name="topic"
                      className="select select-bordered select-sm w-full"
                      defaultValue="Support"
                    >
                      <option value="Support">Product support</option>
                      <option value="Partnership">Partnership inquiry</option>
                      <option value="Media">Media / press</option>
                      <option value="Other">Something else</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-base-700">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      className="textarea textarea-bordered textarea-sm w-full"
                      placeholder="Share as much context as you can"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm w-full"
                  >
                    Send message
                  </button>
                  <p className="text-xs text-base-500">
                    Submitting this form sends a secure message to the SriPatro
                    inbox. We will never share your details without permission.
                  </p>
                </form>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-base-200 bg-primary/5 p-8">
            <h2 className="text-2xl font-bold text-primary sm:text-3xl">
              Join our community
            </h2>
            <p className="mt-2 max-w-3xl text-base text-base-700">
              For faster updates and behind-the-scenes progress, follow along on
              Twitter or join the public roadmap. We announce new rituals,
              features, and beta opportunities there first.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="https://twitter.com/sripatro" className="btn btn-sm">
                Follow on Twitter
              </Link>
              <Link
                href="https://sripatro.canny.io/feature-requests"
                className="btn btn-sm btn-outline"
              >
                View roadmap
              </Link>
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
