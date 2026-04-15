import type { Metadata } from "next";
import { Geist_Mono, Inter_Tight, Source_Serif_4, Playfair_Display, Instrument_Serif, Inter } from "next/font/google";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter_Tight({ subsets: ['latin'], variable: '--font-inter' });

import posthog from 'posthog-js'
import { cn } from "@/lib/utils";

const interHeading = Inter({subsets:['latin'],variable:'--font-heading'});

// const inter = Inter({subsets:['latin'],variable:'--font-sans'});


posthog.init('phc_ty7rHdmiwRnwdk2DPKDS5TiunkMdlhM9L0DFJjzEldS', {
  api_host: 'https://us.i.posthog.com',
  defaults: '2026-01-30'
})
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const geistSans = Source_Serif_4({
  variable: "--font-source-serif-4",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaaSFollo",
  description: "Helping solo founders plan and ship their saas faster",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(playfairDisplay.variable, instrumentSerif.variable, "font-sans", inter.variable, interHeading.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased  bg-[#F7F5F3]`}
      >
        <NuqsAdapter>
          {children}
        </NuqsAdapter>
        <Toaster />

      </body>
    </html>
  );
}
