"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
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
  const [profile, setProfile] = useState(null);
  const [astrologers, setAstrologers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    async function fetchProfile() {
      if (session?.user?.email) {
        const res = await fetch(
          `/api/users/profile?email=${encodeURIComponent(session.user.email)}`
        );
        if (res.ok) {
          const data = await res.json();
          setProfile(data.users[0]);
          if (!data.users[0]?.profileComplete) {
            router.push("/complete-profile");
          }
        }
      }
    }
    fetchProfile();
  }, [session, status, router]);

  useEffect(() => {
    async function fetchAstrologers() {
      const res = await fetch(`/api/users/profile`);
      if (res.ok) {
        const data = await res.json();
        setAstrologers(data.users);
      }
    }
    fetchAstrologers();
  }, []);

  // seed for avatar generation
  const config = genConfig({ seed: session?.user?.email });

  return (
    <div className=" h-screen text-white">
      <div className="flex flex-col items-center py-4">
        <Avatar
          className="rounded-full"
          style={{ width: "100px", height: "100px" }}
          {...config}
        />
        <h1 className="text-lg font-bold">
          welcome, {session?.user?.email.split("@gmail.com")}
        </h1>
        <span className="text-xs font-bold mb-2">{session?.user?.email}</span>
        {profile && (
          <div className="mt-4 p-4 bg-base-100 rounded-lg text-black w-full max-w-md">
            <div>
              <strong>Name:</strong> {profile.name || "-"}
            </div>
            <div>
              <strong>Role:</strong> {profile.role || "user"}
            </div>
            <div>
              <strong>Bio:</strong> {profile.bio || "-"}
            </div>
            <div>
              <strong>Languages:</strong> {profile.languages?.join(", ") || "-"}
            </div>
            {profile.services && profile.services.length > 0 && (
              <div>
                <strong>Services:</strong>
                <ul>
                  {profile.services.map((svc, idx) => (
                    <li key={idx}>
                      {svc.title} - ₹{svc.price}: {svc.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {astrologers.length > 0 && (
          <div className="mt-8 p-4 bg-base-100 rounded-lg text-black w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">Astrologers</h2>
            <ul>
              {astrologers.map((astro) => (
                <li key={astro._id} className="mb-2">
                  <div>
                    <strong>Name:</strong> {astro.name || "-"}
                  </div>
                  <div>
                    <strong>Email:</strong> {astro.email}
                  </div>
                  <div>
                    <strong>Bio:</strong> {astro.bio || "-"}
                  </div>
                  <div>
                    <strong>Languages:</strong>{" "}
                    {astro.languages?.join(", ") || "-"}
                  </div>
                  {astro.services && astro.services.length > 0 && (
                    <div>
                      <strong>Services:</strong>
                      <ul>
                        {astro.services.map((svc, idx) => (
                          <li key={idx}>
                            {svc.title} - ₹{svc.price}: {svc.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
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
