import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ 
  subsets: ["latin"], 
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"]
});

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"]
});

const jetbrains = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "FORJA — Digital Studio",
  description: "L'agent qui transforme l'idée brute en produit qui se vend.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-fv-black text-fv-ink font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
