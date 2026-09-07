import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { Agentation } from "agentation";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SmoothScroll from "@/components/SmoothScroll";
import PageTransition from "@/components/PageTransition";
import ViewportEdgeBlur from "@/components/ViewportEdgeBlur";
import "./globals.css";

const segoeUI = localFont({
  // Subsetted to the Latin + punctuation/arrow glyphs actually used on the
  // site (see scripts this was generated with in the PR) and converted to
  // woff2 — the original OTFs were full multi-script system font dumps
  // (~900KB each, ~4.2MB total) that Next preloads on every page load
  // regardless of which glyphs are ever painted; this subset is ~20KB each.
  src: [
    { path: "./fonts/segoe-ui-light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/segoe-ui-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/segoe-ui-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/segoe-ui-semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/segoe-ui-bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Syed Ali — Designing things, Building myself",
  description:
    "The guy who designs things and brings them to life, cuz why not. Engineering taught me to do things the unconventional way.",
  openGraph: {
    title: "Syed Ali — Designing things, Building myself",
    description:
      "The guy who designs things and brings them to life, cuz why not. Engineering taught me to do things the unconventional way.",
    siteName: "Syed Ali",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syed Ali — Designing things, Building myself",
    description:
      "The guy who designs things and brings them to life, cuz why not. Engineering taught me to do things the unconventional way.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${segoeUI.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-background text-foreground">
        {/* Nav portals its fixed header in here — a sibling of PageTransition,
            so it never sits inside that wrapper's animated transform (see
            Nav.tsx for why that matters). */}
        <div id="nav-root" />
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <ViewportEdgeBlur />
          <SmoothScroll>
            <PageTransition>{children}</PageTransition>
          </SmoothScroll>
        </ThemeProvider>
        {process.env.NODE_ENV === "development" && (
          <Agentation endpoint="http://localhost:4747" />
        )}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
