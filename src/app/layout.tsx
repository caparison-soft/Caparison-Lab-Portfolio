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

// Display face for the big moments (rebrand, owner 2026-11-05): page h1s,
// the closing offer, the footer name. One weight; Satoshi stays for the rest.
// SIL Open Font License, see public/fonts/ArchivoBlack-OFL.txt.
const archivo = localFont({
  src: [{ path: "../../public/fonts/ArchivoBlack-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-archivo",
  display: "swap",
  fallback: ["Arial Black", "system-ui", "sans-serif"],
});

// Title and description move to SiteSettings in Phase 3.
export const metadata: Metadata = {
  title: "Caparison Lab",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning lang="en" className={`${satoshi.variable} ${jetbrains.variable} ${archivo.variable}`}>
      {/* Browser extensions (ColorZilla's cz-shortcut-listen, Grammarly) write attributes on
          <body> before React loads; this silences that mismatch for body's own attributes only. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
