import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CineBrain Pro",
  description: "Advanced Cinema Equipment Management",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CineBrain",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Feels more like native app
  viewportFit: "cover",
};

import { KitProvider } from "@/context/KitContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { KitSidebar } from "@/components/ui/KitSidebar";

import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { AppHeader } from "@/components/ui/AppHeader";
import { LanguageProvider } from "@/context/LanguageContext";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  let user = null;
  if (session?.userId) {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, language: true }
    });
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider initialLanguage={user?.language || 'EN'}>
            <KitProvider>
              <div className="flex min-h-screen">
                <div className="flex-1 w-full relative flex flex-col">
                  {/* Global Header */}
                  <AppHeader user={user} />

                  {/* Main Content */}
                  <main className="flex-1">
                    {children}
                  </main>
                </div>
                {/* Collapsible Sidebar */}
                <KitSidebar />
              </div>
            </KitProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
