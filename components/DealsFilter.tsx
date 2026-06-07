"use client";

import { useState } from "react";
import type { Deal } from "@/lib/deals";
import DealCard from "./DealCard";
import BrandFilter from "./BrandFilter";

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

  function selectTab(tab: "alle" | Category) {
    setActiveTab(tab);
    setSelectedBrands(new Set());
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

  const capActive = activeTab === "alle" && selectedBrands.size === 0;
  const displayed = capActive ? brandFiltered.slice(0, ALLE_CAP) : brandFiltered;

  return (
    <div className="mt-10">
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

      {/* Result count — shown when a filter is active */}
      {(activeTab !== "alle" || selectedBrands.size > 0) && (
        <p className="mt-6 text-sm text-gray-500">
          {displayed.length} {displayed.length === 1 ? "deal" : "deals"} gevonden
        </p>
      )}

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
