"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Menu from "./Menu";
import InstallPWAButton from "./InstallPWAButton";
import InstallAppCard from "./InstallAppCard";

const drawerItems = [
  {
    label: "🪐 Jyotish",
    slug: "jyotish",
    subItems: [
      { label: "Panchang (AD)", href: "/" },
      { label: "Panchang (BS)", href: "/" },
      { label: "Kundali", href: "/" },
      { label: "Nepali Cheena", href: "/" },
    ],
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
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const drawerCheckboxRef = useRef(null);
  const { data: session } = useSession();
  const router = useRouter();
  const userInitial =
    session?.user?.email?.charAt(0)?.toUpperCase() ||
    session?.user?.name?.charAt(0)?.toUpperCase() ||
    "?";

  const handleSignOut = async () => {
    try {
      const data = await signOut({ redirect: false, callbackUrl: "/" });
      router.push(data?.url ?? "/");
    } catch (error) {
      console.error("Failed to sign out", error);
      router.push("/");
    }
  };

  const handleCloseMainDrawer = () => {
    if (drawerCheckboxRef.current) {
      drawerCheckboxRef.current.checked = false;
    }
    setIsMobileDrawerOpen(false);
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
              className="dropdown-content menu p-2 shadow rounded-box w-52"
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
      <details className="dropdown dropdown-end">
        <summary
          className="flex items-center cursor-pointer gap-2"
          tabIndex={0}
          aria-label="User menu"
        >
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center">
              <span className="text-lg font-semibold">{userInitial}</span>
            </div>
          </div>
        </summary>
        <ul className="menu dropdown-content bg-base-200 border rounded-md shadow w-44 z-10">
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li className="px-4 py-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full text-left"
            >
              Sign Out
            </button>
          </li>
        </ul>
      </details>
    ) : (
      <Link href="/auth/signin">
        <button className="btn btn-sm bg-red-700 text-white">LOGIN</button>
      </Link>
    );

  return (
    <header className="backdrop-blur-sm border-b border-base-200 sticky top-0 z-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: hidden on mobile when drawer open, visible on lg always */}
        <div
          className={`${isMobileDrawerOpen ? "hidden lg:flex" : "flex"} justify-between items-center h-16`}
        >
          <div className="flex items-center">
            <Link
              href="/home"
              className="text-xl font-bold flex items-center gap-2"
            >
              {/* Logo can be added here */}
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="logo"
                  className="rounded-lg"
                  width={30}
                  height={30}
                />
                <p className="text-base-900 font-extrabold text-2xl">
                  SriPatro
                </p>
              </div>
            </Link>
          </div>

          {session && <DesktopNav />}

          <div className="hidden lg:flex items-center space-x-2">
            <DesktopSession />
            <InstallPWAButton className="btn btn-sm btn-outline" />
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center">
            {/* Using label to toggle the checkbox — the checkbox onChange keeps state in sync */}
            <label
              htmlFor="mobile-drawer"
              className="backdrop-blur-bg rounded-md text-base-400 cursor-pointer"
              aria-label="Open menu"
            >
              {/* derive 'active' class from isMobileDrawerOpen */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
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
      {/* Play Store-like PWA install card under header bar (hidden when drawer open) */}
      <InstallAppCard hidden={isMobileDrawerOpen} />

      {/* Mobile Drawer */}
      <div className="drawer bg-base-100/90 lg:hidden z-[80]">
        <input
          id="mobile-drawer"
          ref={drawerCheckboxRef}
          type="checkbox"
          className="drawer-toggle"
          onChange={(e) => {
            const checked = e.target.checked;
            setIsMobileDrawerOpen(checked);
          }}
        />
        <div className="drawer-content "></div>
        <div className="drawer-side z-[80]">
          {/* overlay will toggle the checkbox (close drawer) */}
          <label htmlFor="mobile-drawer" className="drawer-overlay" />

          <aside className="menu p-4 w-full min-h-full bg-base-100/90 text-base-content">
            {/* Drawer header with logo + close button */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="logo"
                  className="rounded-lg"
                  width={30}
                  height={30}
                />
                <p className="text-base-900 font-extrabold text-2xl">
                  SriPatro
                </p>
              </div>

              {/* Close button: unchecks checkbox + reset state */}
              <label
                htmlFor="mobile-drawer"
                className="border border-base-200 backdrop-blur-sm text-2xl font-medium rounded-md text-base-400 cursor-pointer px-3 py-1"
                aria-label="Close menu"
                onClick={() => {
                  if (drawerCheckboxRef.current)
                    drawerCheckboxRef.current.checked = false;
                  setIsMobileDrawerOpen(false);
                }}
              >
                ✕
              </label>
            </div>

            {/* Drawer content */}
            {session && <Menu />}

            {/* Install UI for mobile: keep small button for browsers that support prompt */}
            <div className="mt-2 pl-4">
              <InstallPWAButton className="btn btn-outline w-full" />
            </div>

            <div className="mt-4 pl-4">
              {session ? (
                <div className="flex items-center justify-end">
                  <details className="dropdown dropdown-end">
                    <summary
                      className="flex items-center cursor-pointer"
                      aria-label="User menu"
                      tabIndex={0}
                    >
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-12 h-12 flex items-center justify-center">
                          <span className="text-lg font-semibold">
                            {userInitial}
                          </span>
                        </div>
                      </div>
                    </summary>
                    <ul className="menu dropdown-content bg-base-200 border rounded-md shadow w-44 z-10">
                      <li>
                        <Link href="/dashboard">Dashboard</Link>
                      </li>
                      <li className="px-4 ">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full text-left"
                        >
                          Sign Out
                        </button>
                      </li>
                    </ul>
                  </details>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[40vh]">
                  <Link href="/auth/signin">
                    <button className="btn bg-red-700  text-base font-bold text-white w-full rounded-lg hover:bg-red-600">
                      <span className="p-0 m-0">Sign In with Email</span>
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </header>
  );
}
