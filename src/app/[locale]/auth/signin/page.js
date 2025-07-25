"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image"

export default function SignIn() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await signIn("email", { email });
    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="rounded w-96 bg-base-100 p-6 border border-2  border-base-300"
      >
	<div className="flex items-center justify-center gap-1"><Image className="rounded-lg" src="/logo.png" alt="logo" width={33} height={33}/><p className="text-2xl font-semibold text-base-700">SriPatro</p></div>
	  <br/>
        <input
          type="email"
          placeholder="mike@sripatro.com"
          className="input input-bordered border-2 focus:border-red-600 w-full mb-3 rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          className="btn bg-red-700 text-base text-white w-full rounded-lg"
          type="submit"
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Send Mail"
          )}
        </button>
        <br />
        <span className="text-xs mx-.5">
          by continuing you are accepting to our Terms and Conditions & Privacy
          Policy
        </span>
      </form>
    </div>
  );
}
