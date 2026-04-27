import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Provider from "@/components/Provider";
import InstallApp from "@/components/InstallApp";
import DevtoolsBlock from "@/components/DevtoolsBlock";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // YouTube app jaisa - zoom nahi hoga
};

export const metadata: Metadata = {
  title: "MyTube",
  description: "A video streaming platform by The Great Sumit",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "My Tube",
    startupImage: "/icons/icon-512x512.png",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "My Tube",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <Provider>
          <div className="min-h-screen bg-white dark:bg-zinc-950">
            <Header />
            <DevtoolsBlock />
            <main className="pt-16">{children}</main>
          </div>
        </Provider>
        <InstallApp />
      </body>
    </html>
  );
}
