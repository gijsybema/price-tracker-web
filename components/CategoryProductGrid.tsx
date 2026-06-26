"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BrandFilter from "./BrandFilter";
import SortSelect, { type SortKey } from "./SortSelect";
import type { Product } from "../lib/products";

function fmt(price: number): string {
  const str = price >= 100 ? price.toFixed(0) : price.toFixed(2);
  return str.replace(".", ",");
}

function ProductCard({ product, category }: { product: Product; category: string }) {
  const hasDiscount =
    product.price_diff !== null &&
    Number(product.price_diff) > 0 &&
    product.drop_percentage !== null;

  const inStock = product.in_stock === true;

  const isDeal =
    product.price_diff !== null &&
    Number(product.price_diff) >= 25 &&
    product.current_price !== null &&
    Number(product.current_price) > 100;

  const borderClass = isDeal ? "border-amber-300" : inStock ? "border-gray-200" : "border-gray-100";

  return (
    <Link
      href={`/${category}/${product.slug}`}
      className={`group flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${borderClass} ${!inStock ? "opacity-60" : ""}`}
    >
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

      <div className="mt-4 flex flex-1 flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {product.brand}
        </p>
        {isDeal && (
          <span className="inline-flex self-start items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            🏷️ Deal
          </span>
        )}
        <h2 className="text-sm font-semibold leading-snug text-gray-900 transition group-hover:text-black">
          {product.name}
        </h2>
      </div>

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

function sortProducts(products: Product[], key: SortKey): Product[] {
  const inStock = products.filter((p) => p.in_stock === true);
  const notInStock = products.filter((p) => p.in_stock !== true);

  function comparator(a: Product, b: Product): number {
    if (key === "discount") {
      const da = a.price_diff !== null ? Number(a.price_diff) : -Infinity;
      const db = b.price_diff !== null ? Number(b.price_diff) : -Infinity;
      return db - da;
    }
    if (key === "price_asc") {
      const pa = a.current_price !== null ? Number(a.current_price) : Infinity;
      const pb = b.current_price !== null ? Number(b.current_price) : Infinity;
      return pa - pb;
    }
    // price_desc
    const pa = a.current_price !== null ? Number(a.current_price) : -Infinity;
    const pb = b.current_price !== null ? Number(b.current_price) : -Infinity;
    return pb - pa;
  }

  return [...inStock.sort(comparator), ...notInStock.sort(comparator)];
}

type Props = {
  products: Product[];
  category: string;
};

export default function CategoryProductGrid({ products, category }: Props) {
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("discount");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 200); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const brands = [...new Set(products.map((p) => p.brand))].sort();

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) {
        next.delete(brand);
      } else {
        next.add(brand);
      }
      return next;
    });
  }

  const brandFiltered =
    selectedBrands.size === 0
      ? products
      : products.filter((p) => selectedBrands.has(p.brand));

  const sorted = sortProducts(brandFiltered, sortKey);

  return (
    <div>
      {scrolled && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg whitespace-nowrap"
        >
          ↑ Filteren · {sorted.length} producten
        </button>
      )}

      <div className="mt-8">
        <BrandFilter
          brands={brands}
          selected={selectedBrands}
          onToggle={toggleBrand}
          onClearAll={() => setSelectedBrands(new Set())}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {selectedBrands.size > 0
            ? `${sorted.length} ${sorted.length === 1 ? "product" : "producten"} gevonden`
            : ""}
        </p>
        <SortSelect value={sortKey} onChange={setSortKey} />
      </div>

      {sorted.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600">Geen producten gevonden.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
