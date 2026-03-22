import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Headphone Deals Tracker",
  description: "Track prijsdalingen van premium headphones in Nederland",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}