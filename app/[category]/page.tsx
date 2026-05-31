import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductsByCategory, type Product } from "../../lib/products";

export const revalidate = 300;

const VALID_CATEGORIES = ["headphones", "earbuds", "speakers", "soundbars"] as const;
type Category = (typeof VALID_CATEGORIES)[number];

const CATEGORY_LABELS: Record<Category, string> = {
  headphones: "Koptelefoons",
  earbuds: "Oordopjes",
  speakers: "Speakers",
  soundbars: "Soundbars",
};

function fmt(price: number): string {
  const str = price >= 100 ? price.toFixed(0) : price.toFixed(2);
  return str.replace(".", ",");
}

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  if (!VALID_CATEGORIES.includes(category as Category)) return {};
  const label = CATEGORY_LABELS[category as Category];
  return {
    title: `${label} — prijzen & deals | TechTracker`,
    description: `Bekijk alle ${label.toLowerCase()} die TechTracker volgt. Vergelijk prijzen en ontdek de beste deals.`,
  };
}

function ProductCard({ product, category }: { product: Product; category: string }) {
  const hasDiscount =
    product.price_diff !== null &&
    Number(product.price_diff) > 0 &&
    product.drop_percentage !== null;

  const inStock = product.in_stock === true;

  return (
    <Link
      href={`/${category}/${product.slug}`}
      className={`group flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        inStock ? "border-gray-200" : "border-gray-100 opacity-60"
      }`}
    >
      {/* Image */}
      <div className="flex h-40 items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="max-h-36 w-auto max-w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="flex h-36 w-full items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-400">
            Geen afbeelding
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 flex flex-1 flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {product.brand}
        </p>
        <h2 className="text-sm font-semibold leading-snug text-gray-900 transition group-hover:text-black">
          {product.name}
        </h2>
      </div>

      {/* Price row */}
      <div className="mt-4">
        {product.current_price !== null ? (
          <div className="flex flex-wrap items-end gap-2">
            <span className="text-xl font-bold text-gray-900">
              €{fmt(Number(product.current_price))}
            </span>
            {hasDiscount && (
              <>
                <span className="text-base text-gray-400 line-through">
                  €{fmt(Number(product.high_30d))}
                </span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                  -{Number(product.drop_percentage).toFixed(1).replace(".", ",")}%
                </span>
              </>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-400">Prijs onbekend</span>
        )}

        {product.in_stock !== null && (
          <p
            className={`mt-1 text-xs font-medium ${
              inStock ? "text-green-600" : "text-red-500"
            }`}
          >
            {inStock ? "✓ Op voorraad" : "✕ Niet op voorraad"}
          </p>
        )}
      </div>
    </Link>
  );
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  if (!VALID_CATEGORIES.includes(category as Category)) {
    notFound();
  }

  const products = await getProductsByCategory(category);

  // In-stock first, then out-of-stock; within each group sort by name (already from DB)
  const sorted = [
    ...products.filter((p) => p.in_stock === true),
    ...products.filter((p) => p.in_stock !== true),
  ];

  const label = CATEGORY_LABELS[category as Category];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">{label}</h1>
        <p className="mt-3 text-gray-600">
          {products.length} producten gevolgd door TechTracker.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600">Geen producten gevonden.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} category={category} />
          ))}
        </div>
      )}
    </main>
  );
}
