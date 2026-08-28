# Offline-migratie checklist: techtracker.nl

Doel: (1) database migreren naar lokale dev-Postgres, (2) website lokaal aan die
lokale database koppelen, (3) Railway-server + scheduled scripts offline halen,
(4) Vercel-deployment van techtracker.nl offline halen.

Gebaseerd op een read-only doorlichting van `price-tracker-web` en `product_scraper`
op 2026-08-21. Vink af naarmate je stappen uitvoert.

## Fase 0 — Vooronderzoek (al gedaan, ter info)

- [x] Geen `vercel.json` met `crons` in `price-tracker-web`
- [x] Geen webhook-ontvangende endpoints — beide API routes (`app/api/search`,
      `app/api/search-summary`) worden alleen door de eigen frontend aangeroepen
- [x] Telegram-integratie (`send_alerts.py`) is alleen outbound `sendMessage`,
      geen `setWebhook`/`getUpdates`
- [x] `.env.local` in beide repo's staat in `.gitignore` en is nooit gecommit
- [x] Geen hardcoded secrets gevonden in tracked bestanden

## Fase 0.5 — Case study materialen verzamelen (vóór migratie, terwijl alles nog live is)

De URL zelf komt niet in het portfolio, maar deze bewijsstukken zijn straks
niet meer (makkelijk) te reconstrueren zodra Railway/Vercel weg zijn — dus nu
vastleggen, vóór Fase 1 t/m 4.

Schermopnames (live site, vóór afbreken):
- [x] Homepage
- [X] Semantic search in actie (een paar voorbeeldqueries, inclusief de
      AI cross-result summary)
- [X] Een individueel productdetail met:
  - [X] price history chart — 30/60/90-dagenweergave
  - [X] de blauwe "Prijs inzicht"-kaart (`ai_deal_description`)
  - [X] de "Over dit product"-sectie (`ai_description`)
- [X] Een deal-badge/deal-indicator in de praktijk (categoriepagina of de
      deals-pagina — besparing t.o.v. 30-dagen-hoog)
- [X] "Beste deals per categorie"-overzicht (`/deals`, `DealsFilter`/`DealCard`)
- [X] Mobiele weergave (responsive) kort meenemen

Railway-dashboard screenshots (vóór het project verwijderen in Fase 3):
- [X] Lijst van cron-jobs met hun schedules
- [x] Een paar succesvolle run-logs per script (discover, scrape, alerts)
- [x] Postgres-service metrics/overzicht (grootte, uptime) indien relevant

Vercel-dashboard screenshots (vóór het project verwijderen in Fase 4):
- [X] Deployment-historie

Cijfers/metrics om te noteren (via `scrape_runs`/`products`/`price_history`
tabellen, of Vercel Analytics — nu ophalen terwijl de data nog compleet is):
- [X] Aantal getrackte producten
- [X] Periode waarover dagelijks is gescraped (eerste run → laatste run)
- [X] Aantal verzamelde price_history-datapunten
- [X] Aantal gedetecteerde price drops / verstuurde alerts

Dingen die **niet** urgent zijn (kunnen na migratie, want zitten in de code,
niet in Railway/Vercel):
- Architectuurdiagram / code-walkthrough / design-decisions-uitleg
- Schema- en pipeline-uitleg (staat al in `product_scraper/README.md` en `docs/`)

## Fase 1 — Database migreren naar lokale Postgres

- [x] Lokale Postgres-instantie draaiend hebben (`DB_HOST=localhost` etc.)
- [x] Schema + migraties toepassen via `product_scraper/scripts/refresh_local_db.sh`
      (stap 1: `sql/schema.sql` + alles in `sql/migrations/*.sql`)
- [x] `.env.local` in `product_scraper` vullen met `PROD_READONLY_URL` (Railway
      read-only connectiestring) + lokale `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD`
- [x] `psql` CLI-tools lokaal geïnstalleerd hebben
- [x] Beslist: volledige historie i.p.v. 90/30-dagen subset — `WHERE`-clausules
      in `refresh_local_db.sh` verwijderd voor `price_history`, `price_drops`,
      `scrape_runs` (`retailers`/`products` waren al altijd volledig)
- [x] `bash scripts/refresh_local_db.sh` gedraaid
- [x] Geverifieerd met `sql/checks/refresh_before_after.sql` en
      `sql/checks/refresh_prod_unchanged.sql`
- [x] Eenmalige snapshot vastgelegd — geen herhaalde runs meer nodig vóór Railway
      (fase 3) verdwijnt

## Fase 2 — Website lokaal aan lokale database koppelen

