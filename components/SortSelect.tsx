"use client";

export type SortKey = "discount" | "price_asc" | "price_desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "discount", label: "Grootste korting" },
  { value: "price_asc", label: "Prijs: laag → hoog" },
  { value: "price_desc", label: "Prijs: hoog → laag" },
];

type Props = {
  value: SortKey;
  onChange: (value: SortKey) => void;
};

export default function SortSelect({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm text-gray-600 whitespace-nowrap">
        Sorteren:
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
