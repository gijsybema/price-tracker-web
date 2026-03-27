import Link from "next/link";
import DealCard from "../components/DealCard";
import { getHomepageDeals } from "../lib/deals";

export const revalidate = 3600;

export default async function Home() {
  const deals = await getHomepageDeals();

  return (
    <main>
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/80">
              Nederlandse premium headphone deal tracker
            </p>

            <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
              Prijsdalingen voor premium headphones
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Ik track dagelijks prijzen van premium headphones in Nederland en
              laat alleen deals zien die echt interessant zijn. Gericht op
              premium headphones, echte prijsdrops en producten die op voorraad zijn.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/deals"
                className="rounded-xl bg-white px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-100"
              >
                Bekijk deals
              </Link>

              <a
                href="https://t.me/NLHeadphoneDeals"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-medium text-white transition hover:bg-white/15"
              >
                Volg op Telegram
              </a>
            </div>
          </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3"> 
          <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm"> 
            <p className="text-sm text-slate-300">Focus</p> 
            <p className="mt-2 text-2xl font-semibold">Premium headphones</p> 
          </div> 
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm"> 
              <p className="text-sm text-slate-300">Detectie</p> 
              <p className="mt-2 text-2xl font-semibold">Dagelijkse prijschecks</p> 
            </div> 
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm"> 
              <p className="text-sm text-slate-300">Filter</p> 
              <p className="mt-2 text-2xl font-semibold">Alleen grote prijsdalingen</p> 
            </div> 
          </div> 
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Beste deals op dit moment
            </h2>
            <p className="mt-3 text-gray-600">
              De 3 sterkste actuele prijsdalingen op basis van de hoogste prijs in de afgelopen 30 dagen.
            </p>
          </div>

          <Link href="/deals" className="text-sm font-medium text-black underline">
            Bekijk alle deals
          </Link>
        </div>

        {deals.length === 0 ? (
          <div className="mt-10 rounded-2xl border bg-white p-8 text-center shadow-sm">
            <p className="text-lg text-gray-600">Geen interessante deals vandaag.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {deals.map((deal) => (
              <DealCard
                key={`${deal.id}-${deal.price_level_since}`}
                deal={deal}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}