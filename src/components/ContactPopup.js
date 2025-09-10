"use client";

import React, { useState, useEffect } from "react";
import { useForm, ValidationError } from "@formspree/react";
import { Chats } from "phosphor-react";
import { useSession } from "next-auth/react";

export default function ContactPopup() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, handleSubmit] = useForm("xvgqdleq");

  // Prefill email when session loads
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className="flex items-center gap-1 fixed bottom-4 right-4 rounded-lg p-2 bg-red-600 text-white shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Chats size={30} weight="fill" /> <span>Send A FeedBack</span>
      </button>

      {/* Popup Form */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 bg-base-100 p-4 rounded-lg shadow-2xl w-80 border border-base-300">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Give Us Feedback</h2>
            <button
              className="btn btn-xs btn-ghost"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {state.succeeded ? (
            <>
              <div className="my-2 flex justify-center items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
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
                </svg>
                <h1 className="text-2xl font-semibold">Feedback sent!</h1>
              </div>

              <p className="text-sm text-base-800">
                We will be working on your feedback soon.
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="email" className="label">
                  <span className="label-text">Email Address</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
		  placeholder="mike@sripatro.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input input-bordered w-full focus:outline-red-500 text-sm rounded-lg"
                />
                <ValidationError
                  prefix="Email"
                  field="email"
                  errors={state.errors}
                />
              </div>

              <div>
                <label htmlFor="message" className="label">
                  <span className="label-text">Message</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  placeholder="request a feature..."
                  className="textarea text-sm textarea-bordered w-full focus:outline-red-500 rounded-lg"
                  rows={3}
                />
                <ValidationError
                  prefix="Message"
                  field="message"
                  errors={state.errors}
                />
              </div>

              <button
                type="submit"
                className="rounded-lg font-bold bg-red-600 w-full text-white py-2"
                disabled={state.submitting}
              >
                {state.submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="loading loading-spinner loading-xs text-white"></span>
                    <span className="text-white text-sm font-bold">
                      Sending
                    </span>
                  </div>
                ) : (
                 <span className="text-white text-sm font-bold">
                      Send
                    </span>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Success Animation Styles */}
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
    </>
  );
}
