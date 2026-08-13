import Link from "next/link";

type Props = {
  category: string;
  label: string;
  description?: string;
  product_count: number;
  deal_count: number;
  image_url: string | null;
  headingLevel?: "h2" | "h3";
};

export default function CategoryCard({ category, label, description, product_count, deal_count, image_url, headingLevel = "h2" }: Props) {
  const Heading = headingLevel;
  return (
    <Link
      href={`/${category}`}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex flex-col items-start gap-2">
        <Heading className="text-2xl font-bold tracking-tight text-gray-900 transition group-hover:text-black">
          {label}
        </Heading>
        {description && <p className="text-sm text-gray-600">{description}</p>}
        <p className="text-sm text-gray-500">{product_count} producten</p>
        {deal_count > 0 && (
          <span className="inline-flex self-start items-center gap-1 whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            🏷️ {deal_count} {deal_count === 1 ? "deal" : "deals"}
          </span>
        )}
        <p className="mt-2 text-sm font-medium text-gray-400 transition group-hover:text-gray-700">
          Bekijk alle →
        </p>
      </div>

      <div className="flex h-28 w-28 shrink-0 items-center justify-center">
        {image_url ? (
          <img
            src={image_url}
            alt={label}
            className="max-h-28 w-auto max-w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="h-28 w-28 rounded-xl bg-gray-50" />
        )}
      </div>
    </Link>
  );
}
