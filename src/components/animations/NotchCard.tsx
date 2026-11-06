import DynamicInfoCard from "./DynamicInfoCard";

/** It hangs from the top edge of the frame, as a notch hangs from the top of a screen, with the room below to grow into. */
export default function NotchCard() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <DynamicInfoCard variant="embedded" />
      <p className="text-small text-label">
        <span className="[@media(pointer:fine)]:hidden">Tap the notch.</span>
        <span className="hidden [@media(pointer:fine)]:inline">Point at the notch.</span>
      </p>
    </div>
  );
}
