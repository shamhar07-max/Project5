import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MotionLayer } from "./_ui/motion";
import { PaletteHost } from "./_ui/palette-host";
import { MobileDock } from "./_ui/mobile-nav";
import { PwaRegister } from "./_ui/pwa";
import { Concierge } from "./_ui/lux/concierge";

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
        {/* Fonts are self-hosted; the two used above the fold are preloaded. */}
        <link rel="preload" href="/fonts/manrope.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/instrument-serif-italic.woff2" as="font" type="font/woff2" crossOrigin="" />
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="antialiased">
        <MotionLayer />
        {children}
        <MobileDock />
        <PaletteHost />
        <PwaRegister />
        <Concierge />
      </body>
    </html>
  );
}
