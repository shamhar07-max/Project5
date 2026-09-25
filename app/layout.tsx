import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MotionLayer } from "./_ui/motion";
import { CommandPalette } from "./_ui/command-palette";
import { MobileDock } from "./_ui/mobile-nav";
import { PwaRegister } from "./_ui/pwa";

export const metadata: Metadata = {
  title: "DigitalBurj | Learn. Build. Transform.",
  description: "One technology company with three engines of progress: Academy, Studio and Business AI — connected to Verified Talent and Jobs.",
  icons: {
    icon: [{ url: "/favicon-64.png", type: "image/png", sizes: "64x64" }, { url: "/icon-192.png", type: "image/png", sizes: "192x192" }],
    shortcut: "/favicon-64.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: { capable: true, title: "DigitalBurj", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#070d1b", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;600&family=Manrope:wght@400;500;600;700;800&display=swap" />
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="antialiased">
        <MotionLayer />
        {children}
        <MobileDock />
        <CommandPalette />
        <PwaRegister />
      </body>
    </html>
  );
}
