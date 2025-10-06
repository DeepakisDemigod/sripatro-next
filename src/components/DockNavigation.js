"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarBlank,
  HouseSimple,
  SunHorizon,
  Sparkle,
  BookOpen,
  Gear,
} from "phosphor-react";

const navItems = [
  { label: "Home", href: "/home", icon: HouseSimple },
  { label: "Calendar", href: "/calendar", icon: CalendarBlank },
  { label: "Daily Panchang", href: "/daily-panchang", icon: SunHorizon },
  { label: "Shubh Saita", href: "/shubh-saita", icon: Sparkle },
  { label: "Horoscope", href: "/horoscope", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: Gear },
];

function resolveLocalePath(pathname) {
  if (!pathname) return "";
  const parts = pathname.split("/");
  if (parts.length > 1) {
    return parts[1] || "";
  }
  return "";
}

function NavItem({ item, pathname, locale }) {
  const resolvedHref = `/${locale}${item.href}`.replace(/\/+/g, "/");
  const isActive =
    pathname === resolvedHref || pathname.startsWith(`${resolvedHref}/`);
  const Icon = item.icon;

  return (
    <Link
      href={resolvedHref}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-2xl px-4 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
      }`}
    >
      <Icon
        weight={isActive ? "fill" : "regular"}
        size={22}
        className="shrink-0"
      />
      <span className="text-sm font-medium">{item.label}</span>
    </Link>
  );
}

export default function DockNavigation() {
  const pathname = usePathname() || "/";
  const locale = resolveLocalePath(pathname);

  // Hide dock on the root locale pages like '/en' or '/en/'
  if (pathname === `/${locale}` || pathname === `/${locale}/`) return null;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:justify-between fixed inset-y-0 left-0 w-64 border-r border-base-200 bg-base-100/70 backdrop-blur supports-[backdrop-filter]:bg-base-100/60 z-40">
        <div className="flex flex-col gap-4 px-4 py-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-base-content/60 px-2">
            Navigate
          </div>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                pathname={pathname}
                locale={locale}
              />
            ))}
          </nav>
        </div>
        <div className="px-4 py-6 text-xs text-base-content/50">
          Made with ❤️ for the Nepalese
        </div>
      </aside>

      {/* Mobile dock */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-base-200 bg-base-100/90 backdrop-blur supports-[backdrop-filter]:bg-base-100/70">
        <ul className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const resolvedHref = `/${locale}${item.href}`.replace(/\/+/g, "/");
            const isActive =
              pathname === resolvedHref ||
              pathname.startsWith(`${resolvedHref}/`);
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={resolvedHref}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex flex-col items-center gap-1 rounded-full px-1 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 ${
                    isActive
                      ? "text-primary"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  <Icon
                    size={24}
                    weight={isActive ? "fill" : "regular"}
                    className="transition-transform group-hover:-translate-y-0.5"
                  />
                  <span>{item.label.split(" ")[0]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
