This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Local Development Setup

Before running the dev server, create a `.env.local` file in the project root with the database connection string:

```bash
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
```

This file is gitignored and must be created manually. Use the production read-only connection string (ask a team member) or point it at a local Postgres instance seeded with the schema from `docs/spec.md`.

The app will fail to fetch any data without this variable set.

### AI semantic search (`OPENAI_API_KEY`)

The homepage "Zoek met AI" feature calls the OpenAI API to embed search queries. Add your key to `.env.local` alongside `DATABASE_URL`:

```bash
OPENAI_API_KEY=sk-...
```

**Next.js only reads `.env.local` when the dev server starts** — if you add or change `OPENAI_API_KEY` while `npm run dev` is already running, stop it (Ctrl+C) and start it again. Otherwise the search will fail with a generic "Er is iets misgegaan" error.

**If you're on a machine with Norton (or similar antivirus doing HTTPS interception):** the dev server may fail to reach `api.openai.com` with a TLS error (`UNABLE_TO_VERIFY_LEAF_SIGNATURE` / "unable to verify the first certificate"), even though `DATABASE_URL`-backed pages work fine. This happens because Norton re-signs outbound HTTPS traffic with its own local root CA, which Node doesn't trust by default. Fix by pointing Node at Norton's CA bundle before starting the dev server — the exact command depends on your shell:

**PowerShell** (default on Windows; set `$env:`, not `set` — `set` is a different command in PowerShell and won't work):
```powershell
# one-off, current window only — must run in the same window as npm run dev
$env:NODE_EXTRA_CA_CERTS = "C:\ProgramData\Norton\Antivirus\wscert.pem"
npm run dev
```
Or set it permanently for your user account (affects new terminal windows only, run once):
```powershell
[Environment]::SetEnvironmentVariable("NODE_EXTRA_CA_CERTS", "C:\ProgramData\Norton\Antivirus\wscert.pem", "User")
```

**cmd.exe:**
```cmd
set NODE_EXTRA_CA_CERTS=C:\ProgramData\Norton\Antivirus\wscert.pem
npm run dev
```
Or permanently: `setx NODE_EXTRA_CA_CERTS "C:\ProgramData\Norton\Antivirus\wscert.pem"` (new terminals only).

**Git Bash / WSL:**
```bash
export NODE_EXTRA_CA_CERTS="C:\ProgramData\Norton\Antivirus\wscert.pem"
npm run dev
```

Either way, the variable must be set in the **same terminal session**, **before** `npm run dev` starts — a permanent/`setx` change only takes effect in terminals opened *after* you set it, not the one you're currently using.

This is a local-dev-only workaround — production deployments (Vercel, Railway, etc.) don't sit behind Norton and are unaffected.

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
