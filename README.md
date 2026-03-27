This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
cd "C:\Users\gijsy\Documents\Github projects\price-tracker-web"
```

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

or 
```bash
npx next dev --webpack
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Testdeal om logica te checken
```sql
--1. Voeg nieuw test product met grote daling toe
WITH new_product AS (
  INSERT INTO products (name, sku, brand, product_url)
  VALUES (
    'TEST DEAL - EXTREME DROP',
	'999',
	'TEST',
    'https://example.com/test-extreme-drop'
  )
  RETURNING id
)
INSERT INTO price_history (product_id, price, scraped_at, availability)
SELECT id, 400, CURRENT_DATE - INTERVAL '1 day', TRUE
FROM new_product
UNION ALL
SELECT id, 150, CURRENT_DATE, TRUE
FROM new_product;

-- Verwijder rijen van testproduct
-- 2a. Verwijder test uit price_history
DELETE FROM price_history
WHERE product_id IN (
  SELECT id FROM products
  WHERE sku = '999'
);

-- 2b. Verwijder test uit product
DELETE FROM products
WHERE sku = '999';
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
