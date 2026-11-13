import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Libre_Baskerville } from "next/font/google";
import { BackFade } from "@/components/PageLink";
import { Sound } from "@/components/Sound";
import { PICK_HERO } from "@/content/heroes";
import { HOME_TITLE, NAME, SITE, ld, siteLd } from "@/content/seo";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// The serif: Libre Baskerville, the face of the case studies Syed pointed at (Rachel Chen's), and sturdier than
// Newsreader at heading sizes (checked in a rendered specimen beside Geist, Inter and Instrument Sans).
const serif = Libre_Baskerville({ variable: "--font-baskerville", subsets: ["latin"], style: ["normal", "italic"] });

const DESCRIPTION = "Case studies by Syed Ali, a product designer and design engineer in Bengaluru: Trace, Animation Engine, KIPRUN, Kodex, Uniqkey and Anime Sports League.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: HOME_TITLE, template: `%s · ${NAME}` },
  description: DESCRIPTION,
  authors: [{ name: NAME, url: SITE }],
  creator: NAME,
  // What a shared link shows when a page doesn't say: each page sets its own (pageMeta, content/seo.ts). The picture is opengraph-image.png beside this file.
  openGraph: { title: HOME_TITLE, description: DESCRIPTION, url: "/", siteName: NAME, type: "website" },
  twitter: { card: "summary_large_image", title: HOME_TITLE, description: DESCRIPTION },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" data-hero="studio" className={`${geist.variable} ${geistMono.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        {/* Before first paint: lets the scroll reveals hide their content only when JS is there to show it, picks which
            arrangement of the first screen is up (content/heroes.ts), puts back the theme the reader chose (light unless they
            picked dark), so the page never flashes the other one, and on the first full load of the home page in a visit holds
            its content back for the scaffold reveal (Preloader.tsx). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "var d=document.documentElement;d.classList.add('js');try{" +
              PICK_HERO +
              "if(localStorage.getItem('theme')==='dark')d.dataset.theme='dark';if(location.pathname==='/'&&!sessionStorage.getItem('boot')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){sessionStorage.setItem('boot','1');d.classList.add('boot')}}catch(e){}",
          }}
        />
        {/* Who made the site, for search engines and AI agents (content/seo.ts). */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(siteLd) }} />
      </head>
      <body className="min-h-svh overflow-x-clip">
        {children}
        <Sound />
        <BackFade />
        {/* Vercel Web Analytics: page views and where visitors come from, cookieless. Only reports from the deployed site. */}
        <Analytics />
      </body>
    </html>
  );
}
