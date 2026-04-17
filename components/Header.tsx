import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        
        {/* Logo + naam */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="TechTracker"
            width={28}
            height={28}
            className="object-contain"
            priority
          />
          <span className="text-xl font-bold tracking-tight text-gray-900">
            TechTracker
          </span>
        </Link>

        {/* Navigatie */}
        <nav className="flex items-center gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <Link href="/deals" className="hover:text-gray-900">Deals</Link>
          <Link href="/how-it-works" className="hover:text-gray-900">
            Hoe werkt het
          </Link>
          <Link href="/about" className="hover:text-gray-900">Over</Link>
        </nav>
      </div>
    </header>
  );
}