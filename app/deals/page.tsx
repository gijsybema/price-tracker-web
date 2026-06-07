import DealsFilter from "../../components/DealsFilter";
import { getAllDeals } from "../../lib/deals";

export const revalidate = 300;

export const metadata = {
  title: "Beste audio deals van vandaag | TechTracker",
  description:
    "Ontdek de grootste prijsdalingen op premium audioproducten in Nederland. Dagelijkse updates van echte deals.",
};

export default async function DealsPage() {
  const { deals, error } = await getAllDeals();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Grootste prijsdalingen van audioproducten
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Een overzicht van recente deals die door TechTracker zijn gedetecteerd.
          TechTracker verkoopt zelf geen producten. Je wordt doorgestuurd naar de webshop.
        </p>
      </div>

      {error ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600">
            Deals zijn tijdelijk niet beschikbaar.
          </p>
        </div>
      ) : (
        <DealsFilter deals={deals} />
      )}
    </main>
  );
}
