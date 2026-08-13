import { notFound } from "next/navigation";
import { getProductsByCategory } from "../../lib/products";
import CategoryProductGrid from "../../components/CategoryProductGrid";
import { CATEGORY_SLUGS, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, type CategorySlug as Category } from "../../lib/categories";

export const revalidate = 300;

const VALID_CATEGORIES = CATEGORY_SLUGS;

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

  const label = CATEGORY_LABELS[category as Category];
  const description = CATEGORY_DESCRIPTIONS[category as Category];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">{label}</h1>
        <p className="mt-3 text-gray-600">
          {description} TechTracker volgt {products.length} producten in deze categorie.
        </p>
      </div>

      <CategoryProductGrid products={products} category={category} />
    </main>
  );
}
