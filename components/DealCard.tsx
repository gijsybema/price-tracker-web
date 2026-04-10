"use client";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

import type { Deal } from "../lib/deals";

function formatDateNL(dateString: string) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function DealCard({ deal }: { deal: Deal }) {
  const isBigSaving = Number(deal.price_diff) >= 75;

  return (
    <a
      href={deal.product_url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        window.gtag?.("event", "click_deal", {
          product_name: deal.name,
          price: deal.current_price,
          deal_id: deal.id,
        });
      }}
      className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex gap-5">
        {/* Image left */}
        {deal.image_url && (
          <div className="flex w-24 shrink-0 items-start justify-center pt-1 sm:w-28">
            <img
              src={deal.image_url}
              alt={deal.name}
              className="max-h-24 w-auto max-w-full object-contain sm:max-h-28"
              loading="lazy"
            />
          </div>
        )}

        {/* Content right */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {isBigSaving && (
                <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
                  🔥 Grote besparing
                </p>
              )}

              <h2 className="mt-2 text-lg font-semibold text-gray-900 transition group-hover:text-black">
                {deal.name}
              </h2>
            </div>

            <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
              -{Number(deal.price_drop_pct).toFixed(1)}%
            </span>
          </div>

          <div className="mt-5 rounded-xl bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-800">Bespaar</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">
              €{Number(deal.price_diff).toFixed(0)}
            </p>
            <p className="mt-2 text-sm text-blue-800">
              ten opzichte van de hoogste prijs in de afgelopen 30 dagen
            </p>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="text-3xl font-bold text-gray-900">
              €{Number(deal.current_price).toFixed(0)}
            </span>
            <span className="text-lg text-gray-400 line-through">
              €{Number(deal.previous_price).toFixed(0)}
            </span>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Prijs op dit niveau sinds {formatDateNL(deal.price_level_since)}
          </p>

          <div className="mt-5 inline-flex items-center text-sm font-medium text-black">
            Bekijk product op Coolblue
            <span className="ml-1 transition group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>
    </a>
  );
}