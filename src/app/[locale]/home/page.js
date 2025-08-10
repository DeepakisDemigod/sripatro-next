"use client";

import { useEffect } from "react";
import Footer from "@/components/Footer.js";
import Header from "@/components/Header.js";
import Patro from "@/components/Patro.js";
import Tiles from "@/components/Tiles.js";
import Comments from "@/components/Comments/Comments";

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
        <Patro />
      </div>
      <Comments currentUserId="1" />
    </div>
  );
}
