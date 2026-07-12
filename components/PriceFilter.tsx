"use client";

type Props = {
  min: string;
  max: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  onClear: () => void;
};

export default function PriceFilter({ min, max, onMinChange, onMaxChange, onClear }: Props) {
  const active = min !== "" || max !== "";

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-500">€</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Min"
          value={min}
          onChange={(e) => onMinChange(e.target.value)}
          className="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>
      <span className="text-sm text-gray-400">–</span>
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-500">€</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Max"
          value={max}
          onChange={(e) => onMaxChange(e.target.value)}
          className="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>
      {active && (
        <button
          onClick={onClear}
          className="text-sm text-gray-400 transition hover:text-gray-700"
        >
          Wissen
        </button>
      )}
    </div>
  );
}
