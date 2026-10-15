import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-Report PBOBA — Sistem Pelaporan PBOBA Sumatera Barat",
  description:
    "Sistem pelaporan dan pemantauan distribusi obat tradisional untuk Pedagang Besar Obat Tradisional (PBOT) di Sumatera Barat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
