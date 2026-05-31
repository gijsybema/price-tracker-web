import { getCategorySummaries } from "../../lib/products";
import CategoryCard from "../../components/CategoryCard";

export const revalidate = 300;

export const metadata = {
  title: "Alle productcategorieën | TechTracker",
  description:
    "Bekijk alle audioproducten die TechTracker volgt: koptelefoons, oordopjes, speakers en soundbars. Vergelijk prijzen en ontdek de beste deals.",
};

const CATEGORIES = [
  { slug: "headphones", label: "Koptelefoons" },
  { slug: "earbuds",    label: "Oordopjes" },
  { slug: "speakers",   label: "Speakers" },
  { slug: "soundbars",  label: "Soundbars" },
] as const;

export default async function ProductsPage() {
  const summaries = await getCategorySummaries();

  const summaryMap = Object.fromEntries(summaries.map((s) => [s.category, s]));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Producten</h1>
        <p className="mt-3 text-gray-600">
          Kies een categorie om alle producten te bekijken die TechTracker volgt.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {CATEGORIES.map(({ slug, label }) => {
          const summary = summaryMap[slug];
          return (
            <CategoryCard
              key={slug}
              category={slug}
              label={label}
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
