"use client";

import { useState, useEffect } from "react";
import type { Deal } from "@/lib/deals";
import DealCard from "./DealCard";
import BrandFilter from "./BrandFilter";
import PriceFilter from "./PriceFilter";

const CATEGORIES = ["headphones", "earbuds", "speakers", "soundbars"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_LABELS: Record<Category, string> = {
  headphones: "Headphones",
  earbuds: "Earbuds",
  speakers: "Speakers",
  soundbars: "Soundbars",
};

const ALLE_CAP = 50;

export default function DealsFilter({ deals }: { deals: Deal[] }) {
  const [activeTab, setActiveTab] = useState<"alle" | Category>("alle");
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 200); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function selectTab(tab: "alle" | Category) {
    setActiveTab(tab);
    setSelectedBrands(new Set());
    setMinPrice("");
    setMaxPrice("");
  }

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  }

  const tabDeals =
    activeTab === "alle"
      ? deals
      : deals.filter((d) => d.category === activeTab);

  const brands = Array.from(new Set(tabDeals.map((d) => d.brand))).sort();

  const brandFiltered =
    selectedBrands.size === 0
      ? tabDeals
      : tabDeals.filter((d) => selectedBrands.has(d.brand));

  const min = minPrice !== "" && !isNaN(Number(minPrice)) ? Number(minPrice) : null;
  const max = maxPrice !== "" && !isNaN(Number(maxPrice)) ? Number(maxPrice) : null;

  const priceFiltered =
    min === null && max === null
      ? brandFiltered
      : brandFiltered.filter((d) => {
          const price = Number(d.current_price);
          if (min !== null && price < min) return false;
          if (max !== null && price > max) return false;
          return true;
        });

  const capActive = activeTab === "alle" && selectedBrands.size === 0 && min === null && max === null;
  const displayed = capActive ? priceFiltered.slice(0, ALLE_CAP) : priceFiltered;

  return (
    <div className="mt-10">
      {scrolled && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg whitespace-nowrap"
        >
          ↑ Filteren · {displayed.length} deals
        </button>
      )}

      {/* Category tabs */}
      <div className="flex flex-wrap gap-x-1 border-b border-gray-200">
        {(["alle", ...CATEGORIES] as const).map((tab) => {
          const isEmpty =
            tab !== "alle" && deals.filter((d) => d.category === tab).length === 0;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => !isEmpty && selectTab(tab)}
              disabled={isEmpty}
              className={`border-b-2 px-4 pb-3 text-sm font-medium transition ${
                isActive
                  ? "border-gray-900 text-gray-900"
                  : isEmpty
                  ? "cursor-not-allowed border-transparent text-gray-300"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab === "alle" ? "Alle" : CATEGORY_LABELS[tab]}
            </button>
          );
        })}
      </div>

      {/* Brand filter */}
      {brands.length > 1 && (
        <div className="mt-6">
          <BrandFilter
            brands={brands}
            selected={selectedBrands}
            onToggle={toggleBrand}
            onClearAll={() => setSelectedBrands(new Set())}
          />
        </div>
      )}

      {/* Price filter */}
      <div className="mt-4">
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
      </div>

      {/* Result count */}
      <p className="mt-6 text-sm text-gray-500">
        {capActive
          ? `${displayed.length} deals getoond`
          : `${priceFiltered.length} ${priceFiltered.length === 1 ? "deal" : "deals"} gevonden`}
      </p>

      {/* Deal grid */}
      {displayed.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600">Geen interessante deals vandaag.</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {displayed.map((deal) => (
              <DealCard key={`${deal.id}-${deal.price_level_since}`} deal={deal} />
            ))}
          </div>
          {capActive && deals.length > ALLE_CAP && (
            <p className="mt-8 text-center text-sm text-gray-400">
              Top {ALLE_CAP} deals getoond — filter op categorie of merk voor meer.
            </p>
          )}
        </>
      )}
    </div>
  );
}
