"use client";

import Image from "next/image";
import Link from "next/link";
import {
  EnvelopeSimple,
  GithubLogo,
  LinkedinLogo,
  TwitterLogo,
} from "phosphor-react";
import Tools from "./Tools";

const socialLinks = [
  {
    label: "Follow on Twitter",
    href: "https://twitter.com/sripatro",
    icon: TwitterLogo,
  },
  {
    label: "Connect on LinkedIn",
    href: "https://www.linkedin.com/company/sripatro",
    icon: LinkedinLogo,
  },
  {
    label: "View on GitHub",
    href: "https://github.com/DeepakisDemigod/sripatro-next",
    icon: GithubLogo,
  },
  {
    label: "Email SriPatro",
    href: "mailto:hello@sripatro.com",
    icon: EnvelopeSimple,
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-base-300 bg-base-100 text-base-content">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md space-y-6">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-with-name.png"
                alt="SriPatro logo"
                width={180}
                height={48}
                className="h-12 w-auto rounded-xl bg-base-100"
              />
              <span className="text-xl font-semibold tracking-tight">
                SriPatro
              </span>
            </div>
            <p className="text-sm leading-relaxed text-base-content/70">
              SriPatro brings authentic Nepali Panchang, festival insights, and
              daily horoscope guidance to the diaspora. Accurate timings,
              beautifully designed for modern life.
            </p>
            <div className="space-y-2 text-sm text-base-content/70">
              <p className="font-semibold text-base-content">Contact</p>
              <a
                href="mailto:hello@sripatro.com"
                className="transition hover:text-primary"
              >
                hello@sripatro.com
              </a>
            </div>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-base-300 text-base-content/70 transition hover:border-primary hover:text-primary"
                >
                  <Icon size={20} weight="bold" />
                </a>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <Tools className="lg:grid-cols-3" />
          </div>
        </div>
      </div>
      <div className="border-t border-base-200">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-base-content/60 sm:flex-row sm:text-sm">
            <p>© {currentYear} SriPatro. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/about" className="transition hover:text-primary">
                About
              </Link>
              <Link
                href="/contact-us"
                className="transition hover:text-primary"
              >
                Contact
              </Link>
              <Link
                href="/privacy-policy"
                className="transition hover:text-primary"
              >
                Privacy
              </Link>
              <Link href="/settings" className="transition hover:text-primary">
                Preferences
              </Link>
              <a
                href="https://github.com/DeepakisDemigod"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-primary"
              >
                Built by @deepakisdemigod
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
