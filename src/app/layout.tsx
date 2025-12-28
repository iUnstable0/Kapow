import type { Metadata } from "next";
import { Geist, Geist_Mono, Special_Elite } from "next/font/google";

import { MusicProvider } from "@/components/context/music";
import { SettingsProvider } from "@/components/context/settings";

import SettingsWidget from "@/components/settings-widget";

import "./globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const specialElite = Special_Elite({
  weight: ["400"],
  variable: "--font-special-elite",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kapow",
  description: "Pad kapow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${specialElite.variable} antialiased`}
      >
        <SettingsProvider>
          <MusicProvider>
            <SettingsWidget />

            {children}
          </MusicProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