- [x] `price-tracker-web/.env.local`: `DATABASE_URL` naar lokale Postgres-connectiestring
      (let op: `$` in het wachtwoord moet ge-escaped worden als `\$`, anders
      expandeert Next.js' ingebouwde dotenv-expand het als env-var-referentie)
- [x] `OPENAI_API_KEY` blijft nodig (embeddings/semantic search + AI-summary) —
      blijft een externe cloud-dependency, ook lokaal
- [x] Beslist: Upstash Redis weglaten — `KV_REST_API_URL`/`KV_REST_API_TOKEN`
      verwijderd uit `.env.local`; rate-limiting faalt open (unlimited), niets
      breekt. Account-opzegging bij Upstash zelf staat in Fase 6.
- [x] Lokale dev-server herstarten na het aanpassen van `.env.local`
- [x] pgvector-extensie lokaal aanwezig — semantic search getest en werkt

## Fase 3 — Railway (server + cronjobs) offline halen

Scripts uit `product_scraper` (schema per README, exacte schedules staan alleen
in het Railway-dashboard):

| Script | Frequentie | Wat het doet |
|---|---|---|
| `scripts/discover_products.py` | Wekelijks | Crawlt categoriepagina's, upsert `products` |
| `scripts/scrape_price_history.py` | Dagelijks ×2 | Scraped prijs/beschikbaarheid, upsert `price_history`, draait `detect_drops` inline |
| `scripts/scrape_price_history.py --missed-only` | Dagelijkse recovery | Scraped gemiste producten |
| `scripts/detect_drops.py` | Inline (daily run) | Insert in `price_drops` |
| `scripts/send_alerts.py` | Na daily run | Telegram-alerts voor drops |

Niet in de README-tabel — gecheckt in Railway-dashboard, draaien niet als scheduled job:
- [x] `scripts/backfill_ai_deal_descriptions.py`
- [x] `scripts/backfill_ai_descriptions.py`
- [x] `scripts/backfill_embeddings.py`

Afbreken:
- [x] Alle Railway cron-jobs/services geïdentificeerd en genoteerd
- [x] Railway Postgres-service back-up gemaakt (`pg_dump`, geverifieerd met
      `pg_restore -l`) vóór verwijderen
- [x] Railway Postgres-service verwijderd
- [x] Railway-project verwijderd
- [x] `scraper_readonly`-user — leefde alleen binnen de verwijderde Postgres-
      service, dus automatisch mee verdwenen; geen aparte actie nodig
- [x] `TELEGRAM_BOT_TOKEN` geroteerd/revoked via BotFather

## Fase 4 — Vercel-deployment offline halen

- [x] Vercel-project `techtracker.nl` verwijderd (deployment + domain-koppeling)
- [x] Custom domain: bewust aangehouden bij registrar (nog niet opgezegd) —
      check dat DNS niet meer naar Vercel wijst nu het project weg is, anders
      geeft het domein een dode/foutpagina aan bezoekers
- [x] Vercel Analytics — automatisch mee gestopt, geen aparte actie nodig
- [x] Upstash/KV — bleek Vercel's eigen native KV-product, geen los account
      (zie Fase 5/6)

## Fase 5 — Secrets opschonen vóór eventueel publiek maken

- [x] `OPENAI_API_KEY` geroteerd — nieuwe project-scoped key (OpenAI Project
      "techtracker"), oude key ingetrokken, in beide repo's `.env.local` bijgewerkt
      en getest
- [x] `gitleaks detect --source . --log-opts="--all"` gedraaid over de volledige
      git-historie van beide repo's — "no leaks found" in beide
- [x] `TELEGRAM_BOT_TOKEN` roteren/revoken — al gedaan in Fase 3
- [x] `ANTHROPIC_API_KEY` geroteerd — nieuwe workspace-scoped key (Anthropic
      Workspace "techtracker"), oude key ingetrokken, bijgewerkt in
      `product_scraper/.env.local` en getest
- [x] Railway/Postgres-wachtwoorden — ongeldig geworden met de Railway-service
      in Fase 3, geen aparte actie nodig geweest
- [x] Upstash/KV — bleek Vercel's eigen native KV-product (env-vars `KV_*`, geen
      losse Upstash Marketplace-koppeling/account) — automatisch mee verdwenen
      met het Vercel-project in Fase 4, geen los account gevonden om op te ruimen
- [x] `.gitignore` in beide repo's blijft toekomstige `.env*`-varianten afvangen (gecheckt)

## Fase 6 — Losse services / makkelijk te missen punten

- [x] Vercel Analytics — mee opgeruimd met Fase 4
- [x] Upstash Redis — bleek Vercel's eigen native KV-product, geen los account,
      mee verdwenen met Fase 4 (zie Fase 5)
