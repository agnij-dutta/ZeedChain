'use client';

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Inter } from 'next/font/google';
import { NotificationProvider } from '@/context/NotificationContext';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "ZeedChain - Startup Equity NFT Platform",
  description: "Decentralized platform for startup equity NFTs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>ZeedChain - Startup Equity NFT Platform</title>
        <meta name="description" content="Decentralized platform for startup equity NFTs" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <NotificationProvider>
          <div className="min-h-screen">
            <header className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <h1 className="text-lg font-semibold text-gray-900">
                  ZeedChain
                </h1>
              </div>
            </header>
            {children}
          </div>
        </NotificationProvider>
      </body>
    </html>
  );
}
