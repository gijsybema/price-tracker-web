export const metadata = {
  title: "Alleen echte prijsdalingen voor premium tech producten| Hoe TechTracker werkt",
  description:
    "Ontdek hoe TechTracker prijdata analyseert en alleen echte deals toont. Transparante prijsvergelijking.",
}

export default function HowItWorksPage() {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20">
        <div>
          <p className="mb-3 text-sm font-medium text-gray-500">Methodiek</p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Hoe werkt het?
          </h1>
  
          <p className="mt-6 text-lg leading-8 text-gray-600">
          TechTracker is geen webshop. De site verzamelt en analyseert prijsdata van externe retailers. 
          Wanneer je op een deal klikt, word je doorgestuurd naar de betreffende webshop
          Techtracker is gebouwd om echte prijsdalingen op premium audioproducten
          zichtbaar te maken. Momenteel worden prijzen gemonitord bij retailers zoals Coolblue, 
          met mogelijk uitbreiding in de toekomst.
          </p>
        </div>
  
        <div className="mt-16 space-y-12">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              1. Selectie van producten
            </h2>
            <p className="mt-3 leading-8 text-gray-600">
              Nederlandse retailers. De focus ligt op premium audioproducten — koptelefoons, earbuds, speakers en soundbars — waar een prijsdaling van echte betekenis is.
            </p>
          </section>
  
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              2. Dagelijkse prijsmeting
            </h2>
            <p className="mt-3 leading-8 text-gray-600">
              De prijzen worden dagelijks automatisch opgehaald en opgeslagen. 
              Daardoor ontstaat een betrouwbare prijsgeschiedenis en kunnen 
              prijsdalingen objectief worden gedetecteerd.
            </p>
          </section>
  
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              3. Filtering van deals
            </h2>
            <p className="mt-3 leading-8 text-gray-600">
              Niet elke korting is interessant. Een product verschijnt pas wanneer 
              het voldoet aan strikte voorwaarden zoals:
              <ul className="list-disc pl-5 space-y-1">
                <li>Significante prijsdaling</li>
                <li>Hogere prijsklasse</li>
                <li>Product is op voorraad</li>
              </ul>
            </p>
          </section>
  
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              4. Alleen actuele deals
            </h2>
            <p className="mt-3 leading-8 text-gray-600">
              Je ziet alleen deals die nu nog geldig zijn. Als de prijs weer stijgt 
              of het product niet meer beschikbaar is, verdwijnt de deal automatisch.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              5. Direct gedeeld
            </h2>
            <p className="mt-3 leading-8 text-gray-600">
              Zodra een interessante prijsdaling wordt gedetecteerd, wordt deze direct getoond op de website.
            </p>
          </section>

        </div>
      </main>
    );
  }