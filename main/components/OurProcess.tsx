"use client";

/**
 * OurProcess.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * "Our Process" — a step-by-step section extending the visual language of
 * Projects.tsx / WhyChooseUs.tsx (#1C1712 / #6E6259 / #A26028 / #E8C599,
 * Fraunces serif, warm ivory panels, blueprint dot-grid).
 *
 * WHAT CHANGED IN THIS PASS
 * - Removed every raster image dependency (/visit.png, /planning.png,
 *   /build.avif, /maintenance.png). Each stage's artwork is now a
 *   hand-drawn, brass-stroke line icon — set inside a struck brass
 *   medallion that reuses the exact conic-gradient ring + radial-gradient
 *   disc technique already built for the rail marker, so the icon, the
 *   numeral, and the marker now visibly read as one metal/drafting
 *   language instead of three unrelated devices.
 * - Because the icons are vector paths rather than photos, they can be
 *   *drawn on*: each icon's strokes are traced in from 0 → 100% length
 *   right after the medallion's stamp-punch lands, like a line being
 *   inked onto a plate. This is a genuinely new animation beat, not a
 *   reskin of the old img-scale hover.
 * - Added a hairline brass gradient accent along the top edge of each
 *   card, echoing the underline beneath the section heading, so the
 *   card itself gets a quiet signature detail rather than being a plain
 *   white box.
 * - Card hover now lifts the whole medallion (scale) instead of scaling
 *   an <img>; rail marker, card flip-in, and numeral drop/tally/gleam
 *   are unchanged from the previous pass.
 *
 * SIGNATURE ELEMENT — the engraved numeral drop + count + gleam
 * - On scroll-into-view, the numeral drops from above with a heavy
 *   elastic settle, while its digits mechanically tally from 00 up to
 *   the real step number (01/02/03/04) — like an old tally/odometer
 *   counter clicking over. The instant it lands, a single warm gleam
 *   sweeps across the brass gradient, as though light had just caught a
 *   freshly struck plate. This runs once per card, independent of the
 *   rail and icon animations, so all four cards feel considered rather
 *   than uniform.
 *
 * FOUR DISTINCT GSAP ANIMATIONS
 *   1. Card reveal — each stage panel flips in with real 3D (rotateY +
 *      perspective + translateZ), alternating hinge side left/right to
 *      match the zig-zag layout, once on scroll-into-view.
 *   2. Rail marker — a single scroll-scrubbed animation that moves the
 *      brass marker from 0% to 100% down the rail across the full
 *      timeline's scroll range (continuous, not once-only).
 *   3. Medallion stamp + icon trace — the medallion punches in
 *      (rotateX + scale, once per card), then each stroke of its line
 *      icon draws itself in from 0 → full length, as if freshly
 *      engraved into the plate.
 *   4. Numeral drop + tally + gleam — the signature move described
 *      above, firing once as that stage's card enters view.
 *
 * CONTENT
 * - Four stages, taken directly from the client's own "Our Process" copy:
 *   Consultation & Site Visit, Planning & Quotation, Build & Project
 *   Management, Completion & Aftercare. Descriptions are lightly tightened
 *   for on-screen length but preserve the client's own claims and voice —
 *   nothing has been invented.
 *
 * ICONS
 * - All four icons are original inline SVGs drawn for this section
 *   (hard hat / blueprint-and-page / mallet / key) — no external image
 *   files, no icon library. Stroke-only, single brass color, so they sit
 *   quietly inside the medallion rather than competing with it.
 * - Custom section cursor (/images/cursor-pencil.png) is unrelated
 *   decorative chrome, not content artwork, and is left as-is.
 *
 * SEO
 * - Single <h2> with four <h3> stage headings, no skipped levels. The
 *   large numeral and the stage icon are both decorative and
 *   aria-hidden; "Step 0X" plus the stage heading carry the equivalent
 *   information for assistive tech.
 * - A minimal HowTo JSON-LD block is included since this content really
 *   is a step-by-step process. Placeholder fields are marked TODO — merge
 *   with any existing structured data rather than duplicating.
 *
 * ACCESSIBILITY / PERFORMANCE
 * - `prefers-reduced-motion: reduce` disables all transform/count/gleam/
 *   trace animation; numerals render their final digits immediately,
 *   icon strokes render fully drawn immediately, and the rail marker is
 *   hidden (its motion is the whole point of it, so a static mid-rail
 *   dot would be misleading rather than helpful).
 * - Rail + travelling marker are desktop-only (`lg:` and up); on mobile
 *   the numbered cards still flip in individually, just without the rail.
 * - The custom cursor is desktop/fine-pointer only (`@media (hover: hover)
 *   and (pointer: fine)`) — touch devices never see it, since there's no
 *   cursor to replace there anyway.
 * - Implemented with `gsap.matchMedia()` so behaviour is cleanly torn
 *   down on breakpoint change / unmount, matching the pattern used
 *   elsewhere on the site.
 *
 * DEPENDENCY: requires `gsap` (npm install gsap).
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type StageIcon = "siteVisit" | "planning" | "build" | "completion";

type Stage = {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: StageIcon;
};

// Copy sourced from the client's own "Our Process" section — tightened
// for on-screen length, nothing added that wasn't already claimed.
const STAGES: Stage[] = [
  {
    id: "consultation",
    number: "01",
    title: "Consultation & Site Visit",
    description:
      "We start by getting to know you, your space, and your goals — understanding your priorities and any challenges up front. Then we visit the site in person, assess the work required, and gather everything we need to prepare a clear, accurate proposal built around your vision.",
    icon: "siteVisit",
  },
  {
    id: "planning",
    number: "02",
    title: "Planning & Quotation",
    description:
      "You receive a detailed quote and timeline outlining exactly what's included, how long it will take, and when each phase happens. No vague promises — just clear expectations and full transparency before any work begins.",
    icon: "planning",
  },
  {
    id: "build",
    number: "03",
    title: "Build & Project Management",
    description:
      "Our experienced team gets to work, handling every trade and keeping the site safe, clean, and on schedule. You'll receive regular updates throughout, and we're always available to answer questions or adjust plans as needed.",
    icon: "build",
  },
  {
    id: "completion",
    number: "04",
    title: "Completion & Aftercare",
    description:
      "We walk through everything together and don't sign off until you're 100% satisfied. We're still here after handover, should anything need attention — every project includes our aftercare support for full peace of mind.",
    icon: "completion",
  },
];

// TODO: replace placeholder url/image, and merge with any existing
// structured data rather than emitting a second, competing block.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "The BSL Construction Renovation Process",
  description:
    "How BSL Construction takes a renovation project from first consultation through to completion and aftercare.",
  step: STAGES.map((s) => ({
    "@type": "HowToStep",
    name: s.title,
    text: s.description,
  })),
};

/**
 * Original line-art strokes for each stage, drawn on a 24x24 grid.
 * Every element is a plain SVG geometry primitive (path/line/rect/circle)
 * so it exposes `getTotalLength()`, which the trace-in animation relies on.
 */
