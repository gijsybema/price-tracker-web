import Link from "next/link";
import { ExternalLink } from "lucide-react";
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
  const pct = Number(deal.price_drop_pct).toLocaleString("nl-NL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Bovenste deel */}
      <div className="flex items-start gap-4">
        {/* Image linksboven */}
        {deal.image_url && (
          <div className="flex w-20 shrink-0 items-start justify-center sm:w-24">
            <img
              src={deal.image_url}
              alt={deal.name}
              className="max-h-20 w-auto max-w-full object-contain sm:max-h-24"
              loading="lazy"
            />
          </div>
        )}

        {/* Rechtsboven: naam */}
        <div className="min-w-0 flex-1">
          {isBigSaving && (
            <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
              🔥 Grote besparing
            </p>
          )}

          <h2 className="mt-2 text-lg font-semibold leading-snug text-gray-900">
            {deal.name}
          </h2>
        </div>
      </div>

      {/* Onderste deel: altijd onderaan */}
      <div className="mt-auto pt-6">
        <div className="flex items-end gap-3">
          <span className="text-2xl font-bold text-gray-900">
            €{Number(deal.current_price).toFixed(0)}
          </span>
          <span className="text-lg text-gray-400 line-through">
            €{Number(deal.previous_price).toFixed(0)}
          </span>
        </div>

        <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
          Bespaar €{Number(deal.price_diff).toFixed(0)} ({pct}% korting)
        </span>

        <p className="mt-2 text-xs text-gray-400">
          t.o.v. hoogste prijs afgelopen 30 dagen
        </p>

        <p className="mt-3 text-sm text-gray-500">
          Prijs op dit niveau sinds {formatDateNL(deal.price_level_since)}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <a
            href={deal.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Bekijk bij Coolblue
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>

          {deal.category && (
            <Link
              href={`/${deal.category}/${deal.slug}`}
              className="text-center text-sm font-medium text-gray-500 underline underline-offset-2 hover:text-gray-700"
            >
              Bekijk productinfo
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}