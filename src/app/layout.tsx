import type { Metadata } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "E-Report PBOBA",
  description:
    "Sistem pelaporan dan pemantauan distribusi obat tradisional untuk Pedagang Besar Obat Tradisional (PBOT) di Sumatera Barat.",
  icons: {
    icon: "/ereport_pboba_logo_v2.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jakarta.variable} ${plexMono.variable}`}>
      <body className="font-sans bg-canvas text-ink antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
