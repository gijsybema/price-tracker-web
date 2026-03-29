import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-gray-900">Tech Tracker NL</p>
        </div>

      </div>
    </footer>
  );
}