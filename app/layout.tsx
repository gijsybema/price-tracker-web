import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "TechTracker | Echte audio deals in Nederland",
  description: "TechTracker volgt dagelijks prijzen van premium audioproducten in Nederland en laat alleen echte prijsdalingen zien.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-white text-gray-900">
        <div className="flex bg-white min-h-screen flex-col">
          <ScrollToTop />
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>

        <Analytics />
      </body>
    </html>
  );
}