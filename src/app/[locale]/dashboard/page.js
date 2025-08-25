"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Avatar, { genConfig } from "react-nice-avatar";
import Link from "next/link";
import Footer from "@/components/Footer.js";
import Header from "@/components/Header.js";
import Patro from "@/components/Patro.js";
import Tiles from "@/components/Tiles.js";
import Comments from "@/components/Comments/Comments";

export default function Dashboard() {
  const { data: session, status } = useSession();
	{/* useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status]);*/}

  // seed for avatar generation
  const config = genConfig({ seed: session?.user?.email });

  const router = useRouter();

	{/*if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-red-600"></span>
      </div>
    );
  }*/}

  return (
    <div className=" h-screen text-white">
      <div className="flex flex-col items-center py-4 bg-[linear-gradient(180deg,_rgba(0,0,0,1)_0%,_rgba(255,0,0,1)_0%,_rgba(3,0,0,1)_100%)]">
        <Avatar
          className="rounded-full"
          style={{ width: "100px", height: "100px" }}
          {...config}
        />
        <h1 className="text-lg font-bold">
          welcome, {session?.user?.email.split("@gmail.com")}
        </h1>
        <span className="text-xs font-bold mb-2">{session?.user?.email}</span>
      </div>
      <Link href="/">
        <button className="btn rounded-lg border-red-600 bg-base-100 text-red-600">
          HOME
        </button>
      </Link>
      <button
        className="btn rounded-lg border-red-600 bg-transparent text-red-600"
        onClick={() => signOut()}
      >
        LOGOUT
      </button>
      <div className="w-full">
        <Tiles />
        <Patro />
      </div>
      <Comments currentUserId="1" />
    </div>
  );
}
