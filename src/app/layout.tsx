import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Both families are self-hosted from /public/fonts. No Google Fonts request.
const satoshi = localFont({
  src: [
    { path: "../../public/fonts/Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/Satoshi-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
  fallback: ["Hanken Grotesk", "system-ui", "-apple-system", "sans-serif"],
});

const jetbrains = localFont({
  src: [
    { path: "../../public/fonts/JetBrainsMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/JetBrainsMono-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-jetbrains",
  display: "swap",
  fallback: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
});

// Title and description move to SiteSettings in Phase 3.
export const metadata: Metadata = {
  title: "Caparison Lab",
  // The tile, not the bare mark: the mark's aperture is transparent, so on a
  // light tab bar it washed out (owner, 2026-09-17).
  icons: { icon: "/brand/icon-tile.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning lang="en" className={`${satoshi.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
