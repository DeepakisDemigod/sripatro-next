"use client";

import React from "react";
import { Headset, House } from "phosphor-react";
import Header from "@/components/Header";
// import SearchBar from "@/components/SearchBar.jsx";

export default function LocaleNotFound() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-base-100 px-6 flex items-center justify-center">
        <div className="bg-base-100 rounded-2xl shadow-xl flex flex-col md:flex-row items-center md:items-start p-8 gap-8 max-w-4xl w-full">
          {/* Left */}
          <div className="flex flex-col items-center text-center md:text-left">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-6xl font-black text-base-content">4</h1>
              <img
                src="/logo.png"
                className="w-10 h-10 border-2 border-base-700 rounded-full rotate-45"
                alt="logo"
              />
              <h1 className="text-6xl font-black text-base-content">4</h1>
            </div>
            <h2 className="text-2xl font-semibold text-base-content mb-1">
              Page Not Found
            </h2>
            <p className="text-base-600 max-w-sm">
              The page you're looking for doesn’t exist or may have been moved.
              Please check the URL or return to the homepage.
            </p>
          </div>

          {/* Right */}
          <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
            <a
              href="/"
              className="btn bg-red-600 text-white font-semibold flex items-center gap-2 w-full md:w-auto"
            >
              <House size={22} />
              Home
            </a>
            <a
              href="mailto:deepakthapa1423@gmail.com"
              className="btn border border-base-300 hover:border-red-600 hover:text-red-600 font-semibold flex items-center gap-2 w-full md:w-auto"
            >
              <Headset size={22} />
              Support
            </a>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-2 items-start xs:border-t xs:border-base-400 sm:border-t sm:border-base-400 md:border-l md:border-base-400 lg:border-l lg:border-base-400 xl:border-l xl:border-base-400 p-4">
            <p className="text-base-400 text-sm py-1">
              find panchang, kundali, horoscope and more on sripatro
            </p>
            {/* <SearchBar /> */}
          </div>
        </div>
      </div>
    </>
  );
}
