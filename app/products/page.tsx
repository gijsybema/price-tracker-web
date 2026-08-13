import { getCategorySummaries } from "../../lib/products";
import CategoryCard from "../../components/CategoryCard";
import { CATEGORY_SLUGS, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS } from "../../lib/categories";

export const revalidate = 300;

export const metadata = {
  title: "Audioproducten per categorie | TechTracker",
  description:
    "Koptelefoons, earbuds, speakers en soundbars — met prijsgeschiedenis en actuele deals per categorie.",
};

export default async function ProductsPage() {
  const summaries = await getCategorySummaries();

  const summaryMap = Object.fromEntries(summaries.map((s) => [s.category, s]));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Audioproducten per categorie</h1>
        <p className="mt-3 text-gray-600">
          Koptelefoons, earbuds, speakers en soundbars — met prijsgeschiedenis en actuele deals per categorie.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {CATEGORY_SLUGS.map((slug) => {
          const summary = summaryMap[slug];
          return (
            <CategoryCard
              key={slug}
              category={slug}
              label={CATEGORY_LABELS[slug]}
              description={CATEGORY_DESCRIPTIONS[slug]}
              product_count={summary?.product_count ?? 0}
              deal_count={summary?.deal_count ?? 0}
              image_url={summary?.image_url ?? null}
            />
          );
        })}
      </div>
    </main>
  );
}
