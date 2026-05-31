import { notFound } from "next/navigation";
import { getProductsByCategory } from "../../lib/products";
import CategoryProductGrid from "../../components/CategoryProductGrid";

export const revalidate = 300;

const VALID_CATEGORIES = ["headphones", "earbuds", "speakers", "soundbars"] as const;
type Category = (typeof VALID_CATEGORIES)[number];

const CATEGORY_LABELS: Record<Category, string> = {
  headphones: "Koptelefoons",
  earbuds: "Oordopjes",
  speakers: "Speakers",
  soundbars: "Soundbars",
};

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

      <CategoryProductGrid products={sorted} category={category} />
    </main>
  );
}
