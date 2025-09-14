"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import Footer from "@/components/Footer.js";
import Header from "@/components/Header.js";
import Patro from "@/components/Patro.js";
import Tiles from "@/components/Tiles.js";
import Menu from "@/components/Menu";

import HoroscopeForm from "@/components/Horoscope/Horoscope";

export default function Dashboard() {
  const { data: session, status } = useSession();

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

        {/* <HoroscopeForm />*/}

        <Patro />
      </div>
    </div>
  );
}
