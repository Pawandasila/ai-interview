import { Geist, Geist_Mono } from "next/font/google";
import Head from 'next/head';
import "./globals.css";
import Provider from "./Provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "AI Interview Platform - Enhance Your Hiring Process",
  description: "A comprehensive platform for conducting AI-driven interviews.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster />
        <Provider>
          <main>
            {children}
          </main>
        </Provider>
      </body>
    </html>
  );
}
