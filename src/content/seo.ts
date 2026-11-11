import type { Metadata } from "next";
import { ABOUT } from "./about";
import { GITHUB, LINKEDIN } from "./contact";
import { experience } from "./experience";
import type { CaseStudy } from "./types";

/**
 * What the site tells search engines and AI agents: where it lives, each page's canonical address and share card, and who made it, as
 * schema.org structured data (JSON-LD). www.syedali.app is the address Vercel serves (the bare syedali.app redirects to it), so it's the
 * one every page names as canonical. To serve the bare domain instead, make it primary in Vercel's Domains and change SITE.
 */
export const SITE = "https://www.syedali.app";
export const NAME = "Syed Ali";
export const HOME_TITLE = `${NAME} · Product designer & design engineer`;
const CARD = { url: "/opengraph-image.png", width: 1200, height: 630, alt: `${NAME}, design engineer` };

/** An organisation's name as written in a sentence: "BASENINE" is set in capitals on the page. */
export const orgName = (name: string) => (name === name.toUpperCase() ? name[0] + name.slice(1).toLowerCase() : name);

/** A page's title, description, canonical address and share card. Without a title it's the home page. */
export function pageMeta({ title, description, path, image, type = "website" }: { title?: string; description: string; path: string; image?: string; type?: "website" | "article" }): Metadata {
  const share = title ? `${title} · ${NAME}` : HOME_TITLE;
  // A page's own openGraph replaces the one it would inherit, picture and all, so one without a picture of its own names the site's card
  // (opengraph-image.png and twitter-image.png, beside layout.tsx).
  return {
    title: title ?? { absolute: HOME_TITLE },
    description,
    alternates: { canonical: path },
    openGraph: { title: share, description, url: path, siteName: NAME, type, images: [image ?? CARD] },
    twitter: { card: "summary_large_image", title: share, description, images: [image ?? { ...CARD, url: "/twitter-image.png" }] },
  };
}

const PERSON = `${SITE}/#person`;
const WEBSITE = `${SITE}/#website`;

/** Who Syed is, from the same words as the About and Experience pages. */
export const person = {
  "@type": "Person",
  "@id": PERSON,
  name: NAME,
  url: SITE,
  jobTitle: ABOUT.role,
  description: ABOUT.lead,
  address: { "@type": "PostalAddress", addressLocality: ABOUT.place, addressCountry: "IN" },
  worksFor: experience.filter((e) => e.current).map((e) => ({ "@type": "Organization", name: orgName(e.name) })),
  knowsAbout: [...ABOUT.does.map((d) => d.split(",")[0]), ...ABOUT.uses],
  sameAs: [GITHUB, LINKEDIN],
};

/** On every page: the site, and who made it. */
export const siteLd = {
  "@context": "https://schema.org",
  "@graph": [{ "@type": "WebSite", "@id": WEBSITE, url: SITE, name: NAME, inLanguage: "en", author: { "@id": PERSON } }, person],
};

/** On the About page: a profile of Syed. */
export const profileLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: `${SITE}/about`,
  mainEntity: person,
  isPartOf: { "@id": WEBSITE },
};

/** On a case study: what it is, who made it, and where it sits in the site. */
export function caseStudyLd(study: CaseStudy) {
  const url = `${SITE}/work/${study.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        url,
        mainEntityOfPage: url,
        headline: `${study.title}: ${study.tagline.replaceAll("==", "")}`,
        description: study.summary,
        image: `${SITE}${study.cover.src}`,
        inLanguage: "en",
        author: { "@type": "Person", "@id": PERSON, name: NAME, url: SITE },
        isPartOf: { "@id": WEBSITE },
        about: { "@type": "CreativeWork", name: study.title },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: NAME, item: SITE },
          { "@type": "ListItem", position: 2, name: study.title, item: url },
        ],
      },
    ],
  };
}

/** For a <script type="application/ld+json">: JSON with "<" escaped, so nothing in it can end the script early. */
export const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
