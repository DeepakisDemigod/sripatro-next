"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer.js";
import Header from "@/components/Header.js";
import Patro from "@/components/Patro.js";
import Tiles from "@/components/Tiles.js";
import Comments from "@/components/Comments/Comments";
import Menu from "@/components/Menu";

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

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col">
      <Header />

      <main className="flex-1 w-full flex flex-col items-center py-8 gap-8">
        <div className="w-full max-w-3xl flex flex-col gap-8">
          {/* Profile Card */}
          <div className="bg-base-100 rounded-2xl shadow-md border border-base-200 p-6 flex flex-col gap-2 items-center">
            <h2 className="text-lg font-semibold text-base-content/80 mb-2 tracking-tight">
              My Profile
            </h2>
            {profile && (
              <div className="w-full flex flex-col gap-1 text-base-content/90">
                <div>
                  <span className="font-semibold">Name:</span>{" "}
                  {profile.name || "-"}
                </div>
                <div>
                  <span className="font-semibold">Role:</span>{" "}
                  {profile.role || "user"}
                  {profile.role === "astrologer" && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      {profile.isOnline ? (
                        <span
                          className="w-2 h-2 rounded-full bg-green-500 inline-block"
                          title="Online"
                        ></span>
                      ) : (
                        <span
                          className="w-2 h-2 rounded-full bg-gray-400 inline-block"
                          title="Offline"
                        ></span>
                      )}
                      <span className="text-xs">
                        {profile.isOnline ? "Online" : "Offline"}
                      </span>
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-semibold">Bio:</span>{" "}
                  {profile.bio || "-"}
                </div>
                <div>
                  <span className="font-semibold">Languages:</span>{" "}
                  {profile.languages?.join(", ") || "-"}
                </div>
                {profile.customersCount !== undefined && (
                  <div className="mt-1">
                    <span className="font-semibold">Customers Served:</span>{" "}
                    <span className="text-red-600 font-bold">
                      {profile.customersCount}
                    </span>
                  </div>
                )}
                {profile.services && profile.services.length > 0 && (
                  <div className="mt-1">
                    <span className="font-semibold">Services:</span>
                    <ul className="list-disc ml-5 text-sm">
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
          </div>
          {/* Astrologers Card */}
          {astrologers.length > 0 && (
            <div className="bg-base-100 rounded-2xl shadow-md border border-base-200 p-6">
              <h2 className="text-lg font-semibold text-base-content/80 mb-2 tracking-tight">
                Astrologers
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {astrologers.map((astro) => (
                  <li
                    key={astro._id}
                    className="bg-base-200 rounded-xl p-4 border border-base-300 flex flex-col gap-1"
                  >
                    <div className="font-bold text-base-content/90 flex items-center gap-2">
                      {astro.name || "-"}
                      {astro.role === "astrologer" && (
                        <span className="inline-flex items-center gap-1">
                          {astro.isOnline ? (
                            <span
                              className="w-2 h-2 rounded-full bg-green-500 inline-block"
                              title="Online"
                            ></span>
                          ) : (
                            <span
                              className="w-2 h-2 rounded-full bg-gray-400 inline-block"
                              title="Offline"
                            ></span>
                          )}
                          <span className="text-xs">
                            {astro.isOnline ? "Online" : "Offline"}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-base-content/60 mb-1">
                      {astro.email}
                    </div>
                    <div className="mb-1 text-sm">
                      <span className="font-semibold">Bio:</span>{" "}
                      {astro.bio || "-"}
                    </div>
                    <div className="mb-1 text-sm">
                      <span className="font-semibold">Languages:</span>{" "}
                      {astro.languages?.join(", ") || "-"}
                    </div>
                    {astro.services && astro.services.length > 0 && (
                      <div className="mt-1">
                        <span className="font-semibold">Services:</span>
                        <ul className="list-disc ml-5 text-xs">
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
      </main>
      <Menu />
      <Patro />
      <Comments currentUserId="1" />
      <Footer />
    </div>
  );
}
