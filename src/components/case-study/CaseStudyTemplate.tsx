"use client";

import Image from "next/image";
import { useState } from "react";
import FadeIn from "@/components/FadeIn";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/data/projects";
import CaseStudySection from "./CaseStudySection";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xl font-medium text-foreground">{children}</p>;
}

function Body({ children }: { children: React.ReactNode }) {
  return <p className="text-base leading-relaxed text-muted-foreground">{children}</p>;
}

export function ProjectLinks({ links }: { links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit rounded-full border border-foreground/15 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          {link.label} ↗
        </a>
      ))}
    </div>
  );
}

function NoteCard({ title, points }: { title: string; points?: string[] }) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-xl bg-secondary/40 p-5">
      <p className="text-base font-medium text-foreground">{title}</p>
      {points && (
        <ul className="list-disc space-y-1 pl-5 text-base text-muted-foreground">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FindingCard({ title, quotes }: { title: string; quotes: string[] }) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-xl bg-secondary/40 p-5">
      <p className="text-base font-medium text-foreground">{title}</p>
      <ul className="list-disc space-y-1.5 pl-5 text-base text-muted-foreground">
        {quotes.map((quote) => (
          <li key={quote}>&ldquo;{quote}&rdquo;</li>
        ))}
      </ul>
    </div>
  );
}

