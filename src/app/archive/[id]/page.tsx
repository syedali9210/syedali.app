import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Figure } from "@/components/animations/Figure";
import { archive } from "@/content/archive";

const figures = archive.filter((a) => a.figure);

export const dynamicParams = false;

export function generateStaticParams() {
  return figures.map((a) => ({ id: a.id }));
}

// What the archive's stage shows in its frame, not a page anyone goes to.
export async function generateMetadata({ params }: PageProps<"/archive/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: figures.find((a) => a.id === id)?.title, robots: { index: false } };
}

export default async function Page({ params }: PageProps<"/archive/[id]">) {
  const { id } = await params;
  if (!figures.some((a) => a.id === id)) notFound();
  return <Figure id={id} />;
}
