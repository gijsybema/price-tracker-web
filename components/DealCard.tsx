import type { Deal } from "../lib/deals";

export default function DealCard({ deal }: { deal: Deal }) {
  return (
    <article className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="mt-1 text-xl font-semibold text-gray-900">
            {deal.name}
          </h2>
        </div>

        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
          -{Number(deal.price_drop_pct).toFixed(1)}%
        </span>
      </div>

      <div className="mt-6 flex items-end gap-3">
        <span className="text-3xl font-bold text-gray-900">
          €{Number(deal.current_price).toFixed(0)}
        </span>
        <span className="text-lg text-gray-400 line-through">
          €{Number(deal.previous_price).toFixed(0)}
        </span>
      </div>

      <p className="mt-3 text-sm text-gray-600">
      Besparing: €{Number(deal.price_diff).toFixed(0)}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        Gedetecteerd op {deal.detected_at.slice(0, 10)}
      </p>

      <a
        href={deal.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Bekijk product
      </a>
    </article>
  );
}