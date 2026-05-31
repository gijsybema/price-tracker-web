import Link from "next/link";
import Image from "next/image";
import SearchInput from "./SearchInput";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* Logo */}
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

        {/* Nav + search */}
        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="flex items-center gap-4 text-sm text-gray-600 sm:gap-6">
            <Link href="/deals" className="hover:text-gray-900">Deals</Link>
            <Link href="/products" className="hover:text-gray-900">Producten</Link>
          </nav>
          <div className="hidden sm:block">
            <SearchInput />
          </div>
        </div>
      </div>
    </header>
  );
}