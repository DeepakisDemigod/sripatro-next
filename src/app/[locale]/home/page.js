"use client";

import { useEffect } from "react";
import Footer from "@/components/Footer.js";
import Header from "@/components/Header.js";
import Patro from "@/components/Patro.js";
import Tiles from "@/components/Tiles.js";
import Comments from "@/components/Comments/Comments";
import Menu from "@/components/Menu";
import CalendarMulti from "@/components/CalendarMulti";

import HoroscopeForm from "@/components/Horoscope/Horoscope";

export default function Dashboard() {
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-red-600"></span>
      </div>
    );
  }

  return (
    <div className=" h-screen">
      <Header />
      <div className="w-full">
        <Tiles />
        <div className="mt-6">
          <CalendarMulti defaultYear="2082" defaultMonth={1} />
        </div>
        {/* <HoroscopeForm />*/}

        <Patro />

        <Menu />
      </div>
      <Comments currentUserId="1" />
    </div>
  );
}
