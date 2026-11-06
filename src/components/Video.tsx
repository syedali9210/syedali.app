"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

/** A muted film that plays while it's on screen and pauses when it leaves. With reduced motion it waits for a click. */
export function Video({ src, poster, width, height, label, fill = false }: { src: string; poster: string; width: number; height: number; label: string; fill?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const paused = useRef(false); // the viewer paused it themselves

  useEffect(() => {
    const video = ref.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) paused.current = true;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !paused.current) video.play().catch(() => {});
        else if (!e.isIntersecting) video.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const video = ref.current!;
    paused.current = !video.paused;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <div className={fill ? "relative size-full" : "relative"}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={toggle}
        className={`block cursor-pointer ${fill ? "size-full object-cover" : "h-auto w-full"}`}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause the film" : "Play the film"}
        className="absolute right-3 bottom-3 grid size-11 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-[background-color,scale] duration-200 hover:bg-black/75 active:scale-95"
      >
        <Icon name={playing ? "pause" : "play"} size={16} />
      </button>
    </div>
  );
}
