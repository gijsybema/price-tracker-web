"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchInput() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Zoeken…"
        className="w-40 rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-3 pr-8 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none sm:w-52"
      />
      <button
        type="submit"
        aria-label="Zoeken"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      </button>
    </form>
  );
}
