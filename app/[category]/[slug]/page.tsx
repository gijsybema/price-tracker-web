import { notFound } from "next/navigation";
import Link from "next/link";
import { Lightbulb, Sparkles, ExternalLink } from "lucide-react";
import { getProductBySlug, getPriceHistory } from "../../../lib/products";
import PriceHistoryChart from "../../../components/PriceHistoryChart";
import SpecsTable from "../../../components/SpecsTable";

export const revalidate = 300;

function fmt(price: number): string {
  const str = price >= 100 ? price.toFixed(0) : price.toFixed(2);
  return str.replace(".", ",");
}

function fmtPct(pct: number): string {
  return pct.toFixed(1).replace(".", ",");
}

type Props = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { category, slug } = await params;
  const product = await getProductBySlug(category, slug);
  if (!product) return {};

  const hasDeal =
    product.drop_percentage !== null &&
    product.drop_percentage >= 10 &&
    product.current_price !== null &&
    product.high_30d !== null;

  const description = hasDeal
    ? `${product.name} nu ${Math.round(Number(product.drop_percentage))}% goedkoper bij Coolblue — van €${fmt(Number(product.high_30d))} voor €${fmt(Number(product.current_price))}. Bekijk de prijsgeschiedenis en ontdek het beste aankoopmoment.`
    : `${product.name} prijs vandaag: €${fmt(Number(product.current_price ?? 0))} bij Coolblue. Bekijk de prijsgeschiedenis en ontdek het beste aankoopmoment.`;

  return {
    title: `${product.name} | TechTracker`,
    description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { category, slug } = await params;
  const product = await getProductBySlug(category, slug);

  if (!product) {
    notFound();
  }

  const history = await getPriceHistory(product.id, 90);

  const hasDiscount =
    product.high_30d !== null &&
    product.current_price !== null &&
    product.price_diff !== null &&
    product.price_diff > 0;

  const isDeal =
    product.price_diff !== null &&
    Number(product.price_diff) >= 25 &&
    product.current_price !== null &&
    Number(product.current_price) > 100;

  // Guard against empty/whitespace-only AI copy, not just null
  const dealInsight = product.ai_deal_description?.trim();
  const aboutText = product.ai_description?.trim();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-8">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="max-h-72 w-auto object-contain"
            />
          ) : (
            <div className="flex h-72 items-center justify-center text-gray-400">
              Geen afbeelding
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            {product.brand}
          </p>
          {product.active && isDeal && (
            <span className="inline-flex self-start items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              🏷️ Deal
            </span>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {product.name}
          </h1>

          {/* Price — hidden for inactive products (last known price is stale/misleading) */}
          {product.active && (
            <>
              <div className="mt-2 flex items-end gap-3">
                {product.current_price !== null && (
                  <span className="text-4xl font-bold text-gray-900">
                    €{fmt(Number(product.current_price))}
                  </span>
                )}
                {hasDiscount && (
                  <div className="flex flex-col items-start">
                    <span className="text-xl text-gray-400 line-through">
                      €{fmt(Number(product.high_30d))}
                    </span>
                    <span className="text-xs text-gray-400">30-daagse hoogste prijs</span>
                  </div>
                )}
              </div>

              {hasDiscount && (
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-green-100 px-5 py-2 font-semibold text-green-700">
                  <span className="text-xl">Bespaar €{fmt(Number(product.price_diff))}</span>
                  {product.drop_percentage !== null && (
                    <span className="text-base">({fmtPct(Number(product.drop_percentage))}% korting)</span>
                  )}
                </div>
              )}
            </>
          )}

          {product.active ? (
            <>
              {/* In-stock indicator */}
              {product.in_stock !== null && (
                <p
                  className={`text-sm font-medium ${
                    product.in_stock ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {product.in_stock ? "✓ Op voorraad" : "✕ Niet op voorraad"}
                </p>
              )}

              {/* AI deal description — only when in stock */}
              {dealInsight && product.in_stock && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-3">
                  <div className="mb-1 flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    <span className="text-sm font-semibold text-blue-800">Prijs inzicht</span>
                    <span className="ml-auto inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      <Sparkles className="h-3 w-3" aria-hidden="true" />AI
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-blue-900">{dealInsight}</p>
                </div>
              )}

              {/* Affiliate CTA */}
              <div className="mt-4">
                <a
                  href={product.product_url.startsWith("https://") ? product.product_url : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Bekijk bij Coolblue
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">
                Niet meer beschikbaar
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Dit product wordt niet meer verkocht bij Coolblue.
              </p>
              <Link
                href={`/${category}`}
                className="mt-3 inline-block text-sm font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900"
              >
                Bekijk vergelijkbare producten →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* AI product description */}
      {aboutText && (
        <section className="mt-12">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="mb-1.5 text-base font-semibold text-gray-900">Over dit product</h2>
            <p className="text-sm leading-relaxed text-gray-600">{aboutText}</p>
          </div>
        </section>
      )}

      {/* Price history */}
      {history.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900">Prijsgeschiedenis</h2>
          <PriceHistoryChart data={history} />
        </section>
      )}

      {/* Specs */}
      <SpecsTable category={category} specs={product.specs} />
    </main>
  );
}
