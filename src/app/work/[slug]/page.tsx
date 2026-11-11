import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyView } from "@/components/CaseStudyView";
import { caseStudies, getCaseStudy } from "@/content";
import { caseStudyLd, ld, pageMeta } from "@/content/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const study = getCaseStudy((await params).slug);
  return study ? pageMeta({ title: study.title, description: study.summary, path: `/work/${study.slug}`, image: study.cover.src, type: "article" }) : {};
}

export default async function Page({ params }: PageProps<"/work/[slug]">) {
  const study = getCaseStudy((await params).slug);
  if (!study) notFound();
  return (
    <>
      {/* What the case study is and who made it, for search engines and AI agents (content/seo.ts). */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(caseStudyLd(study)) }} />
      <CaseStudyView study={study} />
    </>
  );
}
