"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Envelope } from "phosphor-react";

const drawerItems = [
  {
    label: "🪐 Jyotish",
    slug: "jyotish",
    subItems: [
      { label: "🧾 Kundali", href: "/jyotish/kundali" },
      { label: "❤️ Matchmaking", href: "/jyotish/matchmaking" },
      { label: "⏰ Muhurta", href: "/jyotish/muhurta" },
    ],
  },
  {
    label: "🕉️ Rituals",
    href: "/rituals",
  },
  {
    label: "Bug Report",
    href: "https://sripatro.canny.io/bug-reports",
  },
  {
    label: "Feature Request",
    href: "https://sripatro.canny.io/feature-requests",
  },
];

export default function Header() {
  const { data: session } = useSession();
  const drawerCheckboxRef = useRef(null);
  const [activeSubDrawer, setActiveSubDrawer] = useState(null);

  const handleCloseMainDrawer = () => {
    if (drawerCheckboxRef.current) {
      drawerCheckboxRef.current.checked = false;
    }
  };

  // Desktop nav items
  const DesktopNav = () => (
    <nav className="hidden lg:flex items-center space-x-6">
      {drawerItems.map((item, idx) =>
        !item.subItems ? (
          <Link
            key={idx}
            href={item.href}
            className="hover:text-primary transition-colors font-medium"
          >
            {item.label}
          </Link>
        ) : (
          <div key={idx} className="dropdown dropdown-hover">
            <label
              tabIndex={0}
              className="cursor-pointer font-medium hover:text-primary"
            >
              {item.label}
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {item.subItems.map((sub, subIdx) => (
                <li key={subIdx}>
                  <Link href={sub.href}>{sub.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </nav>
  );

  // Desktop session block
  const DesktopSession = () =>
    session ? (
      <div className="flex space-x-2">
        <span className="text-sm truncate ">{session.user?.email}</span>
        <details className="dropdown dropdown-end">
          <summary className="btn btn-ghost btn-sm">•••</summary>
          <ul className="menu dropdown-content bg-base-200 border rounded-md shadow w-40 z-10">
            <li>
              <Link href="/dashboard">Dashboard</Link>
            </li>
            <li className="px-4" onClick={() => signOut()}>
              SignOut
            </li>
            <li>
              <Link href="https://sripatro.canny.io">Suggest a Feature</Link>
            </li>
          </ul>
        </details>
      </div>
    ) : (
      <Link href="/auth/signin">
        <button className="btn btn-sm bg-red-700 text-white">LOGIN</button>
      </Link>
    );

  return (
    <header className="bg-base-100 border-b border-base-200 sticky top-0 z-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold flex items-center gap-2"
            >
              {/* Logo can be added here */}
              SriPatro
            </Link>
          </div>
          <DesktopNav />
          <div className="hidden lg:flex items-center space-x-2">
            <DesktopSession />
          </div>
          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center">
            <label
              htmlFor="mobile-drawer"
              className="border border-base-300 bg-base-100 btn btn-sm rounded-md text-base-400"
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className="drawer lg:hidden z-40">
        <input
          id="mobile-drawer"
          ref={drawerCheckboxRef}
          type="checkbox"
          className="drawer-toggle"
        />
        <div className="drawer-content"></div>
        <div className="drawer-side">
          <label htmlFor="mobile-drawer" className="drawer-overlay"></label>
          <aside className="menu p-4 w-full min-h-full bg-base-100 text-base-content">
            <div className="flex justify-between items-center mb-4">
              <h1 className="pl-2 text-lg font-bold">SriPatro</h1>
              <label
                htmlFor="mobile-drawer"
                className="border border-base-200 bg-base-100 btn btn-sm rounded-md text-base-400"
                aria-label="Close menu"
              >
                ✕
              </label>
            </div>
            <ul className="menu space-y-1">
              {drawerItems.map((item, index) => (
                <li key={index} className="">
                  {!item.subItems ? (
                    <Link href={item.href} onClick={handleCloseMainDrawer}>
                      {item.label}
                    </Link>
                  ) : (
                    <div>
                      <span className="font-medium">{item.label}</span>
                      <ul className="pl-4">
                        {item.subItems.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <Link
                              href={subItem.href}
                              onClick={handleCloseMainDrawer}
                              className="text-sm block py-1"
                            >
                              {subItem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 pl-4">
              {session ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm truncate">{session.user?.email}</p>
                  <details className="dropdown dropdown-end">
                    <summary className="btn btn-ghost btn-sm">•••</summary>
                    <ul className="menu dropdown-content bg-base-200 border rounded-md shadow w-40 z-10">
                      <li>
                        <Link href="/dashboard">Dashboard</Link>
                      </li>
                      <li className="px-4 " onClick={() => signOut()}>
                        SignOut
                      </li>
                      <li>
                        	<Link href="https://sripatro.canny.io/">
                          Suggest a Feature
                        </Link>
                      </li>
                    </ul>
                  </details>
                </div>
              ) : (
                <Link href="/auth/signin">
                  <button className="btn bg-red-600  text-md font-medium text-white w-full rounded-lg">
                    <span className="p-0 m-0">SIGN IN WITH EMAIL</span>
                  </button>
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </header>
  );
}
