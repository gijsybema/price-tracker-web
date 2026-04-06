export const metadata = {
    title: "Privacybeleid | TechTracker",
    description: "Lees hoe TechTracker omgaat met gegevens en privacy.",
  };
  
  export default function PrivacyPage() {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Privacybeleid
        </h1>
  
        <div className="space-y-6 text-gray-600 leading-7">
          <p>
            TechTracker respecteert de privacy van bezoekers en verwerkt geen
            persoonlijke gegevens, tenzij dit noodzakelijk is voor het functioneren
            van de website.
          </p>
  
          <p>
            Wij verzamelen mogelijk anonieme gegevens via analytische tools om het
            gebruik van de website te verbeteren.
          </p>
  
          <p>
            TechTracker verkoopt geen gegevens aan derden.
          </p>
  
          <p>
            Voor vragen over privacy kun je contact opnemen via deze website.
          </p>
        </div>
      </main>
    );
  }