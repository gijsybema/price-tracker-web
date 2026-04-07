import Link from "next/link";
import DealCard from "../components/DealCard";
import { getHomepageDeals } from "../lib/deals";

export const revalidate = 300;

export const metadata = {
  title: "Beste headphone deals in Nederland | TechTracker",
  description:
    "Ontdek de beste headphone deals in Nederland. TechTracker volgt dagelijks prijzen van premium koptelefoons en laat de grootste prijsdalingen zien.",
};

export default async function Home() {
  const { deals, error } = await getHomepageDeals();

  return (
    <main>
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-16">
          <div className="max-w-3xl">
            <p className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/80">
            Dagelijks bijgewerkte headphone deals in Nederland
            </p>

            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Echte prijsdalingen op premium headphones
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              TechTracker volgt dagelijks prijzen van koptelefoons 
              bij Nederlandse webshops. We tonen alleen echte prijsdalingen. 
              Gericht op premium modellen van bekende merken. 
            </p>

            <ul className="mt-8 grid gap-3 text-sm text-white/90 md:grid-cols-3 md:text-base">
            <li>✓ Alleen echte prijsdalingen</li>
            <li>✓ Gebaseerd op historische prijsdata</li>
            <li>✓ Dagelijkse updates</li>
            </ul>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/deals"
                className="rounded-xl bg-white px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-100"
              >
                Bekijk de beste deals
              </Link>

            </div>
          </div>

        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              De 3 beste headphone deals op dit moment
            </h2>
            <p className="mt-3 text-gray-600">
              De 3 sterkste actuele prijsdalingen op basis van de hoogste prijs
              in de afgelopen 30 dagen.
            </p>
          </div>

          <Link
            href="/deals"
            className="text-sm font-medium text-black underline"
          >
            Bekijk alle deals
          </Link>
        </div>

        {error ? (
          <div className="mt-10 rounded-2xl border bg-white p-8 text-center shadow-sm">
            <p className="text-lg text-gray-600">
              Deals zijn tijdelijk niet beschikbaar.
            </p>
          </div>
        ) : deals.length === 0 ? (
          <div className="mt-10 rounded-2xl border bg-white p-8 text-center shadow-sm">
            <p className="text-lg text-gray-600">
              Er zijn momenteel geen deals.
            </p>
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

      <section className="bg-slate-700 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight">
              Waarom TechTracker
            </h2>
            <p className="mt-3 text-slate-300">
              Een selectie van premium headphone deals, gebaseerd op dagelijkse prijscontroles en relevante prijsbewegingen.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-slate-300">Selectie</p>
              <p className="mt-2 text-2xl font-semibold">
                Gericht op premium koptelefoons
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-slate-300">Prijsdata</p>
              <p className="mt-2 text-2xl font-semibold">
                Dagelijks gecontroleerde prijzen
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-slate-300">Relevantie</p>
              <p className="mt-2 text-2xl font-semibold">
                Alleen opvallende prijsdalingen
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-300">
              Wat wij bewust niet tonen
            </h2>

            <ul className="mt-4 space-y-3 text-sm text-slate-300 md:text-base">
              <li>✕ Nepkortingen met misleidende van/voor-prijzen</li>
              <li>✕ Kleine prijsdalingen die nauwelijks verschil maken</li>
              <li>✕ Oude deals die niet meer relevant zijn</li>
              <li>✕ Vergelijkingen met adviesprijzen</li>
            </ul>
            <p className="mt-5 text-sm font-medium text-slate-300 md:text-base">
            Je ziet hier alleen prijsdalingen die écht de moeite waard zijn.
            </p>
          </div>
        </div>
          
        </div>
      </section>

    </main>
  );
}