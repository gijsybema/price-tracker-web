"use client";

import { ExternalLink } from "lucide-react";

type Props = {
  href: string;
  productName: string;
  price: number | null;
  productId: number | string;
};

export default function AffiliateLink({ href, productName, price, productId }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        window.gtag?.("event", "click_deal", {
          product_name: productName,
          price,
          deal_id: productId,
        });
      }}
      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
    >
      Bekijk bij Coolblue
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}
