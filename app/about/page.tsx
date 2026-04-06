export const metadata = {
  title: "Over TechTracker – Data om echte tech deals te vinden",
  description:
    "TechTracker is een data-gedreven project dat prijsontwikkelingen van tech producten in Nederland analyseert en echte tech deals zichtbaar maakt.",
}

export default function AboutPage() {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-3 text-4xl font-bold tracking-tight text-gray-900">Over het project</p>
  
          <p className="mt-6 text-lg leading-8 text-gray-600">
          De meeste “deals” zijn geen echte deals. 
          Kortingen worden vaak gebaseerd op adviesprijzen of tijdelijke marketingacties, 
          waardoor het lastig is om te zien wanneer iets écht goedkoper is.

          Deze tracker is gebouwd om dat probleem op te lossen.

          Door dagelijks prijzen op te slaan en te vergelijken met historische data, 
          laat de site alleen prijsdalingen zien die daadwerkelijk betekenis hebben.
          </p>
  
          <p className="mt-6 text-lg leading-8 text-gray-600">
          Onder de site draait een data pipeline die producten selecteert, 
          prijzen dagelijks opslaat en automatisch prijsdalingen detecteert
          </p>
        </div>
      </main>
    );
  }