function StageIconPaths({ icon }: { icon: StageIcon }) {
  switch (icon) {
    case "siteVisit":
      return (
        <>
          <path d="M4 16C4 10.5 7.5 7 12 7C16.5 7 20 10.5 20 16" />
          <line x1="2" y1="16" x2="22" y2="16" />
          <line x1="12" y1="7" x2="12" y2="4" />
          <line x1="7.5" y1="12" x2="16.5" y2="12" />
        </>
      );
    case "planning":
      return (
        <>
          <path d="M6 3H14L18 7V21H6Z" />
          <path d="M14 3V7H18" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
          <line x1="9" y1="18" x2="13" y2="18" />
        </>
      );
    case "build":
      return (
        <>
          <rect x="7" y="4" width="10" height="4" rx="2" />
          <line x1="12" y1="8" x2="12" y2="19" />
          <line x1="9" y1="16" x2="15" y2="16" />
        </>
      );
    case "completion":
      return (
        <>
          <circle cx="8" cy="8" r="3.5" />
          <line x1="10.5" y1="10.5" x2="19" y2="19" />
          <line x1="15" y1="15" x2="17" y2="13" />
          <line x1="17.5" y1="17.5" x2="19.5" y2="15.5" />
        </>
      );
  }
}

/** Type guard so we only ever call getTotalLength() on elements that have it. */
function isGeometryElement(
  el: Element
): el is Element & { getTotalLength: () => number } {
  return typeof (el as { getTotalLength?: unknown }).getTotalLength === "function";
}

