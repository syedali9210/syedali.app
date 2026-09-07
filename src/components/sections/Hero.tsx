import Image from "next/image";
import { Briefcase, MapPin, Phone, Mail, Clock, type LucideIcon } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import LiveClock from "@/components/LiveClock";
import PetBuddyGreeting from "@/components/PetBuddyGreeting";
import PetBuddyPathHero from "@/components/PetBuddyPathHero";
import YappingAccordion from "@/components/YappingAccordion";
import { CopyButton } from "@/components/copy-button";
import { TextFlip } from "@/components/text-flip";
import { ThemeSwitcher } from "@/components/theme-switcher";

const DESIGNATIONS = [
  "Product designer",
  "The guy",
  "Pixel perfectionist",
  "cant work without my cold coffee",
];

const INFO_ITEMS: {
  icon: LucideIcon;
  label: string;
  href?: string;
  full?: boolean;
  copyText?: string;
}[] = [
  { icon: Briefcase, label: "Product Designer", href: undefined, full: true },
  { icon: MapPin, label: "Bengaluru, India", href: undefined },
  {
    icon: Phone,
    label: "+91 7765863700",
    href: "tel:+917765863700",
    copyText: "+91 7765863700",
  },
  {
    icon: Mail,
    label: "syedwali9286@gmail.com",
    href: "mailto:syedwali9286@gmail.com",
    copyText: "syedwali9286@gmail.com",
  },
];

const DOCK_COLUMN_A = {
  icons: [
    "/images/dock-icon-16.png",
    "/images/dock-icon-22.png",
    "/images/dock-icon-23.png",
    "/images/dock-icon-24.png",
    "/images/icon-notion.png",
    "/images/icon-paper.svg",
  ],
  shot: "/images/dock-shot-79.png",
};

const DOCK_COLUMN_C = {
  icons: [
    "/images/dock-icon-17.png",
    "/images/dock-icon-21.png",
    "/images/icon-github.svg",
    "/images/dock-icon-27.png",
    "/images/dock-icon-28.png",
    "/images/icon-supabase.svg",
  ],
  shots: ["/images/dock-shot-76.png", "/images/dock-shot-77.png", "/images/dock-shot-78.png"],
};

