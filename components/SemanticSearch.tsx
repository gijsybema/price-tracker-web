"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lightbulb, Sparkles } from "lucide-react";
import PriceFilter from "./PriceFilter";
import BrandMultiSelect from "./BrandMultiSelect";
import { searchSemantic } from "../app/actions/semantic-search";
import type { SearchResult } from "../lib/search";

function fmt(price: number): string {
  const str = price >= 100 ? price.toFixed(0) : price.toFixed(2);
  return str.replace(".", ",");
}

function hasDiscount(r: SearchResult): boolean {
  return (
    r.price_diff !== null &&
    Number(r.price_diff) > 0 &&
    r.drop_percentage !== null
  );
}

function PriceLine({ r }: { r: SearchResult }) {
  if (r.current_price === null) {
    return <span className="text-sm text-gray-400">Prijs onbekend</span>;
  }
  const high = r.current_price !== null && r.price_diff !== null
    ? Number(r.current_price) + Number(r.price_diff)
    : null;
  return (
    <div className="flex flex-wrap items-end gap-2">
      <span className="text-xl font-bold text-gray-900">€{fmt(Number(r.current_price))}</span>
      {hasDiscount(r) && high !== null && (
        <>
          <span className="text-base text-gray-400 line-through">€{fmt(high)}</span>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            -{Number(r.drop_percentage).toFixed(1).replace(".", ",")}%
          </span>
        </>
      )}
    </div>
  );
}

function StockLine({ r }: { r: SearchResult }) {
  if (r.in_stock === null) return null;
  const inStock = r.in_stock === true;
  return (
    <p className={`mt-1 text-xs font-medium ${inStock ? "text-green-600" : "text-red-500"}`}>
      {inStock ? "✓ Op voorraad" : "✕ Niet op voorraad"}
    </p>
  );
}

function ResultImage({ r, className }: { r: SearchResult; className: string }) {
  if (r.image_url) {
    return <img src={r.image_url} alt={r.name} className={className} loading="lazy" />;
  }
  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-400">
      Geen afbeelding
    </div>
  );
}

function TopMatchBanner({ r }: { r: SearchResult }) {
  const inStock = r.in_stock === true;
  const desc = r.ai_description?.trim();
  const deal = r.ai_deal_description?.trim();

  return (
    <Link
      href={`/${r.category}/${r.slug}`}
      className={`group flex flex-col gap-4 rounded-2xl border-2 border-blue-300 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-start ${!inStock ? "opacity-60" : ""}`}
    >
      <div className="flex h-40 w-full items-center justify-center sm:h-40 sm:w-48 sm:flex-shrink-0">
        <ResultImage r={r} className="max-h-36 w-auto max-w-full object-contain" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 whitespace-nowrap">
            <Sparkles className="h-3 w-3" aria-hidden="true" /> Beste match
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{r.brand}</span>
        </div>

        <h3 className="mt-1 text-base font-semibold leading-snug text-gray-900 group-hover:text-black">
          {r.name}
        </h3>

        <div className="mt-2">
          <PriceLine r={r} />
          <StockLine r={r} />
        </div>

        {desc && (
          <p className="mt-3 text-sm leading-relaxed text-gray-600">{desc}</p>
        )}

        {inStock && deal && (
          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-blue-800" aria-hidden="true" />
              <span className="text-xs font-semibold text-blue-800">Prijs inzicht</span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-blue-900">{deal}</p>
          </div>
        )}
      </div>
    </Link>
  );
}

function ResultCard({ r }: { r: SearchResult }) {
  const inStock = r.in_stock === true;
  return (
    <Link
      href={`/${r.category}/${r.slug}`}
      className={`group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${!inStock ? "opacity-60" : ""}`}
    >
      <div className="flex h-40 items-center justify-center">
        <ResultImage r={r} className="max-h-36 w-auto max-w-full object-contain" />
      </div>
      <div className="mt-4 flex flex-1 flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{r.brand}</p>
        <h3 className="text-sm font-semibold leading-snug text-gray-900 group-hover:text-black">
          {r.name}
        </h3>
      </div>
      <div className="mt-4">
        <PriceLine r={r} />
        <StockLine r={r} />
      </div>
    </Link>
  );
}

