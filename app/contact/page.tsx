export const metadata = {
    title: "Contact | TechTracker",
    description: "Neem contact op met TechTracker.",
  };
  
  export default function ContactPage() {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Contact</h1>
  
        <p className="mt-6 text-gray-600">
          Heb je vragen of wil je samenwerken? Neem gerust contact op.
        </p>
  
        <div className="mt-8 space-y-2 text-gray-800">
          <p>
            <strong>E-mail:</strong>{" "}
            <a
              href="mailto:info@techtracker.nl"
              className="text-blue-600 hover:underline"
            >
              info@techtracker.nl
            </a>
          </p>
  
        </div>
      </main>
    );
  }