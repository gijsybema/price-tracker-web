export const metadata = {
  title: "Hoe TechTracker werkt | Alleen echte prijsdalingen op audioproducten",
  description:
    "Ontdek hoe TechTracker prijsdata analyseert en alleen echte deals op audioproducten toont. Transparante prijsvergelijking.",
}

export default function HowItWorksPage() {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Hoe werkt het?
          </h1>
        </div>
  
        <div className="mt-16 space-y-12">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              1. Welke producten volgen we?
            </h2>
            <p className="mt-3 leading-8 text-gray-600">
              We volgen premium audioproducten van bekende merken bij Nederlandse retailers. De focus ligt op koptelefoons, earbuds, speakers en soundbars — modellen waar een prijsdaling van echte betekenis is.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              2. Hoe meten we de prijs?
            </h2>
            <p className="mt-3 leading-8 text-gray-600">
              De prijzen worden dagelijks automatisch opgehaald en opgeslagen.
              Daardoor ontstaat een betrouwbare prijsgeschiedenis en kunnen
              prijsdalingen objectief worden gedetecteerd.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              3. Wanneer wordt een korting een deal?
            </h2>
            <p className="mt-3 leading-8 text-gray-600">
              Niet elke korting is interessant. Een product verschijnt pas wanneer
              het voldoet aan strikte voorwaarden zoals:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1 leading-8 text-gray-600">
              <li>Significante prijsdaling</li>
              <li>Hogere prijsklasse</li>
              <li>Product is op voorraad</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              4. Blijft een deal altijd geldig?
            </h2>
            <p className="mt-3 leading-8 text-gray-600">
              Je ziet alleen deals die nu nog geldig zijn. Als de prijs weer stijgt
              of het product niet meer beschikbaar is, verdwijnt de deal automatisch.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              5. Hoe snel zie ik een nieuwe deal?
            </h2>
            <p className="mt-3 leading-8 text-gray-600">
              Zodra een interessante prijsdaling wordt gedetecteerd, wordt deze direct getoond op de website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              6. Wat gebeurt er als ik op een deal klik?
            </h2>
            <p className="mt-3 leading-8 text-gray-600">
              Bij elke deal kun je direct naar de webshop gaan, of eerst naar de
              productpagina op TechTracker voor meer details — TechTracker is zelf
              geen webshop. Momenteel volgen we Coolblue, met mogelijk uitbreiding
              in de toekomst.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              7. Wat zie ik op een productpagina?
            </h2>
            <p className="mt-3 leading-8 text-gray-600">
              Op een productpagina vind je meestal de actuele prijs, de
              prijsgeschiedenis van de afgelopen 90 dagen en de belangrijkste
              specificaties. Is er een actieve prijsdaling, dan zie je ook:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1 leading-8 text-gray-600">
              <li>Een vergelijking met de hoogste prijs van de afgelopen 30 dagen</li>
              <li>Een automatisch gegenereerde toelichting op de prijsgeschiedenis (AI)</li>
            </ul>
          </section>

        </div>
      </main>
    );
  }