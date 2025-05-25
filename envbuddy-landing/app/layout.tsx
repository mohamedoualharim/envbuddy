import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "EnvBuddy — Sync .env Files Like a Pro",
  description: "Manage your environment variables securely across projects, teams, and devices. Simple CLI tool for developers.",
  keywords: ["environment variables", "env files", "dotenv", "CLI", "developer tools", "configuration management"],
  authors: [{ name: "EnvBuddy Team" }],
  openGraph: {
    title: "EnvBuddy — Sync .env Files Like a Pro",
    description: "Manage your environment variables securely across projects, teams, and devices.",
    type: "website",
    url: "https://envbuddy.dev",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "EnvBuddy - Environment Variable Management"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "EnvBuddy — Sync .env Files Like a Pro",
    description: "Manage your environment variables securely across projects, teams, and devices.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
