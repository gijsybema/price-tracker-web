# TechTracker

TechTracker tracks daily prices for premium audio products (headphones, earbuds,
speakers, soundbars) sold via Coolblue. 
Built with Next.js and a Postgres backend, with an AI-powered semantic search feature on top.

Price data is collected by a separate scraping pipeline — see
[`product_scraper`](https://github.com/gijsybema/product_scraper) for the
scraper, schema, and drop-detection logic this app reads from.

A full write-up (architecture, decisions, screenshots) is on my portfolio site.

## Features

- Daily price history per product, with 30/60/90-day charts
- Deal detection — savings shown against a 30-day price high
- AI semantic search ("Zoek met AI") — natural-language product search backed
  by OpenAI embeddings + pgvector, with an AI-generated cross-result summary
- AI-generated product descriptions and "prijs inzicht" deal explanations

## Tech stack

Next.js (App Router) · TypeScript · PostgreSQL + pgvector · OpenAI API · Tailwind CSS

## Local development setup

This app reads from a local Postgres database seeded from
[`product_scraper`](https://github.com/gijsybema/product_scraper) — see that
repo's README for how to set up and refresh the local database
(`scripts/refresh_local_db.sh`).

### Environment variables

Create a `.env.local` file in the project root:

```bash
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<database>
OPENAI_API_KEY=sk-...
```

`DATABASE_URL` should point at your local Postgres instance (with the
pgvector extension enabled). `OPENAI_API_KEY` powers the semantic search
embeddings and the AI cross-result summary.

**Next.js only reads `.env.local` when the dev server starts** — if you add
or change either variable while `npm run dev` is already running, stop it
(Ctrl+C) and start it again.

**If you're on a machine with Norton (or similar antivirus doing HTTPS
interception):** the dev server may fail to reach `api.openai.com` with a TLS
error (`UNABLE_TO_VERIFY_LEAF_SIGNATURE` / "unable to verify the first
certificate"), even though `DATABASE_URL`-backed pages work fine. This
happens because Norton re-signs outbound HTTPS traffic with its own local
root CA, which Node doesn't trust by default. Fix by pointing Node at
Norton's CA bundle before starting the dev server — the exact command
depends on your shell:

**PowerShell** (default on Windows; set `$env:`, not `set` — `set` is a
different command in PowerShell and won't work):
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

Either way, the variable must be set in the **same terminal session**,
**before** `npm run dev` starts — a permanent/`setx` change only takes effect
in terminals opened *after* you set it, not the one you're currently using.

### Running

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Built with Claude Code

This project was built working with [Claude Code](https://claude.com/claude-code)
as a pair-programming tool — spec-driven, task by task, with review at each
step. Commit history reflects that process.