function InsightAccordionItem({ title, description }: { title: string; description: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-secondary/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <p className="text-base font-medium text-foreground">{title}</p>
        <span
          className="text-base text-foreground transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-base leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

function SolutionRow({
  solution,
  index,
}: {
  solution: NonNullable<Project["caseStudy"]>["solutions"][number];
  index: number;
}) {
  const gridCols = solution.images.length >= 3 ? "sm:grid-cols-2" : "sm:grid-cols-1";
  return (
    <div className={`flex flex-col gap-6 py-8 ${index > 0 ? "mt-2" : ""}`}>
      <span className="w-fit rounded-full bg-secondary px-3 py-1 text-sm font-medium text-foreground">
        {solution.label}
      </span>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="text-base font-medium text-foreground">{solution.leftTitle ?? "Problem"}</p>
          <Body>{solution.leftText}</Body>
        </div>
        <div className="flex flex-col gap-2 md:pl-6">
          <p className="text-base font-medium text-foreground">{solution.rightTitle ?? "Solution"}</p>
          <Body>{solution.rightText}</Body>
        </div>
      </div>

      <div className={`grid w-full grid-cols-1 gap-4 ${gridCols}`}>
        {/* Source crops are small, oddly-shaped UI snippets (dashboards,
            badges, strips) — object-cover into a fixed 16:9 box was
            cropping and upscaling them into an unreadable zoomed-in mess.
            object-contain shows the whole crop at its own aspect ratio,
            letterboxed on the transparent page background instead — only
            the main screenshot (ProjectCard, above) gets the dark tray. */}
        {solution.images.map((img) => (
          <div
            key={img.src}
            className="relative aspect-video w-full overflow-hidden rounded-lg"
          >
            <Image
              src={img.src}
              alt={img.alt ?? ""}
              fill
              sizes="(min-width: 1024px) 800px, 100vw"
              className="object-contain"
            />
          </div>
        ))}
      </div>

      {solution.impactText && (
        <div className="flex flex-col gap-2">
          <p className="text-base font-medium text-foreground">{solution.impactTitle ?? "Impact"}</p>
          <Body>{solution.impactText}</Body>
        </div>
      )}
    </div>
  );
}

function OutcomeRow({ label, metric }: { label: string; metric: string }) {
  return (
    <div className="flex w-full items-center justify-between gap-4 rounded-xl bg-secondary/40 px-5 py-4">
      <p className="text-base font-medium text-foreground">{label}</p>
      <p className="text-base text-muted-foreground">{metric}</p>
    </div>
  );
}

// Same hairline divider Projects.tsx uses for its own stacked rows, applied
// to the FadeIn wrappers (true flex siblings) rather than the sections
// themselves — see CaseStudySection for why.
const SECTION_CLASS = "border-b border-foreground/10 py-8 last:border-b-0 sm:py-10";

export default function CaseStudyTemplate({ project }: { project: Project }) {
  const cs = project.caseStudy;
  if (!cs) return null;

  return (
    <main className="mx-auto w-full max-w-[680px] py-12 sm:py-20">
      {/* No px-4 sm:px-6 here — ProjectCard's own root div already carries
          that padding (it needs it standing alone as a list row on the home
          page), so adding it again on this wrapper double-applied it and
          pushed the hero card 24px further in than every section below. */}
      <FadeIn>
        <ProjectCard project={project} linkable={false} />
      </FadeIn>

      <div className="mt-8 flex flex-col px-4 sm:px-6">
        <FadeIn className={SECTION_CLASS}>
          <CaseStudySection id="overview" className="flex flex-col gap-4">
            <SectionTitle>Overview</SectionTitle>
            <div className="flex flex-col gap-3">
              {cs.overview.map((p, i) => (
                <Body key={i}>{p}</Body>
              ))}
            </div>
            {project.links && <ProjectLinks links={project.links} />}
          </CaseStudySection>
        </FadeIn>

        <FadeIn delay={0.05} className={SECTION_CLASS}>
          <CaseStudySection id="challenge" className="flex flex-col gap-4">
            <SectionTitle>The Challenge</SectionTitle>
            <div className="flex flex-col gap-3">
              {cs.challenge.map((p, i) => (
                <Body key={i}>{p}</Body>
              ))}
            </div>
          </CaseStudySection>
        </FadeIn>

        {cs.scope && (
          <FadeIn delay={0.05} className={SECTION_CLASS}>
            <CaseStudySection id="scope" className="flex flex-col gap-6">
              <SectionTitle>What I Did, and What I Didn&rsquo;t</SectionTitle>
              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                <NoteCard title="What I did" points={cs.scope.did} />
                <NoteCard title="What I didn't" points={cs.scope.didnt} />
              </div>
            </CaseStudySection>
          </FadeIn>
        )}

        <FadeIn delay={0.05} className={SECTION_CLASS}>
          <CaseStudySection id="research" className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <SectionTitle>{cs.researchTitle}</SectionTitle>
              <div className="flex flex-col gap-3">
                {cs.researchIntro.map((p, i) => (
                  <Body key={i}>{p}</Body>
                ))}
              </div>
            </div>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              {cs.researchNotes.map((note) => (
                <NoteCard key={note.title} {...note} />
              ))}
            </div>
          </CaseStudySection>
        </FadeIn>

        {cs.findings && cs.findingsTitle && (
          <FadeIn delay={0.05} className={SECTION_CLASS}>
            <CaseStudySection id="findings" className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <SectionTitle>{cs.findingsTitle}</SectionTitle>
                <div className="flex flex-col gap-3">
                  {cs.findingsIntro?.map((p, i) => (
                    <Body key={i}>{p}</Body>
                  ))}
                </div>
              </div>
              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cs.findings.map((finding) => (
                  <FindingCard key={finding.title} {...finding} />
                ))}
              </div>
            </CaseStudySection>
          </FadeIn>
        )}

        <FadeIn delay={0.05} className={SECTION_CLASS}>
          <CaseStudySection id="insights" className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <SectionTitle>{cs.insightsTitle}</SectionTitle>
              <div className="flex flex-col gap-3">
                {cs.insightsIntro.map((p, i) => (
                  <Body key={i}>{p}</Body>
                ))}
              </div>
            </div>
            <div className="flex w-full flex-col gap-3">
              {cs.insights.map((item) => (
                <InsightAccordionItem key={item.title} {...item} />
              ))}
            </div>
          </CaseStudySection>
        </FadeIn>

        <FadeIn delay={0.05} className={SECTION_CLASS}>
          <CaseStudySection id="solutions" className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <SectionTitle>{cs.solutionsTitle}</SectionTitle>
              <div className="flex flex-col gap-3">
                {cs.solutionsIntro.map((p, i) => (
                  <Body key={i}>{p}</Body>
                ))}
              </div>
            </div>
            <div className="flex w-full flex-col">
              {cs.solutions.map((solution, i) => (
                <SolutionRow key={solution.label} solution={solution} index={i} />
              ))}
            </div>
          </CaseStudySection>
        </FadeIn>

        <FadeIn delay={0.05} className={SECTION_CLASS}>
          <CaseStudySection id="outcomes" className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <SectionTitle>{cs.outcomesTitle}</SectionTitle>
              <div className="flex flex-col gap-3">
                {cs.outcomesIntro.map((p, i) => (
                  <Body key={i}>{p}</Body>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1 text-base text-muted-foreground italic">
              {cs.closingNote.map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </div>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              {cs.outcomes.map((outcome) => (
                <OutcomeRow key={outcome.label} {...outcome} />
              ))}
            </div>
          </CaseStudySection>
        </FadeIn>

        <FadeIn delay={0.05} className={SECTION_CLASS}>
          <CaseStudySection id="learned" className="flex flex-col gap-4">
            <SectionTitle>{cs.learnedTitle}</SectionTitle>
            <div className="flex flex-col gap-3">
              {cs.learned.map((p, i) => (
                <Body key={i}>{p}</Body>
              ))}
            </div>
          </CaseStudySection>
        </FadeIn>
      </div>
    </main>
  );
}