// Persists the last search (query, filters, results) in sessionStorage so it's
// still there if the user clicks through to a product and comes back to the
// homepage. Cleared automatically when the browser tab/session ends.
const SESSION_KEY = "semanticSearchState";

type PersistedState = {
  query: string;
  selectedBrands: string[];
  minPrice: string;
  maxPrice: string;
  status: "idle" | "loading" | "done";
  results: SearchResult[];
  error: string | null;
};

type Props = {
  brands: string[];
};

export default function SemanticSearch({ brands }: Props) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Restore a previous search on mount.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved: PersistedState = JSON.parse(raw);
        setQuery(saved.query);
        setSelectedBrands(new Set(saved.selectedBrands));
        setMinPrice(saved.minPrice);
        setMaxPrice(saved.maxPrice);
        setStatus(saved.status === "loading" ? "idle" : saved.status);
        setResults(saved.results);
        setError(saved.error);
      }
    } catch {
      // Corrupt/unavailable storage — start fresh.
    }
  }, []);

  // Persist explicitly (not via a reactive effect watching state) so a search
  // is only ever saved right after it actually completes. A "watch state and
  // auto-save" effect would also fire on the initial hydration render — at
  // that point the restore effect's setState calls above haven't been applied
  // to a re-render yet, so it would immediately overwrite the just-restored
  // sessionStorage with empty defaults.
  function persist(state: PersistedState) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch {
      // Storage full/unavailable — silently skip persistence.
    }
  }

  const activeFilters =
    selectedBrands.size + (minPrice !== "" ? 1 : 0) + (maxPrice !== "" ? 1 : 0);

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  }

  async function runSearch() {
    if (status === "loading") return;

    setStatus("loading");
    setError(null);

    const min = minPrice !== "" && !isNaN(Number(minPrice)) ? Number(minPrice) : null;
    const max = maxPrice !== "" && !isNaN(Number(maxPrice)) ? Number(maxPrice) : null;

    const res = await searchSemantic(query, {
      minPrice: min,
      maxPrice: max,
      brands: [...selectedBrands],
    });

    const finalResults = res.error ? [] : res.results;
    const finalError = res.error ?? null;

    setError(finalError);
    setResults(finalResults);
    setStatus("done");

    persist({
      query,
      selectedBrands: [...selectedBrands],
      minPrice,
      maxPrice,
      status: "done",
      results: finalResults,
      error: finalError,
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch();
  }

  // Enter submits; Shift+Enter inserts a newline.
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      runSearch();
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="rounded-2xl border border-gray-300 bg-white shadow-sm transition focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900">
          <div className="flex items-start gap-3 px-4 pt-4">
            <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-500" aria-hidden="true" />
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              placeholder="Beschrijf wat voor product je zoekt en welke functies belangrijk zijn. Bijv: 'draadloze koptelefoon voor sport met goede pasvorm'"
              className="w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-2.5">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-gray-900"
            >
              Filters{activeFilters > 0 ? ` (${activeFilters})` : ""}
              <span className={`text-gray-400 transition ${showFilters ? "rotate-180" : ""}`}>▾</span>
            </button>

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {status === "loading" ? "Zoeken…" : "Zoek met AI"}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <PriceFilter
              min={minPrice}
              max={maxPrice}
              onMinChange={setMinPrice}
              onMaxChange={setMaxPrice}
              onClear={() => {
                setMinPrice("");
                setMaxPrice("");
              }}
            />
            <BrandMultiSelect
              brands={brands}
              selected={selectedBrands}
              onToggle={toggleBrand}
              onClearAll={() => setSelectedBrands(new Set())}
            />
          </div>
        )}
      </form>

      <div className="mt-8">
        {status === "loading" && (
          <div className="flex items-center justify-center gap-3 py-10 text-gray-600">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
            Zoeken…
          </div>
        )}

        {status === "done" && error && (
          <p className="py-10 text-center text-gray-600">{error}</p>
        )}

        {status === "done" && !error && results.length === 0 && (
          <p className="py-10 text-center text-gray-600">
            Geen resultaten gevonden. Probeer een andere omschrijving.
          </p>
        )}

        {status === "done" && !error && results.length > 0 && (
          <div className="flex flex-col gap-6">
            <TopMatchBanner r={results[0]} />
            {results.length > 1 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.slice(1).map((r) => (
                  <ResultCard key={r.id} r={r} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
