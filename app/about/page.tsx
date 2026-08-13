import Link from "next/link";

export const metadata = {
  title: "Wij zoeken de beste audio deals voor jou | Over TechTracker",
  description:
    "TechTracker is niet gebonden aan één merk en verkoopt zelf niets. We analyseren dagelijks prijsdata van audioproducten in Nederland en tonen alleen deals die daar echt uit blijken.",
}

export default function AboutPage() {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="max-w-3xl">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900">Wij zoeken de beste audio deals voor jou</h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
          Is die “korting” op je nieuwe koptelefoon of soundbar wel echt?
          TechTracker beantwoordt die vraag met data: we volgen dagelijks de prijzen
          bij Nederlandse webshops en vergelijken ze met de prijsgeschiedenis van de afgelopen 30 dagen.
          </p>

          <p className="mt-6 text-lg leading-8 text-gray-600">
          TechTracker verkoopt zelf niets en is niet gebonden aan één merk,
          dus alleen data bepaalt welke deal je hier ziet.
          </p>

          <p className="mt-6 text-lg leading-8 text-gray-600">
          Benieuwd hoe dat precies werkt?{" "}
          <Link href="/how-it-works" className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700">
            Bekijk hoe TechTracker werkt →
          </Link>
          </p>
        </div>
      </main>
    );
  }
