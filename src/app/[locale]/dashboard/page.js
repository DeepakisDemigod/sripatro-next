"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div>
        <div className=" h-16 w-16 shrink-0 rounded-full"></div>
      </div>

      <h1 className="text-lg font-bold mb-2">
        Welcome, {session?.user?.email.split("@gmail.com")}
      </h1>
      <Link href="/">
        <button className="btn rounded-lg border-red-600 bg-red-600 text-white">
          HOME
        </button>
      </Link>
      <button
        className="btn rounded-lg border-red-600 bg-transparent text-red-600"
        onClick={() => signOut()}
      >
        LOGOUT
      </button>
    </div>
  );
}
