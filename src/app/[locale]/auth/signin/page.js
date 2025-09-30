"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function SignIn() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.push("/home");
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
        className="rounded w-96 bg-base-100 p-6 border m-4 border-base-300"
      >
        <div className="flex items-center justify-center gap-1">
          <Image
            className="rounded-lg"
            src="/logo.png"
            alt="logo"
            width={33}
            height={33}
          />
          <p className="text-2xl font-semibold text-base-700">SriPatro</p>
        </div>
        <br />
        <h3 className="text-base-800/60 text-lg font-bold text-center underline">
          SignIn with Email to Continue
        </h3>
        <input
          type="email"
          placeholder="mike@sripatro.com"
          className="input input-md input-bordered  focus:border-red-600 w-full mb-3 mt-2 rounded-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          className="btn btn-md bg-red-700 text-base text-white w-full rounded-full"
          type="submit"
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Send Mail"
          )}
        </button>
        <br />
        <br />
        <p className="text-xs text-center mx-8 mb-2">
          By continuing you are accepting to our{" "}
          <Link
            href="mailto:deepakthapa1423@gmail.com"
            target="_blank"
            className="underline text-blue-600"
          >
            Terms and Conditions
          </Link>{" "}
          &{" "}
          <Link
            href="mailto:deepakthapa1423@gmail.com"
            target="_blank"
            className="underline text-blue-600"
          >
            Privacy Policy
          </Link>
        </p>

        <p className="text-xs text-base-700 border-t border-base-300/90 pt-2 text-center">
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
      </form>
    </div>
  );
}
