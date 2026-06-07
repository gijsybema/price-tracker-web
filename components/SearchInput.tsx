"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { SearchResult } from "@/lib/search";

export default function SearchInput() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data: SearchResult[] = await res.json();
        setResults(data);
        setOpen(true);
      } catch {
        // keep previous results on network error
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (results.length > 0) {
      router.push(`/${results[0].category}/${results[0].slug}`);
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          onClick={() => { if (results.length > 0) setOpen(true); }}
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

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">Geen resultaten gevonden</p>
          ) : (
            <ul>
              {results.map((r, i) => {
                const isDeal =
                  r.price_diff !== null &&
                  r.price_diff >= 25 &&
                  r.current_price !== null &&
                  r.current_price > 100;
                return (
                  <li key={r.id}>
                    <Link
                      href={`/${r.category}/${r.slug}`}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 ${i === 0 ? "rounded-t-xl" : ""} ${i === results.length - 1 ? "rounded-b-xl" : ""}`}
                    >
                      <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                        {r.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.image_url} alt={r.name} className="h-full w-full object-contain" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.brand}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {r.current_price !== null && (
                          <p className="text-sm font-medium text-gray-900">
                            €{Math.round(r.current_price).toLocaleString("nl-NL")}
                          </p>
                        )}
                        {isDeal && r.price_diff !== null && (
                          <p className="text-xs font-medium text-green-600">
                            -€{Math.round(r.price_diff).toLocaleString("nl-NL")}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
