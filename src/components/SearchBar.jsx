"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const router = useRouter();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    // Basic internal redirect with query param; adjust if you add a /search route
    router.push(`/?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search Panchang, Kundali, Horoscope…"
        className="input input-bordered flex-1"
        aria-label="Search"
      />
      <button className="btn btn-primary" type="submit">
        Search
      </button>
    </form>
  );
}
