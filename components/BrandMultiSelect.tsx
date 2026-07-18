"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  brands: string[];
  selected: Set<string>;
  onToggle: (brand: string) => void;
  onClearAll: () => void;
};

export default function BrandMultiSelect({ brands, selected, onToggle, onClearAll }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (brands.length === 0) return null;

  const label = selected.size === 0 ? "Alle merken" : `Merken (${selected.size})`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 transition hover:border-gray-400"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{label}</span>
        <span className={`text-gray-400 transition ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div
          className="absolute left-0 z-20 mt-1 max-h-72 w-56 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
          role="listbox"
        >
          <button
            type="button"
            onClick={onClearAll}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
          >
            <span className={`flex h-4 w-4 items-center justify-center rounded border ${selected.size === 0 ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300"}`}>
              {selected.size === 0 ? "✓" : ""}
            </span>
            Alle merken
          </button>
          {brands.map((brand) => {
            const active = selected.has(brand);
            return (
              <button
                key={brand}
                type="button"
                onClick={() => onToggle(brand)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                role="option"
                aria-selected={active}
              >
                <span className={`flex h-4 w-4 items-center justify-center rounded border text-xs ${active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300"}`}>
                  {active ? "✓" : ""}
                </span>
                {brand}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
