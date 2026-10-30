import type { CaseStudy } from "@/data/projects";
import Scrubber, { type ScrubberItem } from "@/components/Scrubber";

function buildItems(cs: CaseStudy): ScrubberItem[] {
  const items: ScrubberItem[] = [
    { id: "overview", label: "Overview" },
    { id: "challenge", label: "The Challenge" },
  ];

  if (cs.scope) {
    items.push({ id: "scope", label: "What I Did" });
  }

  items.push({ id: "research", label: cs.researchTitle });

  if (cs.findings && cs.findingsTitle) {
    items.push({ id: "findings", label: cs.findingsTitle });
  }

  items.push(
    { id: "insights", label: cs.insightsTitle },
    { id: "solutions", label: cs.solutionsTitle },
    { id: "outcomes", label: cs.outcomesTitle },
    { id: "learned", label: cs.learnedTitle }
  );

  return items;
}

export default function CaseStudyScrubber({ caseStudy }: { caseStudy?: CaseStudy }) {
  if (!caseStudy) return null;
  return <Scrubber items={buildItems(caseStudy)} />;
}
