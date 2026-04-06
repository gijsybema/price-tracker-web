import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {/* Merk / intro */}
          <div className="md:col-span-1">
            <p className="text-lg font-semibold tracking-tight text-gray-900">
              TechTracker
            </p>
            <div className="mt-4 max-w-md space-y-1 text-sm leading-7 text-gray-600">
              <p>Ontdek echte prijsdalingen op premium tech producten.</p>
              <p>Automatisch gedetecteerd met prijsdata.</p>
            </div>
          </div>

          {/* Transparantie */}
          <div className="max-w-lg">
            <h3 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-green-600">
              <span aria-hidden="true">✓</span>
              <span>Eerlijk & onafhankelijk</span>
            </h3>
            <div className="mt-4 space-y-3 text-sm leading-7 text-gray-600">
              <p>Alleen echte prijsdalingen op basis van prijsdata.</p>
              <p>
                TechTracker verkoopt zelf geen producten. Je wordt doorgestuurd
                naar de webshop.
              </p>
              <p>Sommige links kunnen affiliate links zijn.</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-gray-200 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs leading-6 text-gray-400">
            © {new Date().getFullYear()} TechTracker. Alle rechten voorbehouden.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500 md:justify-end">
            <Link href="/privacy" className="transition hover:text-gray-900">
              Privacybeleid
            </Link>
            <Link href="/terms" className="transition hover:text-gray-900">
              Algemene voorwaarden
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}