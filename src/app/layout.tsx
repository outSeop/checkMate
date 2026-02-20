
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import InstallPrompt from '@/components/common/InstallPrompt'
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mogakko Check",
  description: "Mobile-first study management platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mogakko",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4f46e5", // Indigo-600
};

import { ThemeProvider } from '@/components/common/ThemeProvider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
