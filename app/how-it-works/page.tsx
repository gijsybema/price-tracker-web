export default function HowItWorksPage() {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20">
        <div>
          <p className="mb-3 text-sm font-medium text-gray-500">Methodiek</p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Hoe werkt het?
          </h1>
  
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Deze tracker is gebouwd om echte prijsdalingen op premium headphones
            zichtbaar te maken, zonder de gebruikelijke marketingruis.
          </p>
        </div>
  
        <div className="mt-16 space-y-12">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              1. Producten worden gevolgd
            </h2>
            <p className="mt-3 leading-8 text-gray-600">
              De tracker monitort geselecteerde premium headphone-producten bij
              Nederlandse retailers. De focus ligt op modellen waar een prijsdaling
              van echte betekenis is.
            </p>
          </section>
  
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              2. Prijzen worden gecontroleerd
            </h2>
            <p className="mt-3 leading-8 text-gray-600">
              De prijsdata wordt automatisch opgehaald en opgeslagen, zodat
              veranderingen over tijd zichtbaar worden en prijsdrops objectief
              kunnen worden gedetecteerd.
            </p>
          </section>
  
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              3. Alleen relevante drops
            </h2>
            <p className="mt-3 leading-8 text-gray-600">
              Niet elke korting is interessant. Daarom worden alleen deals getoond
              die aan duidelijke criteria voldoen, zoals een significante
              prijsdaling en focus op hogere prijsklassen.
            </p>
          </section>
  
          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              4. Deals worden gedeeld
            </h2>
            <p className="mt-3 leading-8 text-gray-600">
              Zodra een interessante prijsdaling wordt gedetecteerd, kan deze op de
              site of via een extern kanaal zoals Telegram gedeeld worden.
            </p>
          </section>
        </div>
      </main>
    );
  }