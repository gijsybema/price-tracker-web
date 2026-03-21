import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/80">
              Nederlandse premium headphone deal tracker
            </p>

            <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
              Prijsdalingen voor premium headphones
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Ik track dagelijks prijzen van premium headphones in Nederland en
              laat alleen deals zien die echt interessant zijn. Gericht op
              premium headphones, echte prijsdrops en producten die op
              voorraad zijn.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/deals"
                className="rounded-xl bg-white px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-100"
              >
                Bekijk deals
              </Link>

              <a
                href="https://t.me/NLHeadphoneDeals"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-medium text-white transition hover:bg-white/15"
              >
                Volg op Telegram
              </a>
            </div>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-sm text-slate-300">Focus</p>
              <p className="mt-2 text-2xl font-semibold">Premium headphones</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-sm text-slate-300">Detectie</p>
              <p className="mt-2 text-2xl font-semibold">Dagelijkse prijschecks</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-sm text-slate-300">Filter</p>
              <p className="mt-2 text-2xl font-semibold">Alleen betekenisvolle prijsalerts</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Prijschecks</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">Dagelijks</p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Focus</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">NL markt</p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Retailers</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">Coolblue</p>
          </div>


        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Dagelijkse tracking</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Productprijzen worden automatisch gecontroleerd zodat nieuwe
              prijsdalingen snel zichtbaar zijn.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Alleen relevante deals</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              De tracker is gebouwd om ruis te verminderen en alleen
              betekenisvolle prijsdrops te tonen.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Portfolio project</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Dit project combineert scraping, data pipelines, alerting en een
              publieke frontend in één product.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}