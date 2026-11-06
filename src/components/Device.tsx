import type { ReactNode } from "react";

/**
 * The two devices, drawn as the real things (styles in globals.css): a phone with its metal band, black bezel, island
 * and side keys; a laptop with its notch and machined base. The screen is whatever goes inside.
 */
export function Device({ frame, children }: { frame: "phone" | "screen"; children: ReactNode }) {
  if (frame === "phone")
    return (
      <div className="iphone">
        <span className="iphone-key top-[15%] left-[-1.1%] h-[4%]" />
        <span className="iphone-key top-[22%] left-[-1.1%] h-[7.5%]" />
        <span className="iphone-key top-[31%] left-[-1.1%] h-[7.5%]" />
        <span className="iphone-key top-[24%] right-[-1.1%] h-[11%]" />
        <div className="iphone-bezel">
          <div className="iphone-glass">
            {children}
            <span className="iphone-island" />
          </div>
        </div>
      </div>
    );
  return (
    <div className="laptop">
      <div className="laptop-lid">
        <span className="laptop-notch" aria-hidden="true" />
        {children}
      </div>
      <div className="laptop-base" aria-hidden="true" />
    </div>
  );
}
