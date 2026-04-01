import DealCard from "../../components/DealCard";
import { getDealpageDeals } from "../../lib/deals";

{/* pagina wordt elke 60 minuten vernieuwd */}
export const revalidate = 3600 

export const metadata = {
  title: "Beste tech deals van vandaag | TechTracker",
  description:
    "Bekijk de grootste prijsdalingen op premium tech producten in Nederland. Dagelijkse updates.",
}

export default async function DealsPage() {
  const deals = await getDealpageDeals();

  console.log("DealsPage deals:", deals.length, deals);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Grootste prijsdalingen
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Een overzicht van recente deals die door de tracker zijn gedetecteerd.
        </p>
      </div>
        
      {/* 👇 CONDITIONAL RENDERING */}
      {deals.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600">
            Geen interessante deals vandaag.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Wil je automatisch updates ontvangen?{" "} 
            <a
            href="https://t.me/NLHeadphoneDeals"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-black "
          >
            <u><strong>Volg ons op Telegram</strong></u>
          </a>
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {deals.map((deal) => (
            <DealCard
              key={`${deal.id}-${deal.price_level_since}`}
              deal={deal}
            />
          ))}
        </div>
      )}
    </main>
  );
}