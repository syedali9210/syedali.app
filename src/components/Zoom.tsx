"use client";

import { useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

/**
 * A screen you can open full size: the real UI is dense, so a press opens it over the page at the size it was captured, sharp.
 * Esc, the close button or a press outside it shuts it. The big picture is only fetched once it's opened, and with a `dark` capture
 * only the one matching the site's theme (the other is display: none, and lazy).
 */
export function Zoom({ src, dark, alt, width, height, children }: { src: string; dark?: string; alt: string; width: number; height: number; children: ReactNode }) {
  const box = useRef<HTMLDialogElement>(null);
  const [seen, setSeen] = useState(false);
  const close = () => box.current?.close();

  return (
    <>
      <button
        type="button"
        className="zoom-in"
        aria-label={`Open full size: ${alt}`}
        onClick={() => {
          setSeen(true);
          box.current?.showModal();
        }}
      >
        {children}
      </button>
      <dialog ref={box} className="zoom-box" aria-label={alt} onClick={(e) => e.target === e.currentTarget && close()}>
        {seen &&
          (dark ? [[src, "pic-light"], [dark, "pic-dark"]] : [[src, undefined]]).map(([file, theme]) => (
            // eslint-disable-next-line @next/next/no-img-element -- the file as captured, at full size: no resizing wanted here
            <img key={file} src={file} alt={alt} width={width} height={height} className={theme} loading={dark ? "lazy" : undefined} decoding="async" onClick={close} />
          ))}
        <button type="button" className="zoom-close" aria-label="Close" onClick={close}>
          <Icon name="close" size={16} />
        </button>
      </dialog>
    </>
  );
}