function DockIconRow({ icons }: { icons: string[] }) {
  return (
    <div className="grid shrink-0 grid-cols-3 gap-1 rounded-lg bg-secondary px-1.5 py-1.5 sm:gap-1.5 sm:rounded-xl sm:px-3 sm:py-3">
      {icons.map((src, i) => (
        <div
          key={i}
          className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-dock-tile p-1.5 shadow-[inset_0_0_20px_0_rgba(48,48,48,0.25)] sm:size-13 sm:rounded-lg sm:p-2.5"
        >
          <Image src={src} alt="" width={24} height={24} className="size-full object-contain" />
        </div>
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <section id="home" className="relative w-full py-12 sm:py-20">
      <PetBuddyPathHero />

      {/* Profile bar */}
      <FadeIn>
        <div className="screen-line-bottom mx-auto flex w-full max-w-[680px] flex-col">
          <div className="flex w-full flex-col px-4 sm:px-6">
            <div className="screen-line-bottom flex items-center gap-2 py-3">
              <div className="relative size-[47px] shrink-0 overflow-hidden rounded-full bg-card shadow-[inset_0_0_10px_0_#232323]">
                <Image src="/images/profile-avatar.jpg" alt="Syed Ali" fill sizes="47px" className="object-cover" />
              </div>
              <div className="flex flex-col justify-center self-stretch pr-4">
                <p className="text-xl font-medium text-foreground">Syed Ali</p>
                <span className="inline-grid text-base">
                  {/* Placeholder for the longest phrase keeps the row height/width stable. */}
                  <span className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden>
                    {DESIGNATIONS.reduce((a, b) => (a.length >= b.length ? a : b))}
                  </span>
                  <TextFlip className="col-start-1 row-start-1">
                    {DESIGNATIONS.map((phrase) => (
                      <span
                        key={phrase}
                        className="bg-gradient-to-b from-[#d97757] to-[#733f2e] bg-clip-text text-transparent"
                      >
                        {phrase}
                      </span>
                    ))}
                  </TextFlip>
                </span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <ThemeSwitcher />
              </div>
            </div>

            <div className="screen-line-bottom grid grid-cols-1 gap-x-4 gap-y-3 py-4 sm:grid-cols-2">
              {INFO_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-4 ${item.full ? "sm:col-span-2" : ""}`}
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary">
                    <item.icon size={16} className="text-muted-foreground" />
                  </div>
                  {item.href ? (
                    <a href={item.href} className="text-base text-foreground hover:underline">
                      {item.label}
                    </a>
                  ) : (
                    <p className="text-base text-foreground">{item.label}</p>
                  )}
                  {item.copyText && (
                    <CopyButton
                      className="relative -ml-2"
                      variant="ghost"
                      size="icon-xs"
                      text={item.copyText}
                    />
                  )}
                </div>
              ))}
              <div className="flex items-center gap-4">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary">
                  <Clock size={16} className="text-muted-foreground" />
                </div>
                <LiveClock />
              </div>
            </div>

            <div className="py-4">
              <p className="text-base text-muted-foreground">
                The guy who designs things and brings them to life, cuz why not. Engineering taught
                me to do things the unconventional way.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Dock + Yapping */}
      <div className="screen-line-top screen-line-bottom mx-auto w-full max-w-[680px]">
        <div className="grid grid-cols-3 gap-2 px-4 py-8 sm:gap-6 sm:px-6">
          <FadeIn delay={0.05} className="flex flex-col gap-1.5 sm:gap-3">
            <DockIconRow icons={DOCK_COLUMN_A.icons} />
            <div className="aspect-[8/5] w-full overflow-hidden rounded-lg bg-secondary p-1.5 sm:rounded-xl sm:p-3">
              <div className="relative h-full w-full overflow-hidden rounded-md shadow-[inset_0_0_33px_0_rgba(48,48,48,0.25)] sm:rounded-[14px]">
                <Image
                  src={DOCK_COLUMN_A.shot}
                  alt="Framer workspace screenshot"
                  fill
                  sizes="(min-width: 640px) 213px, 30vw"
                  className="object-cover"
                />
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0} className="flex flex-col gap-1.5 sm:gap-3">
            <div className="flex flex-col gap-1.5 rounded-lg bg-secondary p-1.5 sm:gap-3 sm:rounded-xl sm:p-3">
              <Image src="/images/window-controls-active.svg" alt="" width={46} height={10} className="w-6 sm:w-[46px]" />
              <div className="flex gap-1.5 sm:gap-3">
                <div className="relative aspect-[200/230] w-full overflow-hidden rounded-md shadow-[inset_0_0_33px_0_rgba(48,48,48,0.25)] sm:rounded-xl">
                  <Image
                    src="/images/dock-shot-80.png"
                    alt="FigJam board screenshot"
                    fill
                    sizes="(min-width: 640px) 213px, 30vw"
                    className="object-cover"
                  />
                </div>
                <div className="hidden w-24 shrink-0 flex-col gap-3 sm:flex">
                  <div className="flex min-h-[100px] flex-1 items-center justify-center overflow-hidden rounded-md bg-secondary shadow-[inset_0_0_33px_0_rgba(48,48,48,0.25)]">
                    <PetBuddyGreeting text="Hii!" size={48} />
                  </div>
                  <div className="flex-1 rounded-md bg-secondary shadow-[inset_0_0_33px_0_rgba(48,48,48,0.25)]" />
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="flex flex-col gap-1.5 sm:gap-3">
            <DockIconRow icons={DOCK_COLUMN_C.icons} />
            <div className="flex aspect-[8/5] w-full gap-1 overflow-hidden rounded-lg bg-secondary p-1.5 sm:gap-2 sm:rounded-xl sm:p-3">
              <div className="relative h-full w-2/3 overflow-hidden rounded-md shadow-[inset_0_0_33px_0_rgba(48,48,48,0.25)] sm:rounded-lg">
                <Image
                  src={DOCK_COLUMN_C.shots[0]}
                  alt="Antigravity IDE screenshot"
                  fill
                  sizes="(min-width: 640px) 142px, 20vw"
                  className="object-cover"
                />
              </div>
              <div className="flex h-full w-1/3 flex-col gap-1 sm:gap-1.5">
                <div className="relative flex-1 overflow-hidden rounded shadow-[inset_0_0_33px_0_rgba(48,48,48,0.25)]">
                  <Image
                    src={DOCK_COLUMN_C.shots[1]}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 71px, 10vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative flex-1 overflow-hidden rounded shadow-[inset_0_0_33px_0_rgba(48,48,48,0.25)]">
                  <Image
                    src={DOCK_COLUMN_C.shots[2]}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 71px, 10vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Yapping — runs edge-to-edge within the dock box, matching Figma (no horizontal inset) */}
        <YappingAccordion />
      </div>
    </section>
  );
}
