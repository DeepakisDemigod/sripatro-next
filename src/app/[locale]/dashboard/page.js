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
    async function fetchAstrologers() {
      const res = await fetch(`/api/users/profile`);
      if (res.ok) {
        const data = await res.json();
        setAstrologers(data.users);
      }
    }
    fetchAstrologers();
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
    <div className="min-h-screen bg-base-200 text-white flex flex-col">
      <Header />
      <div className="flex flex-col items-center py-8 flex-1">
        <div className="card w-full max-w-md bg-base-100 shadow-xl border border-red-600 mb-6">
          <div className="card-body items-center">
            <Avatar
              className="rounded-full border-4 border-red-600 mb-4"
              style={{ width: "100px", height: "100px" }}
              {...config}
            />
            <h1 className="text-2xl font-bold text-red-600 mb-1">
              Welcome,{" "}
              {profile?.name || session?.user?.email?.split("@")[0]}{" "}
            </h1>
            <div className="text-xs  flex  font-bold mb-2 text-gray-500">
              {session?.user?.email}
              <div className="flex gap-1 items-center px-1 border border-base-300 rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 154 154"
                >
                  <g fill="none" stroke="#22AE73" strokeWidth="2">
                    <circle
                      cx="77"
                      cy="77"
                      r="72"
                      className="animate-draw-circle"
                    />
                    <circle
                      fill="#22AE73"
                      cx="77"
                      cy="77"
                      r="72"
                      className="animate-fill-circle"
                    />
                    <polyline
                      stroke="#fff"
                      strokeWidth="10"
                      points="43.5,77.8 63.7,97.9 112.2,49.4"
                      className="animate-draw-check"
                    />
                  </g>
                </svg>{" "}
                verified
              </div>
            </div>
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
                  <strong>Languages:</strong>{" "}
                  {profile.languages?.join(", ") || "-"}
                </div>
                {avgRating && (
                  <div className="mt-2">
                    <strong>Average Rating:</strong>{" "}
                    <span className="text-yellow-500 font-bold">
                      ★ {avgRating}
                    </span>
                  </div>
                )}
                {profile.customersCount !== undefined && (
                  <div className="mt-2">
                    <strong>Customers Served:</strong>{" "}
                    <span className="text-red-600 font-bold">
                      {profile.customersCount}
                    </span>
                  </div>
                )}
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
          </div>
        </div>
        {astrologers.length > 0 && (
          <div className="card w-full max-w-2xl bg-base-100 shadow-lg border border-red-600 mt-4">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-4 text-red-600">
                Astrologers
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {astrologers.map((astro) => (
                  <li
                    key={astro._id}
                    className="p-4 rounded-lg bg-base-200 border border-red-200"
                  >
                    <div className="font-bold text-lg text-red-600">
                      {astro.name || "-"}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {astro.email}
                    </div>
                    <div className="mb-1">
                      <strong>Bio:</strong> {astro.bio || "-"}
                    </div>
                    <div className="mb-1">
                      <strong>Languages:</strong>{" "}
                      {astro.languages?.join(", ") || "-"}
                    </div>
                    {astro.services && astro.services.length > 0 && (
                      <div className="mb-1">
                        <strong>Services:</strong>
                        <ul className="list-disc ml-6">
                          {astro.services.map((svc, idx) => (
                            <li key={idx} className="text-sm">
                              <span className="font-semibold text-red-600">
                                {svc.title}
                              </span>{" "}
                              - ₹{svc.price}: {svc.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {/* User's bookings section */}
        {userBookings && userBookings.length > 0 && (
          <div className="card w-full max-w-2xl bg-base-100 shadow-lg border border-red-600 mt-8">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-4 text-red-600">
                My Bookings
              </h2>
              <ul className="space-y-4">
                {userBookings.map((b) => (
                  <li
                    key={b._id}
                    className="p-4 rounded-lg bg-base-200 border border-red-200"
                  >
                    <div>
                      <strong>Service:</strong> {b.service.title} - ₹
                      {b.service.price}
                    </div>
                    <div>
                      <strong>Astrologer:</strong> {b.astrologerEmail}
                    </div>
                    <div>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`badge badge-outline ${
                          b.status === "pending"
                            ? "badge-error"
                            : b.status === "approved"
                              ? "badge-success"
                              : b.status === "rejected"
                                ? "badge-warning"
                                : "badge-info"
                        } border-red-600 text-red-600`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <a
                      href={`/bookings/${b._id}`}
                      className="btn btn-outline btn-error border-red-600 text-red-600 mt-2 w-full"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Booking Details & Chat
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <div className="flex gap-4 mt-8">
          <Link href="/">
            <button className="btn rounded-lg border-red-600 bg-base-100 text-red-600 shadow">
              HOME
            </button>
          </Link>
          <button
            className="btn rounded-lg border-red-600 bg-transparent text-red-600 shadow"
            onClick={() => signOut()}
          >
            LOGOUT
          </button>
        </div>
      </div>
      <div className="w-full mt-auto">
        <Tiles />
        <Patro />
        <Comments currentUserId="1" />
        <Footer />
      </div>
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