- [x] `scraper_readonly` DB-user — mee verdwenen met de Railway Postgres-service
      in Fase 3, geen aparte actie nodig geweest
- [x] Worker/queue-services — bevestigd: AWS/ECS is nooit daadwerkelijk gebruikt
      voor dit project, de Dockerfile-comment was puur voorbereidend en nooit
      ingezet; niets op te ruimen
- [x] Techtracker Gmail-account verwijderen — check eerst of dit account
      gekoppeld is aan het `techtracker.nl`-domein (bv. Google Workspace/custom
      domain mail); zo ja, eerst gewenste mail exporteren (Google Takeout)
      vóórdat account of domein verwijderd wordt

## Fase 7 — Repo's publiek maken (portfolio)

- [x] Google Analytics-tracking (`gtag`) verwijderd uit
      [app/layout.tsx](../app/layout.tsx) (measurement ID `G-2HCX2P4VY6`) —
      dode code zodra de site alleen lokaal draait
- [x] README's opgeschoond in beide repo's (`price-tracker-web` en
      `product_scraper`) — echte projectbeschrijving, lokale-only
      setup-instructies, Railway/Vercel/Upstash-verwijzingen als levende
      productieomgeving verwijderd, cross-links tussen beide repo's toegevoegd,
      "Built with Claude Code"-sectie toegevoegd, verouderde/overbodige
      secties verwijderd (testdeal-SQL, affiliate-toekomstplannen)
- [x] Git-historie: volledige historie behouden (niet squashen) — laat het
      spec-gedreven ontwikkeltraject zien, AI-assisted development (Claude
      Code) is een vaardigheid om te tonen, niet te verbergen
- [x] Volledige commit-log van beide repo's doorgelopen (`git log --oneline --all`)
      — geen secrets, geen gênante inhoud gevonden; terse messages ("commit",
      "update") laten we bewust staan, hoort bij een authentiek ontwikkeltraject
- [x] Claude Code-gebruik expliciet benoemd in beide READMEs
- [x] Portfolio-tekst ([techtracker.mdx](../../portfolio/src/content/case-studies/techtracker.mdx))
      bijgewerkt: architectuur blijft beschreven zoals hij écht in productie
      draaide (Railway/Vercel/Upstash/Telegram, verleden tijd, incl. de
      betrouwbaarheidscijfers) — niet herschreven naar "draait lokaal". Eén
      korte alinea toegevoegd in de sectie "Van live product naar showcase"
      dat de infrastructuur sindsdien is afgebouwd en het project nu lokaal
      draait als showcase
- [x] `docs/lessons.md` en `prompts/` in beide repo's beoordeeld op publiceerbaarheid
      — gescand op ongemakkelijke/persoonlijke inhoud (`stupid/idiot/hate/@gmail/
      password/token` etc.), niets gevonden. Bewust laten staan: toont technische
      retrospectie en gestructureerde AI-werkwijze, een sterk signaal voor een
      portfolio in plaats van iets om te verbergen
- [x] `docs/offline-migration-checklist.md` (dit bestand) — zelfde afweging,
      zelfde conclusie: bewust laten staan bij publiek maken. Documenteert het
      volledige offline-migratietraject inclusief besluitvorming, en is zelf
      ook bewijs van gestructureerd werken

## Fase 8 — Losse eindjes

- [x] Beslist: domein `techtracker.nl` voorlopig aanhouden (loopt nog zeker
      een half jaar door) — opzeggen is geen actuele actie
- [ ] DNS-instellingen bij mijndomein.nl uiteindelijk terugzetten naar
      standaardwaarden — CNAME naar Vercel is al verwijderd (Fase 4), nog
      checken op resterende MX-records van het opgezegde Google Workspace-
      account (Fase 6) en eventuele andere niet-standaard records voordat
      alles teruggezet wordt

## Fase 9 — Reden-om-online-te-blijven check ✅

Geen enkele reden gevonden om online te blijven:
- Geen inkomende webhooks
- Geen OAuth-callback-URLs naar techtracker.nl of de Railway-URL
- Geen Vercel Cron Jobs
- Geen third-party integratie die de Railway/Vercel-URL kent

Het toenmalige onzekere punt (geen dashboard-toegang voor Railway/Vercel
webhook-instellingen) is inmiddels irrelevant — beide platforms zijn volledig
afgebouwd (Fase 3/4), dus er is niets meer dat een webhook zou kunnen raken.

---

**Aanbevolen volgorde:** Fase 1 → Fase 2 (en testen dat alles werkt) → pas dan
Fase 3 en 4 → Fase 5 wanneer je de repo's publiek wilt maken.
