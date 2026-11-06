/**
 * The page as paper: a vellum fibre and a fine grain that drifts, both multiplied over the sheet (Bill Guo's page is
 * four such layers). They're noise drawn by the browser from a few bytes of SVG, so they cost nothing to load. With
 * them, the ink filters: "print" gives type the faint unevenness of letterpress; "swap" is the bleed a word goes
 * through when it changes face (InkWord drives its displacement).
 */
export function Paper() {
  return (
    <>
      <div className="paper" aria-hidden="true">
        <span className="paper-vellum" />
        <span className="paper-grain" />
      </div>
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <defs>
          <filter id="ink-print" x="-5%" y="-10%" width="110%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="grain" />
            <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="edged" />
            <feComponentTransfer in="grain" result="pits">
              <feFuncA type="linear" slope="18" intercept="-15.6" />
            </feComponentTransfer>
            <feComposite in="edged" in2="pits" operator="out" />
          </filter>
          <filter id="ink-swap" x="-10%" y="-30%" width="120%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.06 0.9" numOctaves="2" seed="3" result="smear" />
            <feDisplacementMap id="ink-swap-map" in="SourceGraphic" in2="smear" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </>
  );
}
