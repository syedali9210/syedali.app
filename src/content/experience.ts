/**
 * Work experience: the Basenine internship, and the Decathlon India freelance work (KIPRUN, Anime Sports League) from their
 * repositories and case studies here.
 * Periods are "MM.YYYY"; a role with no `end` is ongoing.
 */
export type Role = {
  title: string;
  type: string;
  start: string;
  end?: string;
  points: string[];
  skills: string[];
  /** The case study here, if there is one. */
  href?: string;
  /** The rocks of what it made, each a way into its case study. */
  stones: { slug: string; title: string }[];
};
export type Employer = { name: string; logo: string; site?: string; current?: boolean; roles: Role[] };

export const experience: Employer[] = [
  {
    name: "BASENINE",
    logo: "/experience/basenine.jpeg",
    current: true,
    roles: [
      {
        title: "Product Designer Intern",
        type: "Intern",
        start: "02.2026",
        stones: [
          { slug: "kodex", title: "Kodex" },
          { slug: "uniqkey", title: "Uniqkey" },
        ],
        points: [
          "Designed and built websites for Basenine's clients, including Kodex and Uniqkey, from the first wireframe to production.",
          "Turned detailed Figma designs into responsive interfaces in React, Next.js, TypeScript and Tailwind CSS, matched closely to the design.",
          "Built reusable components and contributed to design systems, so new pages took less time.",
          "Built the interactions and micro-animations with GSAP and modern CSS.",
          "Worked with founders, product managers, designers and engineers to take products from concept to production.",
          "Worked on internal tools that made the handoff from design to development easier for the team.",
        ],
        skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Figma", "GSAP", "Framer Motion"],
      },
    ],
  },
  {
    name: "Decathlon India",
    logo: "/experience/decathlon-mark.svg",
    site: "https://www.decathlon.in",
    roles: [
      {
        title: "KIPRUN campaign page",
        type: "Freelance",
        start: "09.2026",
        end: "10.2026",
        href: "/work/kiprun",
        stones: [{ slug: "kiprun", title: "KIPRUN" }],
        points: [
          "Designed and built the campaign page for KIPRUN, Decathlon's running brand, live on decathlon.in four days after the first commit.",
          "Served under Decathlon's own address through its proxy, with every price, weight and rating read from decathlon.in.",
          "A range where each colour shows its shoe and opens its own product, with the women's fits added a month after launch.",
          "Loaded about 970,000 times in its last month, according to Vercel's CDN logs.",
        ],
        skills: ["HTML", "CSS", "JavaScript", "Vercel", "Figma"],
      },
      {
        title: "Anime Sports League campaign site",
        type: "Freelance",
        start: "08.2026",
        end: "09.2026",
        href: "/work/anime-sports-league",
        stones: [{ slug: "anime-sports-league", title: "Anime Sports League" }],
        points: [
          "Designed and built the campaign site for Decathlon India's Anime Sports League, around Jolly Yun Shann's illustrations.",
          "Cut the traced poster (1,732 paths) into 15 layers that part as you scroll, and built an episode deck that deals itself.",
          "Brought the card art from 3 MB to 310 kB, and tagged every product link with the campaign's UTM parameters.",
        ],
        skills: ["React", "Vite", "GSAP", "Lenis", "SVG"],
      },
    ],
  },
];

/** How long a role has run, counting its first and last months, as syedali.app shows it ("10m", "1y 2m"). */
export function duration(start: string, end?: string, now = new Date()) {
  const [sm, sy] = start.split(".").map(Number);
  const [em, ey] = end ? end.split(".").map(Number) : [now.getMonth() + 1, now.getFullYear()];
  const months = (ey - sy) * 12 + (em - sm) + 1;
  if (months <= 0) return "";
  const y = Math.floor(months / 12), m = months % 12;
  return y ? (m ? `${y}y ${m}m` : `${y}y`) : `${m}m`;
}
