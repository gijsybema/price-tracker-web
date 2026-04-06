import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Merk / intro */}
          <div className="md:col-span-1">
            <p className="text-lg font-semibold text-gray-900">TechTracker</p>
            <div className="mt-4 text-sm leading-7 text-gray-600">
            <p>
            Ontdek echte prijsdalingen op premium tech producten. 
            </p>
            <p>
            Automatisch gedetecteerd met prijsdata.
            </p>
            </div>
          </div>

          {/* Transparantie */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-green-600">
             ✓ Eerlijk & onafhankelijk
            </h3>
            <div className="mt-4 space-y-3 text-sm leading-7 text-gray-600">
              <p>Alleen echte prijsdalingen op basis van prijsdata.</p>
              <p>
                TechTracker verkoopt zelf geen producten. Je wordt doorgestuurd
                naar de webshop.
              </p>
              <p>
                Sommige links kunnen affiliate links zijn. 
              </p>
            </div>
          </div>


        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 flex items-center justify-between">
  
  <p className="text-xs text-gray-400">
    © {new Date().getFullYear()} TechTracker. Alle rechten voorbehouden.
  </p>

  <div className="flex gap-6 text-xs text-gray-500">
    <Link href="/privacy" className="hover:text-gray-900 transition">
      Privacybeleid
    </Link>
    <Link href="/terms" className="hover:text-gray-900 transition">
      Algemene voorwaarden
    </Link>
  </div>
</div>
</div>
    </footer>
  );
}