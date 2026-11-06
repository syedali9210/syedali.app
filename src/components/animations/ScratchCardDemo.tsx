import DynamicInfoCard from "./DynamicInfoCard";
import ScratchCard from "./ScratchCard";

/** Scratch the foil off, then point at what's under it: the notch card. */
export default function ScratchCardDemo() {
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <ScratchCard
        caption="Scratch to reveal"
        reveal={
          <div className="relative h-full w-full">
            <div className="relative w-full origin-top scale-[0.85] pt-6">
              <DynamicInfoCard variant="embedded" />
            </div>
          </div>
        }
      />
    </div>
  );
}
