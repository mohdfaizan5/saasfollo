import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter_Tight, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter_Tight({ subsets: ['latin'], variable: '--font-inter' });

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
    <html lang="en" className={inter.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased  bg-[#F7F5F3]`}
      >
        {children}
      </body>
    </html>
  );
}
