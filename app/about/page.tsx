export default function AboutPage() {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-medium text-gray-500">Over het project</p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Een side project rond deals, data en scraping
          </h1>
  
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Headphone Deals Tracker is een klein project dat is ontstaan uit
            interesse in prijsdata, scraping en het verschil tussen echte deals en
            marketingruis.
          </p>
  
          <p className="mt-6 leading-7 text-gray-600">
            De site is bedoeld als publieke laag bovenop een data pipeline die
            producten ontdekt, prijzen opslaat en prijsdalingen detecteert. Daarmee
            is het niet alleen een deals-site, maar ook een portfolio project dat
            backend, data engineering en frontend samenbrengt.
          </p>
        </div>
      </main>
    );
  }