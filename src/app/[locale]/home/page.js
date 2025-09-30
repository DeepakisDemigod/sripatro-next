"use client";

import { useCallback, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Footer from "@/components/Footer.js";
import Header from "@/components/Header.js";
import Patro from "@/components/Patro.js";
import Tiles from "@/components/Tiles.js";
import SunMoonCycle from "@/components/Saita.js";

export default function Dashboard() {
  const { status } = useSession();
  const [coords, setCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState("");

  useEffect(() => {
    if (status !== "authenticated") {
      setCoords(null);
      if (status === "unauthenticated") {
        setGeoStatus(
          "Sign in to view live sun & moon timings tailored to you."
        );
      } else {
        setGeoStatus("");
      }
      return;
    }

    if (!("geolocation" in navigator)) {
      setGeoStatus("Geolocation isn't supported in this browser.");
      return;
    }

    let isMounted = true;
    setGeoStatus("Detecting your location for live sun & moon data...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMounted) return;

        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoStatus(null);
      },
      (error) => {
        if (!isMounted) return;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoStatus(
              "Location access was denied. Enable it to see local sun/moon timing."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoStatus("Location information is unavailable right now.");
            break;
          case error.TIMEOUT:
            setGeoStatus("Timed out while trying to fetch your location.");
            break;
          default:
            setGeoStatus("Unable to fetch your location at the moment.");
        }
      },
      {
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );

    return () => {
      isMounted = false;
    };
  }, [status]);

  const handleSignIn = useCallback(() => {
    const callbackUrl =
      typeof window !== "undefined" ? window.location.href : undefined;

    if (callbackUrl) {
      signIn(undefined, { callbackUrl });
    } else {
      signIn();
    }
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-red-600"></span>
      </div>
    );
  }

  const showDashboard = status === "authenticated";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="w-full flex-1 overflow-y-auto">
        {showDashboard ? (
          <div className="space-y-6 px-4 py-6 mx-auto w-full max-w-6xl">
            <Tiles />

            <section className="bg-base-100 border border-base-300 rounded-3xl shadow-sm p-4 sm:p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Sun & Moon Cycle</h2>
                <p className="text-sm text-base-500">
                  Live sunrise and sunset timings tailored to your current
                  timezone.
                </p>
              </div>

              {coords ? (
                <SunMoonCycle
                  lat={coords.lat}
                  lng={coords.lng}
                  imgSrc="/moon/Shukla/Punnami.png"
                />
              ) : (
                <p className="text-sm text-base-600 text-center">
                  {geoStatus ?? "Detecting your location..."}
                </p>
              )}
            </section>

            <Patro />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-4 py-10">
            <p className="text-center text-base text-base-600 max-w-lg">
              Please sign in to access your personalized dashboard with live
              panchang, tiles, and sun/moon insights tailored to your current
              location.
            </p>
          </div>
        )}
      </div>
      <Footer />
      {status === "unauthenticated" && (
        <SignInPrompt onSignIn={handleSignIn} geoStatus={geoStatus} />
      )}
    </div>
  );
}

function SignInPrompt({ onSignIn, geoStatus }) {
  return (
    <div className="fixed inset-0 z-50 bg-base-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-base-100 border border-base-300 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 text-center">
        <h2 className="text-2xl font-semibold">Sign in to continue</h2>
        <p className="text-sm text-base-600">
          Create or join your account to unlock the personalized Nepali
          calendar, daily tiles, and real-time sun & moon data.
        </p>
        {geoStatus ? (
          <p className="text-xs text-base-500 bg-base-200 border border-base-300 rounded-xl px-3 py-2">
            {geoStatus}
          </p>
        ) : null}
        <button
          className="btn bg-red-600 text-white rounded-full w-full"
          onClick={onSignIn}
        >
          Sign in
        </button>
        <p className="text-xs text-base-500">
          You&apos;ll return here automatically after signing in.
        </p>
      </div>
    </div>
  );
}
