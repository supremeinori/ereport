import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
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
    <html lang="id" className={lexend.variable}>
      <body className={`${lexend.className} antialiased min-h-screen flex flex-col font-sans`}>{children}</body>
    </html>
  );
}
