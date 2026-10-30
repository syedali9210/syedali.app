"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/FadeIn";
import SectionHeading from "@/components/SectionHeading";
import { spring } from "@/lib/springs";
import { projects } from "@/data/projects";

// Desktop-only: a "Coming soon" pill that tracks the cursor while hovering
// the blurred hero image, instead of a fixed centered overlay.
function ComingSoonCursorTag() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  return (
    <div
      className="absolute inset-0 z-10 hidden sm:block"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <motion.div
        className="pointer-events-none absolute z-10 flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-sm font-medium whitespace-nowrap text-foreground shadow-lg"
        animate={{ left: pos.x, top: pos.y, opacity: hovering ? 1 : 0 }}
        transition={spring.fast}
        style={{ x: "-50%", y: "-140%" }}
      >
        <Lock className="size-3.5" />
        Coming soon
      </motion.div>
    </div>
  );
}

export default function Projects() {
  // All projects are shown expanded, one after another.
  return (
    <section
      id="projects"
      className="screen-line-top screen-line-bottom mx-auto w-full max-w-[680px] py-12 sm:py-20"
    >
      <SectionHeading>/Projects</SectionHeading>

      <FadeIn className="mt-6 px-4 sm:px-6">
        <div className="flex flex-col">
          {projects.map((project) => (
            <div key={project.slug} className="flex flex-col gap-6 border-b border-foreground/10 py-4 last:border-b-0">
              <p className="w-fit text-xl font-medium text-foreground">{project.title}</p>

              {project.image && (project.caseStudy && !project.comingSoon ? (
                <Link
                  href={`/projects/${project.slug}`}
                  className="group/hero relative aspect-video w-full overflow-hidden rounded-xl bg-transparent transition-opacity hover:opacity-80"
                >
                  <Image
                    src={project.image}
                    alt={`${project.title} screenshot`}
                    fill
                    sizes="(min-width: 640px) 680px, 100vw"
                    className="object-cover object-top"
                  />
                </Link>
              ) : (
                <div className="group/hero relative aspect-video w-full overflow-hidden rounded-xl bg-transparent">
                  <Image
                    src={project.image}
                    alt={`${project.title} screenshot`}
                    fill
                    sizes="(min-width: 640px) 680px, 100vw"
                    className={cn(
                      "object-cover object-top",
                      project.comingSoon && "object-contain p-8 blur-md"
                    )}
                  />
                  {project.comingSoon && <ComingSoonCursorTag />}
                </div>
              ))}

              <div className="flex flex-col gap-2">
                <p className="text-base font-medium text-foreground">{project.tag}</p>
                <p className="text-base leading-relaxed text-muted-foreground">{project.description}</p>
              </div>

              {/* Pulled up out of the parent's gap-6 — sits closer to the
                  description than the image/text spacing above it. */}
              <div className="-mt-3 flex flex-col gap-3">
                {(project.caseStudy || project.links) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {project.caseStudy && (
                      <Link
                        href={`/projects/${project.slug}`}
                        className="w-fit rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80"
                      >
                        View Case Study
                      </Link>
                    )}
                    {project.links?.map((link) => (
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
                )}

                {project.comingSoon && (
                  <span className="flex w-fit items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background sm:hidden">
                    <Lock className="size-3.5" />
                    Coming soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
