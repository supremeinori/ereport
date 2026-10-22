import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
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
    <html lang="id" className={`${inter.variable} ${roboto.variable}`}>
      <body className={`${inter.className} ${roboto.className} antialiased min-h-screen flex flex-col font-sans`}>{children}</body>
    </html>
  );
}
