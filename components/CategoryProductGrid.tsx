"use client";

import { useState } from "react";
import Link from "next/link";
import BrandFilter from "./BrandFilter";
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

  return (
    <Link
      href={`/${category}/${product.slug}`}
      className={`group flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        inStock ? "border-gray-200" : "border-gray-100 opacity-60"
      }`}
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

type Props = {
  products: Product[];
  category: string;
};

export default function CategoryProductGrid({ products, category }: Props) {
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());

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

  const filtered =
    selectedBrands.size === 0
      ? products
      : products.filter((p) => selectedBrands.has(p.brand));

  return (
    <div>
      <div className="mt-8">
        <BrandFilter
          brands={brands}
          selected={selectedBrands}
          onToggle={toggleBrand}
          onClearAll={() => setSelectedBrands(new Set())}
        />
        {selectedBrands.size > 0 && (
          <p className="mt-3 text-sm text-gray-500">
            {filtered.length} {filtered.length === 1 ? "product" : "producten"} gevonden
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600">Geen producten gevonden.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
