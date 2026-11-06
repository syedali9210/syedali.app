import { ICONS, type IconName } from "@/content/icons";

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" className={className}>
      <path d={ICONS[name]} />
    </svg>
  );
}
