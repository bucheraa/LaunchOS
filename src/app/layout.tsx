import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "LaunchOS — AI-Powered App Launch Platform",
    template: "%s | LaunchOS",
  },
  description:
    "Generate store copy, screenshot plans, and A/B experiments for your mobile app with AI.",
  keywords: ["ASO", "app store optimization", "mobile app marketing", "AI", "launch"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://launchos.dev",
    title: "LaunchOS — AI-Powered App Launch Platform",
    description: "Generate store copy, screenshot plans, and A/B experiments for your mobile app.",
    siteName: "LaunchOS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
