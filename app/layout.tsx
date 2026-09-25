import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DigitalBurj | Practical progress, connected",
  description: "Learn, build, improve and find opportunity with DigitalBurj.",
  icons: {
    icon: [{ url: "/favicon-64.png", type: "image/png", sizes: "64x64" }, { url: "/icon-192.png", type: "image/png", sizes: "192x192" }],
    shortcut: "/favicon-64.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
