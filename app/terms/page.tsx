export const metadata = {
    title: "Algemene voorwaarden | TechTracker",
    description: "Lees de voorwaarden voor het gebruik van TechTracker.",
  };
  
  export default function TermsPage() {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Algemene voorwaarden
        </h1>
  
        <div className="space-y-6 text-gray-600 leading-7">
          <p>
            TechTracker biedt inzicht in prijsontwikkelingen van audioproducten.
            Aan de getoonde informatie kunnen geen rechten worden ontleend.
          </p>
  
          <p>
            TechTracker verkoopt zelf geen producten. Bij het klikken op een deal
            word je doorgestuurd naar een externe webshop.
          </p>
  
          <p>
            Prijzen en beschikbaarheid kunnen wijzigen. TechTracker is niet
            verantwoordelijk voor eventuele fouten of afwijkingen.
          </p>
  
          <p>
            Door gebruik te maken van deze website ga je akkoord met deze
            voorwaarden.
          </p>
        </div>
      </main>
    );
  }