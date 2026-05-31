"use client";

type Props = {
  brands: string[];
  selected: Set<string>;
  onToggle: (brand: string) => void;
  onClearAll: () => void;
};

export default function BrandFilter({ brands, selected, onToggle, onClearAll }: Props) {
  if (brands.length === 0) return null;

  const allActive = selected.size === 0 || selected.size === brands.length;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onClearAll}
        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
          allActive
            ? "border-gray-900 bg-gray-900 text-white"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900"
        }`}
      >
        Alle
      </button>
      {brands.map((brand) => {
        const active = selected.has(brand);
        return (
          <button
            key={brand}
            onClick={() => onToggle(brand)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              active
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900"
            }`}
          >
            {brand}
          </button>
        );
      })}
    </div>
  );
}
