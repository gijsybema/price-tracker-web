import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Headphone Deals Tracker",
  description: "Track prijsdalingen van premium headphones in Nederland",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-white text-gray-900">
        <div className="flex bg-white min-h-screen flex-col">
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>

        <Analytics />

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2HCX2P4VY6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2HCX2P4VY6');
          `}
        </Script>
      </body>
    </html>
  );
}