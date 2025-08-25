// app/auth/verify-request/page.js
"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "phosphor-react";

export default function VerifyRequestPage() {
  return (
    <main className="min-h-screen bg-base-100 text-base-900 flex items-center justify-center px-4">
      <div className="text-center border border-base-300 p-6 rounded-xl w-full max-w-md bg-base-100">
        {/* Success Icon */}

        <div className="flex items-center justify-center gap-1.5 border-b border-base-300 pb-4  ">
          <Image
            className="rounded-lg"
            src="/logo.png"
            alt="logo"
            width={25}
            height={25}
          />
          <p className="text-xl font-semibold text-base-700">SriPatro</p>
        </div>
        <br />
        <div className="my-2 flex justify-center items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            viewBox="0 0 154 154"
          >
            <g fill="none" stroke="#22AE73" strokeWidth="2">
              <circle cx="77" cy="77" r="72" className="animate-draw-circle" />
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
          </svg>
          <h1 className="text-xl font-semibold">Magic Link Sent!</h1>
        </div>

        <p className="text-sm text-base-800 mx-6">
          A sign-in link has been sent to your email. Please click the link to
          sign in.
        </p>
        <div className="text-center w-full my-4">
          <Link href="https://gmail.google.com">
            <button className="btn bg-red-600  text-white rounded-lg w-full flex items-center justify-center gap-2  p-1 text-sm font-bold">
              <span>Open Email Inbox</span>
              <ArrowUpRight size={15} weight="bold" />
            </button>
          </Link>
        </div>

        {/* Additional Info */}
        <p className="text-xs text-base-700 border-t border-base-300 pt-2">
          Don’t forget to check your spam folder just in case.
          <br />
          Need help?{" "}
          <Link
            href="mailto:deepakthapa1423@gmail.com"
            target="_blank"
            className="underline text-blue-600"
          >
            Email me
          </Link>
        </p>
      </div>

      {/* Tailwind animations (optional via global CSS) */}
      <style jsx>{`
        .animate-draw-circle {
          stroke-dasharray: 480;
          stroke-dashoffset: 960;
          animation: dash 1.2s ease-out forwards;
        }

        .animate-fill-circle {
          stroke-dasharray: 480;
          stroke-dashoffset: 960;
          animation: dash 1.2s ease-out forwards;
        }

        .animate-draw-check {
          stroke-dasharray: 100;
          stroke-dashoffset: 200;
          animation: dash 0.6s 0.6s ease-out forwards;
        }

        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </main>
  );
}
