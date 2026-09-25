import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PaletteHost } from "./_ui/palette-host";
import { PwaRegister } from "./_ui/pwa";

export const metadata: Metadata = {
  title: "DigitalBurj | Learn. Build. Transform.",
  description: "A Dubai technology company. We teach practical skills, build useful software and fix the processes that slow businesses down.",
  icons: {
    icon: [{ url: "/favicon-64.png", type: "image/png", sizes: "64x64" }, { url: "/icon-192.png", type: "image/png", sizes: "192x192" }],
    shortcut: "/favicon-64.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: { capable: true, title: "DigitalBurj", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#f6f3ee", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Two self-hosted variable fonts (≈97 KB total), preloaded so text paints in its final face. */}
        <link rel="preload" href="/fonts/plex-sans.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/source-serif.woff2" as="font" type="font/woff2" crossOrigin="" />
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="antialiased">
        {children}
        <PaletteHost />
        <PwaRegister />
      </body>
    </html>
  );
}
