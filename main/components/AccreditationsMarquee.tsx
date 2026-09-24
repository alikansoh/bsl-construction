"use client";

import { useState } from "react";

// Transparent PNG or SVG logos work best. Missing files are skipped automatically.
const LOGOS = [
  { name: "Gas Safe Register", src: "/gas-safe.png" },
  { name: "NICEIC Approved Contractor", src: "/niceic.png" },
  { name: "Checkatrade", src: "/check.png" },
  { name: "Vaillant", src: "/vaillant.jpg" },
  { name: "WRAS Approved", src: "/wras.webp" },
  {name:"houzz",src:"/houzz.png"}
];

function Logo({ name, src }: { name: string; src: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <li className="flex flex-none items-center gap-12 sm:gap-20">
      {/* Plain <img> so each logo keeps its own aspect ratio. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
        className="bsl-logo h-11 w-auto max-w-42.5 select-none object-contain sm:h-14 sm:max-w-52.5"
      />
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rotate-45 bg-[#A26028]/40"
      />
    </li>
  );
}

function LogoList({ hidden }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex items-center gap-12 pr-12 sm:gap-20 sm:pr-20"
    >
      {/* Listed twice so short lists still fill wide screens. */}
      {[...LOGOS, ...LOGOS].map((logo, i) => (
        <Logo key={`${logo.name}-${i}`} {...logo} />
      ))}
    </ul>
  );
}

export default function AccreditationsMarquee() {
  return (
    <section aria-label="Accreditations" className="relative py-10 md:py-14">
      <style>{`
        @keyframes bslMarquee {
          to { transform: translate3d(-50%, 0, 0); }
        }
        .bsl-marquee-track {
          animation: bslMarquee 45s linear infinite;
          will-change: transform;
        }
        .bsl-marquee:hover .bsl-marquee-track {
          animation-play-state: paused;
        }
        .bsl-logo {
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .bsl-logo:hover {
          transform: scale(1.08);
        }
        @media (prefers-reduced-motion: reduce) {
          .bsl-marquee-track { animation: none; }
        }
      `}</style>

      <div
        className="bsl-marquee relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        {/* Two identical halves so the loop is seamless; the copy is hidden from screen readers. */}
        <div className="bsl-marquee-track flex w-max py-4">
          <LogoList />
          <LogoList hidden />
        </div>
      </div>
    </section>
  );
}