function getDrawableShapes(svg: SVGSVGElement) {
  return Array.from(svg.querySelectorAll("path, line, circle, rect, polyline")).filter(
    isGeometryElement
  );
}

export default function OurProcess() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLOListElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<HTMLDivElement | null>(null);
  const markerCoreRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs = useRef<(SVGSVGElement | null)[]>([]);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const list = listRef.current;
    if (!section || !list) return;

    const cards = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    const badges = badgeRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    const numbers = numberRefs.current.filter((el): el is HTMLSpanElement => Boolean(el));
    if (cards.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        reduceMotion: "(prefers-reduced-motion: reduce)",
        isDesktop: "(min-width: 1024px)",
      },
      (context) => {
        const { reduceMotion, isDesktop } = context.conditions as {
          reduceMotion: boolean;
          isDesktop: boolean;
        };

        const triggers: ScrollTrigger[] = [];

        // ---- Initial states
        cards.forEach((card, i) => {
          const fromLeft = i % 2 === 0;
          gsap.set(card, {
            opacity: reduceMotion ? 1 : 0,
            rotateY: reduceMotion ? 0 : fromLeft ? -62 : 62,
            x: reduceMotion || !isDesktop ? 0 : fromLeft ? -36 : 36,
            z: reduceMotion ? 0 : -60,
            transformOrigin: fromLeft ? "left center" : "right center",
          });
        });
        gsap.set(badges, { rotateX: 0, scale: 1 });

        // Icon strokes: hidden behind their own length so the trace-in
        // reads as ink being drawn rather than a fade.
        iconRefs.current.forEach((svg) => {
          if (!svg) return;
          getDrawableShapes(svg).forEach((shape) => {
            const len = shape.getTotalLength();
            gsap.set(shape, {
              strokeDasharray: len,
              strokeDashoffset: reduceMotion ? 0 : len,
            });
          });
        });

        // Engraved numeral: starts lifted, tilted and oversized, ready to
        // drop and "stamp" down; digits reset to 00 so the tally-up reads
        // as a real count rather than a fade.
        gsap.set(numbers, {
          opacity: reduceMotion ? 1 : 0,
          y: reduceMotion ? 0 : -46,
          scale: reduceMotion ? 1 : 1.32,
          rotate: reduceMotion ? 0 : -7,
          backgroundPositionX: reduceMotion ? "40%" : "165%",
        });
        if (!reduceMotion) {
          numbers.forEach((el) => {
            el.textContent = "00";
          });
        }

        if (railRef.current && markerRef.current) {
          gsap.set(railRef.current, { opacity: reduceMotion || !isDesktop ? 0 : 1 });
          gsap.set(markerRef.current, { top: "0%", opacity: reduceMotion || !isDesktop ? 0 : 1 });
        }

        // ---- ANIMATION 1: per-card 3D flip reveal, once on scroll-into-view
        cards.forEach((card, i) => {
          const t = ScrollTrigger.create({
            trigger: card,
            start: "top 82%",
            once: true,
            onEnter: () => {
              gsap.to(card, {
                opacity: 1,
                rotateY: 0,
                x: 0,
                z: 0,
                duration: reduceMotion ? 0.01 : 0.95,
                ease: "power3.out",
              });

              // ---- ANIMATION 3a: medallion "stamp" punch, timed just
              // behind the card's own reveal.
              const badge = badges[i];
              if (badge) {
                gsap.fromTo(
                  badge,
                  { rotateX: reduceMotion ? 0 : 90, scale: reduceMotion ? 1 : 0.6 },
                  {
                    rotateX: 0,
                    scale: 1,
                    duration: reduceMotion ? 0.01 : 0.5,
                    ease: "back.out(3)",
                    delay: reduceMotion ? 0 : 0.28,
                  }
                );
              }

              // ---- ANIMATION 3b: icon strokes trace in right after the
              // medallion lands, like lines being engraved into the plate.
              const iconSvg = iconRefs.current[i];
              if (iconSvg && !reduceMotion) {
                getDrawableShapes(iconSvg).forEach((shape, shapeIndex) => {
                  gsap.to(shape, {
                    strokeDashoffset: 0,
                    duration: 0.55,
                    ease: "power2.out",
                    delay: 0.5 + shapeIndex * 0.05,
                  });
                });
              }

              // ---- ANIMATION 4: engraved numeral — drop, tally 00 → 0X,
              // then a single gleam sweeps across the brass gradient the
              // instant it lands, like light catching a freshly struck plate.
              const numEl = numbers[i];
              if (numEl) {
                const targetLabel = STAGES[i].number;
                const targetVal = parseInt(targetLabel, 10);

                gsap.to(numEl, {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  rotate: 0,
                  duration: reduceMotion ? 0.01 : 0.62,
                  ease: "back.out(2.3)",
                  delay: reduceMotion ? 0 : 0.08,
                });

                if (!reduceMotion) {
                  const tally = { val: 0 };
                  gsap.to(tally, {
                    val: targetVal,
                    duration: 0.62,
                    delay: 0.08,
                    ease: "power1.out",
                    onUpdate: () => {
                      numEl.textContent = String(Math.round(tally.val)).padStart(2, "0");
                    },
                    onComplete: () => {
                      numEl.textContent = targetLabel;
                      gsap.fromTo(
                        numEl,
                        { backgroundPositionX: "165%" },
                        { backgroundPositionX: "-65%", duration: 0.85, ease: "power2.inOut" }
                      );
                    },
                  });
                }
              }
            },
          });
          triggers.push(t);
        });

        // ---- ANIMATION 2: travelling brass marker, scrubbed down the
        // rail across the full list's scroll range. Desktop only.
        if (isDesktop && !reduceMotion && railRef.current && markerRef.current) {
          const railTrigger = ScrollTrigger.create({
            trigger: list,
            start: "top 60%",
            end: "bottom 55%",
            scrub: 0.6,
            onUpdate: (self) => {
              gsap.set(markerRef.current, { top: `${self.progress * 100}%` });
            },
          });
          triggers.push(railTrigger);

          // Ambient idle wobble on the marker's inner core only, so it
          // doesn't fight the scrub-driven `top` on the outer element.
          if (markerCoreRef.current) {
            gsap.to(markerCoreRef.current, {
              rotateZ: 8,
              duration: 1.8,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });
          }
        }

        return () => {
          triggers.forEach((t) => t.kill());
        };
      }
    );

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="our-process-heading"
      className="bsl-process-cursor bg-[#FBF9F6] px-5 py-16 lg:px-8 lg:py-24"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        .bsl-serif { font-family: 'Fraunces', 'Iowan Old Style', 'Palatino Linotype', Palatino, serif; }
        .bsl-blueprint-grid {
          background-image: radial-gradient(circle, rgba(28,23,18,0.07) 1px, transparent 1px);
          background-size: 22px 22px;
        }
        .bsl-rail-tick::before {
          content: "";
          position: absolute;
          left: 50%;
          width: 11px;
          height: 1px;
          background: rgba(28,23,18,0.22);
          transform: translateX(-50%);
        }

        /* Construction-themed custom cursor: a brand-coloured carpenter's
           pencil stands in for the system arrow anywhere in this section.
           Fine-pointer devices only — touch has no cursor to replace. */
        @media (hover: hover) and (pointer: fine) {
          .bsl-process-cursor,
          .bsl-process-cursor * {
            cursor:
              image-set(
                url('/images/cursor-pencil.png') 1x,
                url('/images/cursor-pencil@2x.png') 2x
              ) 42 43,
              url('/images/cursor-pencil.png') 42 43,
              auto;
          }
        }

        .bsl-stage-card {
          position: relative;
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.35s ease;
        }
        .bsl-stage-badge {
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (hover: hover) and (pointer: fine) {
          .bsl-stage-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 22px 40px -24px rgba(28, 23, 18, 0.28);
            border-color: rgba(162, 96, 40, 0.28);
          }
          .bsl-stage-card:hover .bsl-stage-badge {
            transform: scale(1.07);
          }
          .bsl-stage-card:hover .bsl-corner-mark {
            opacity: 0.55;
          }
        }

        /* The engraved brass numeral — the section's signature element.
           A metallic gradient clipped to the digits themselves, swept by
           a single gleam once the tally-up lands. */
        .bsl-process-number {
          display: inline-block;
          line-height: 0.9;
          background-image: linear-gradient(
            115deg,
            #7c4a1e 0%,
            #a26028 20%,
            #e8c599 42%,
            #fff6e6 50%,
            #e8c599 58%,
            #a26028 80%,
            #7c4a1e 100%
          );
          background-size: 280% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.55)) drop-shadow(0 8px 14px rgba(28, 23, 18, 0.22));
          font-variant-numeric: tabular-nums;
          will-change: transform, background-position;
        }

        /* Blueprint registration marks — quiet corner brackets echoing the
           dimension-line rail and dot-grid backdrop. */
        .bsl-corner-mark {
          position: absolute;
          width: 14px;
          height: 14px;
          opacity: 0.3;
          pointer-events: none;
          transition: opacity 0.35s ease;
        }
        .bsl-corner-mark--tl {
          top: 10px;
          left: 10px;
          border-top: 1.5px solid #a26028;
          border-left: 1.5px solid #a26028;
        }
        .bsl-corner-mark--br {
          bottom: 10px;
          right: 10px;
          border-bottom: 1.5px solid #a26028;
          border-right: 1.5px solid #a26028;
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />

      <div className="mx-auto max-w-[1180px] min-[1440px]:max-w-[1360px]">
        <header className="mx-auto mb-14 max-w-[680px] text-center lg:mb-20">
          <span className="mb-3 inline-flex items-center justify-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#A26028]">
            <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
            Our Process
            <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
          </span>
          <h2
            id="our-process-heading"
            className="bsl-serif mb-3 text-[clamp(2rem,4.2vw,3rem)] font-medium leading-[1.1] tracking-[-0.01em] text-[#1C1712]"
          >
            From First Visit To Final Handover
          </h2>
          <p className="text-[clamp(0.95rem,1.6vw,1.05rem)] leading-[1.6] text-[#6E6259]">
            Four stages, no vague promises — every BSL Construction project moves through the same
            disciplined process, so you always know exactly where things stand.
          </p>
          <span
            aria-hidden="true"
            className="mx-auto mt-5 block h-[3px] w-16 rounded-full"
            style={{ background: "linear-gradient(90deg, #8A5121, #E8C599, #A26028)" }}
          />
        </header>

        <div className="relative">
          {/* Blueprint dot-grid backdrop, consistent with the rest of the site. */}
          <div
            aria-hidden="true"
            className="bsl-blueprint-grid pointer-events-none absolute -inset-6 -z-10 opacity-60"
          />

          {/* Surveyor's rail — desktop only. A dashed dimension line with
              ruler ticks and the travelling brass marker. */}
          <div
            ref={railRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 bottom-0 hidden w-px -translate-x-1/2 border-l border-dashed border-[#1C1712]/20 lg:block"
          >
            {[0, 25, 50, 75, 100].map((pct) => (
              <span key={pct} className="bsl-rail-tick absolute" style={{ top: `${pct}%` }} />
            ))}
            <div
              ref={markerRef}
              className="absolute left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full p-[2.5px]"
              style={{
                background:
                  "conic-gradient(from 200deg, #8A5121, #E8C599 25%, #A26028 55%, #E8C599 80%, #8A5121)",
                boxShadow: "0 10px 18px -8px rgba(162,96,40,0.55), 0 2px 4px rgba(28,23,18,0.18)",
              }}
            >
              <div
                ref={markerCoreRef}
                className="flex h-full w-full items-center justify-center rounded-full"
                style={{ background: "radial-gradient(circle at 34% 30%, #F3D9AE, #A26028 68%, #8A5121)" }}
              >
                <span className="block h-1.5 w-1.5 rounded-full bg-[#FBF9F6]" />
              </div>
            </div>
          </div>

          <ol ref={listRef} className="relative flex flex-col gap-10 lg:gap-14">
            {STAGES.map((stage, i) => {
              const fromLeft = i % 2 === 0;
              return (
                <li
                  key={stage.id}
                  className={`flex lg:w-1/2 ${fromLeft ? "lg:justify-self-start" : "lg:ml-auto lg:justify-self-end"}`}
                  style={{ perspective: "1500px" }}
                >
                  <div
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className="bsl-stage-card relative w-full overflow-hidden rounded-2xl bg-white p-7 pt-8 ring-1 ring-[#1C1712]/[0.06] shadow-[0_1px_2px_rgba(28,23,18,0.05)] lg:p-8 lg:pt-9"
                    style={{ willChange: "transform" }}
                  >
                    {/* Hairline brass accent along the top edge — a quiet
                        echo of the underline beneath the section heading. */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-7 top-0 h-[2px] rounded-full lg:inset-x-8"
                      style={{
                        background: "linear-gradient(90deg, transparent, #A26028 50%, transparent)",
                        opacity: 0.4,
                      }}
                    />

                    <span aria-hidden="true" className="bsl-corner-mark bsl-corner-mark--tl" />
                    <span aria-hidden="true" className="bsl-corner-mark bsl-corner-mark--br" />

                    {/* Numeral + icon duo — the card's signature header row.
                        The numeral drops, tallies up, and gleams once on
                        entry; the medallion punches in a beat behind it and
                        its icon then traces itself in stroke by stroke. */}
                    <div className="mb-5 flex items-center gap-4 lg:gap-5">
                      <span
                        ref={(el) => {
                          numberRefs.current[i] = el;
                        }}
                        aria-hidden="true"
                        className="bsl-process-number bsl-serif shrink-0 select-none text-[3.2rem] font-semibold lg:text-[3.9rem]"
                        style={{ transformOrigin: "left center" }}
                      >
                        {stage.number}
                      </span>

                      <span aria-hidden="true" className="h-10 w-px shrink-0 bg-[#1C1712]/[0.08] lg:h-12" />

                      {/* Struck brass medallion — same conic-gradient ring +
                          radial-gradient disc as the rail marker, so the
                          icon reads as part of the same metal system. */}
                      <div
                        ref={(el) => {
                          badgeRefs.current[i] = el;
                        }}
                        aria-hidden="true"
                        className="bsl-stage-badge relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full p-[2.5px] lg:h-[4.5rem] lg:w-[4.5rem]"
                        style={{
                          background:
                            "conic-gradient(from 200deg, #8A5121, #E8C599 25%, #A26028 55%, #E8C599 80%, #8A5121)",
                          boxShadow: "0 10px 20px -10px rgba(162,96,40,0.4), 0 2px 4px rgba(28,23,18,0.16)",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <div
                          className="flex h-full w-full items-center justify-center rounded-full"
                          style={{
                            background: "radial-gradient(circle at 32% 28%, #FFF9EF, #F3E4CC 68%, #E8D3AC)",
                            boxShadow:
                              "inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -3px 6px rgba(28,23,18,0.1)",
                          }}
                        >
                          <svg
                            ref={(el) => {
                              iconRefs.current[i] = el;
                            }}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#7C4A1E"
                            strokeWidth={1.6}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-8 w-8 lg:h-9 lg:w-9"
                          >
                            <StageIconPaths icon={stage.icon} />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <span className="mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#A26028]">
                      Step {stage.number}
                    </span>
                    <h3 className="bsl-serif mb-2.5 text-[1.2rem] font-medium leading-snug text-[#1C1712]">
                      {stage.title}
                    </h3>
                    <p className="text-[0.92rem] leading-[1.7] text-[#6E6259]">{stage.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}