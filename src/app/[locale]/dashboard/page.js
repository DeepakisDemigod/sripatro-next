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
import Menu from "@/components/Menu";
import { HourglassMedium, XCircle, CheckCircle } from "phosphor-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import AstrologerStatusSwitcher from "@/components/AstrologerStatusSwitcher";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState(null);
  const [astrologers, setAstrologers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
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
    let interval;
    async function fetchAstrologers() {
      const res = await fetch(`/api/users/profile`);
      if (res.ok) {
        const data = await res.json();
        setAstrologers(data.users);
      }
    }
    fetchAstrologers();
    interval = setInterval(fetchAstrologers, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Fetch bookings for astrologer dashboard
  useEffect(() => {
    async function fetchBookings() {
      if (profile?.role === "astrologer") {
        const res = await fetch(
          `/api/bookings?astrologerEmail=${encodeURIComponent(profile.email)}`
        );
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      }
    }
    fetchBookings();
  }, [profile]);

  useEffect(() => {
    async function fetchUserBookings() {
      if (session?.user?.email) {
        const res = await fetch(
          `/api/bookings?userEmail=${encodeURIComponent(session.user.email)}`
        );
        if (res.ok) {
          const data = await res.json();
          setUserBookings(data.bookings || []);
        }
      }
    }
    fetchUserBookings();
  }, [session]);

  useEffect(() => {
    async function fetchAvgRating() {
      if (profile?.role === "astrologer") {
        const res = await fetch(`/api/ratings?astrologerId=${profile._id}`);
        if (res.ok) {
          const data = await res.json();
          setAvgRating(data.avgRating);
        }
      }
    }
    fetchAvgRating();
  }, [profile]);

  // seed for avatar generation
  const config = genConfig({ seed: session?.user?.email });

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col">
      <Header />
      <div className="flex items-center gap-4 justify-end px-6 py-2">
        <ThemeSwitcher />
        <LocaleSwitcher />
        {profile?.role === "astrologer" && (
          <AstrologerStatusSwitcher
            userEmail={profile.email}
            isOnlineDefault={profile.isOnline}
          />
        )}
      </div>
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
                {avgRating && (
                  <div className="mt-1">
                    <span className="font-semibold">Average Rating:</span>{" "}
                    <span className="text-yellow-500 font-bold">
                      ★ {avgRating}
                    </span>
                  </div>
                )}
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
          {/* Bookings Card */}
          <div className="bg-base-100 rounded-2xl shadow-md border border-base-200 p-6">
            <h2 className="text-lg font-semibold text-base-content/80 mb-2 tracking-tight">
              My Bookings
            </h2>
            {userBookings && userBookings.length > 0 ? (
              <ul className="flex flex-col gap-4">
                {userBookings.map((b) => (
                  <li
                    key={b._id}
                    className="bg-base-200 rounded-xl p-4 border border-base-300 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="font-bold text-lg text-base-content/90">
                        {b.service.title}
                      </span>
                      <span className="bg-base-100 rounded-xl p-1 px-2 flex items-center gap-1">
                        {b.status === "pending" && (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500">
                            <HourglassMedium size={18} className="text-white" />
                          </span>
                        )}
                        {b.status === "approved" && (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600">
                            <CheckCircle size={18} className="text-white" />
                          </span>
                        )}
                        {b.status === "rejected" && (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600">
                            <XCircle size={18} className="text-white" />
                          </span>
                        )}
                        {b.status === "completed" && (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              fill="white"
                              viewBox="0 0 256 256"
                              className="inline-block align-middle"
                            >
                              <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-11.55,39.29c-4.79,5-9.75,10.17-12.38,16.52-2.52,6.1-2.63,13.07-2.73,19.82-.1,7-.21,14.33-3.32,17.43s-10.39,3.22-17.43,3.32c-6.75.1-13.72.21-19.82,2.73-6.35,2.63-11.52,7.59-16.52,12.38S132,224,128,224s-9.15-4.92-14.11-9.69-10.17-9.75-16.52-12.38c-6.1-2.52-13.07-2.63-19.82-2.73-7-.1-14.33-.21-17.43-3.32s-3.22-10.39-3.32-17.43c-.1-6.75-.21-13.72-2.73-19.82-2.63-6.35-7.59-11.52-12.38-16.52S32,132,32,128s4.92-9.15,9.69-14.11,9.75-10.17,12.38-16.52c2.52-6.1,2.63-13.07,2.73-19.82.1-7,.21-14.33,3.32-17.43S70.51,56.9,77.55,56.8c6.75-.1,13.72-.21,19.82-2.73,6.35-2.63,11.52-7.59,16.52-12.38S124,32,128,32s9.15,4.92,14.11,9.69,10.17,9.75,16.52,12.38c6.1,2.52,13.07,2.63,19.82,2.73,7,.1,14.33.21,17.43,3.32s3.22,10.39,3.32,17.43c.1,6.75.21,13.72,2.73,19.82,2.63,6.35,7.59,11.52,12.38,16.52S224,124,224,128,219.08,137.15,214.31,142.11ZM173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z" />
                            </svg>
                          </span>
                        )}
                        <span className="text-xs text-base-content/70 capitalize ml-1">
                          {b.status}
                        </span>
                      </span>
                    </div>
                    <div className="text-xs text-base-content/70">
                      Astrologer: {b.astrologerEmail}
                    </div>
                    <Link
                      href={`/bookings/${b._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="btn btn-sm btn-outline btn-error border-red-600 text-red-600 mt-2 w-full hover:text-white">
                        Open Booking Details & Chat
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-base-content/60">No bookings yet.</div>
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

  async function updateBookingStatus(id, status) {
    const res = await fetch(`/api/bookings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      // Refresh bookings after update
      const data = await res.json();
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: data.status } : b))
      );
    } else {
      alert("Failed to update booking status");
    }
  }
}
