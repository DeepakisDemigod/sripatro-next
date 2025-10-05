/*"use client"

import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

import { Open_Sans } from "next/font/google";

import "./globals.css";

import { SessionProvider } from "next-auth/react"

// Configure openSans for headings
const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "700", "800"], // Include weights you need
  variable: "--font-open_sans", // Unique CSS variable for openSans
});

export default async function LocaleLayout({ children, params }) {
  const { locale } = params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={`${openSans.variable} antialiased`}>
        <NextIntlClientProvider locale={locale}>
	  <SessionProvider >

          {children}
	  </SessionProvider >
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

*/
/*
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Open_Sans } from "next/font/google";
import { getMessages } from "next-intl/server";
import { SessionProvider } from "next-auth/react";

import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-open_sans",
});

export default async function LocaleLayout({ children, params }) {
  const { locale } = params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className={`${openSans.variable} antialiased`}>
        <SessionProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
*/

import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import "./globals.css";
import SessionWrapper from "../../components/SessionWrapper.js"; // 👈 import wrapper

import ThemeSwitcher from "@/components/ThemeSwitcher";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import ContactPopup from "@/components/ContactPopup";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import DockNavigation from "@/components/DockNavigation";

export const metadata = {
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SriPatro",
  },
  applicationName: "SriPatro",
};

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  //export default async function LocaleLayout(props) {
  // const { locale } = await props.params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });
  return (
    <SessionWrapper>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <DockNavigation />
        <div className="min-h-screen bg-base-200 lg:pl-64">
          <div className="px-4 sm:px-6 lg:px-8 pb-24 lg:pb-0">
            <div className="flex justify-end gap-2 py-4">
              <ThemeSwitcher />
              <LocaleSwitcher />
            </div>
            {children}
          </div>
        </div>
        <ContactPopup />
        <ServiceWorkerRegister />
      </NextIntlClientProvider>
    </SessionWrapper>
  );
}

/*
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Gabarito, Poppins } from "next/font/google";
import { getMessages } from "next-intl/server";
import "./globals.css";
import SessionWrapper from "../../components/SessionWrapper.js";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const gabarito = Gabarito({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-gabarito",
});

const poppins = Poppins({
  subsets: ["devanagari", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export default async function LocaleLayout({ children, params }) {
  const { locale } = params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body
        className={`${gabarito.variable} ${poppins.variable} antialiased`}
      >
        <SessionWrapper>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeSwitcher />
            {children}
          </NextIntlClientProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
*/
