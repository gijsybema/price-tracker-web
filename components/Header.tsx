import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
          Tech Tracker NL
        </Link>

        <nav className="flex items-center gap-6 text-sm text-gray-600">
          <Link href="/">Home</Link>
          <Link href="/deals">Deals</Link>
          <Link href="/how-it-works">Hoe werkt het</Link>
          <Link href="/about">Over</Link>

          <a
            href="https://t.me/NLHeadphoneDeals"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 rounded-lg bg-black px-4 py-2 text-white text-sm font-medium"
          >
          Telegram
          </a>
        </nav>
      </div>
    </header>
  );
}