import { caseStudies } from "@/content";
import { ABOUT } from "@/content/about";
import { GITHUB, LINKEDIN } from "@/content/contact";
import { experience } from "@/content/experience";
import { NAME, SITE, orgName } from "@/content/seo";

export const dynamic = "force-static";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const month = (mmyyyy: string) => {
  const [m, y] = mmyyyy.split(".");
  return `${MONTHS[Number(m) - 1]} ${y}`;
};
/** "1w" as "1 week", "10d" as "10 days". */
/** A role's kind as words: "Intern" alone read like a job title. */
const KIND: Record<string, string> = { Intern: "internship", Freelance: "freelance" };
const span = (s: string) => s.replace(/^(\d+)([wd])$/, (_, n, u) => `${n} ${u === "w" ? "week" : "day"}${n === "1" ? "" : "s"}`);

/**
 * /llms.txt (after llmstxt.org): the site in plain words for AI agents, who often read this before, or instead of, the pages. It's written
 * at build time from the same content as the pages, so it can't fall behind them. It also says plainly that the site before November 2026
 * was a different portfolio, since agents still repeat it.
 */
export function GET() {
  const studies = caseStudies.map((c) => {
    const facts = c.meta.map((m) => `${m.label}: ${m.value}`).join(". ");
    const links = c.status.links.map((l) => `[${l.label}](${l.href})`).join(", ");
    return `- [${c.title}](${SITE}/work/${c.slug}): ${c.kind}, ${c.year}. ${c.summary} Result: ${c.quick.result} ${facts}.${links ? ` ${links}.` : ""}`;
  });
  const roles = experience.flatMap((co) =>
    co.roles.map((r) => {
      const when = r.end ? (r.end === r.start ? month(r.start) : `${month(r.start)} to ${month(r.end)}`) : `${month(r.start)} to now`;
      const work = r.href ? ` [Case study](${SITE}${r.href}).` : r.stones.length ? ` Case studies: ${r.stones.map((s) => `[${s.title}](${SITE}/work/${s.slug})`).join(", ")}.` : "";
      return `- ${r.title}, ${orgName(co.name)} (${KIND[r.type] ?? r.type.toLowerCase()}, ${when}${r.length ? `, ${span(r.length)}` : ""}). ${r.points.join(" ")}${work}`;
    }),
  );
  const text = [
    `# ${NAME}`,
    "",
    `> ${NAME}: ${ABOUT.role.toLowerCase()} in ${ABOUT.place}, India. In Syed's own words: "${ABOUT.lead}"`,
    "",
    `Now: ${ABOUT.now} ${ABOUT.open}.`,
    "",
    `This is Syed's current portfolio. syedali.app and ${SITE} are the same site: the first redirects to the second. Before November 2026 that address showed an earlier portfolio, with case studies such as Airtribe and Khaata that aren't part of it any more, so anything describing syedali.app with those projects is describing the earlier version.`,
    "",
    "## Case studies",
    "",
    ...studies,
    "",
    "## Experience",
    "",
    ...roles,
    "",
    "## About",
    "",
    `- In Syed's words: "${ABOUT.story}"`,
    `- What Syed does: ${ABOUT.does.join("; ")}.`,
    `- What Syed builds with: ${ABOUT.uses.join("; ")}.`,
    "",
    "## Pages",
    "",
    `- [Home](${SITE}/): every case study, with a filter for products and websites`,
    `- [Experience](${SITE}/experience)`,
    `- [About](${SITE}/about)`,
    `- [Archive](${SITE}/archive): animations, films, sites and products`,
    "",
    "## Contact",
    "",
    `- [GitHub](${GITHUB})`,
    `- [LinkedIn](${LINKEDIN})`,
    "",
  ].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
