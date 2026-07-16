"use client";

/**
 * OurProcess.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * "Our Process" — a step-by-step section extending the visual language of
 * Projects.tsx / WhyChooseUs.tsx (#1C1712 / #6E6259 / #A26028 / #E8C599,
 * Fraunces serif, warm ivory panels, blueprint dot-grid).
 *
 * WHAT CHANGED IN THIS PASS
 * - The stage numeral is no longer a faint background watermark. It's now
 *   the section's signature move: a bold engraved-brass numeral, milled
 *   from the same metal language as the rail marker, that free-falls into
 *   place, counts up from 00 like a mechanical tally counter, and then
 *   catches the light with a single sweeping gleam — as if a stamp had
 *   just struck the plate. It now sits front-and-centre next to the icon,
 *   not hidden behind the copy.
 * - Added quiet blueprint "registration marks" (corner brackets) on each
 *   card, echoing the dimension-line rail and dot-grid backdrop so the
 *   whole section reads as one consistent drafting-table system.
 * - Added a brass gradient underline beneath the section heading.
 * - Card hover state, icon stamp, and rail marker are unchanged from the
 *   previous pass; icons remain un-badged, artwork-forward.
 *
 * SIGNATURE ELEMENT — the engraved numeral drop + count + gleam
 * - On scroll-into-view, the numeral drops from above with a heavy
 *   elastic settle, while its digits mechanically tally from 00 up to
 *   the real step number (01/02/03/04) — like an old tally/odometer
 *   counter clicking over. The instant it lands, a single warm gleam
 *   sweeps across the brass gradient, as though light had just caught a
 *   freshly struck plate. This runs once per card, independent of the
 *   rail and icon-stamp animations, so all four cards feel considered
 *   rather than uniform.
 *
 * FOUR DISTINCT GSAP ANIMATIONS
 *   1. Card reveal — each stage panel flips in with real 3D (rotateY +
 *      perspective + translateZ), alternating hinge side left/right to
 *      match the zig-zag layout, once on scroll-into-view.
 *   2. Rail marker — a single scroll-scrubbed animation that moves the
 *      brass marker from 0% to 100% down the rail across the full
 *      timeline's scroll range (continuous, not once-only).
 *   3. Stage stamp — a short rotateX "punch" + scale pop on each stage's
 *      icon, firing once as that stage's card enters view.
 *   4. Numeral drop + tally + gleam — the new signature move described
 *      above, firing once as that stage's card enters view.
 *
 * CONTENT
 * - Four stages, taken directly from the client's own "Our Process" copy:
 *   Consultation & Site Visit, Planning & Quotation, Build & Project
 *   Management, Completion & Aftercare. Descriptions are lightly tightened
 *   for on-screen length but preserve the client's own claims and voice —
 *   nothing has been invented.
 *
 * SEO
 * - Single <h2> with four <h3> stage headings, no skipped levels. The
 *   large numeral is decorative and aria-hidden; "Step 0X" carries the
 *   equivalent information for assistive tech.
 * - A minimal HowTo JSON-LD block is included since this content really
 *   is a step-by-step process. Placeholder fields are marked TODO — merge
 *   with any existing structured data rather than duplicating.
 *
 * ACCESSIBILITY / PERFORMANCE
 * - `prefers-reduced-motion: reduce` disables all transform/count/gleam
 *   animation; numerals render their final digits immediately and the
 *   rail marker is hidden (its motion is the whole point of it, so a
 *   static mid-rail dot would be misleading rather than helpful).
 * - Rail + travelling marker are desktop-only (`lg:` and up); on mobile
 *   the numbered cards still flip in individually, just without the rail.
 * - The custom cursor is desktop/fine-pointer only (`@media (hover: hover)
 *   and (pointer: fine)`) — touch devices never see it, since there's no
 *   cursor to replace there anyway.
 * - Implemented with `gsap.matchMedia()` so behaviour is cleanly torn
 *   down on breakpoint change / unmount, matching the pattern used
 *   elsewhere on the site.
 *
 * ASSETS
 * - /visit.png        — Consultation & Site Visit
 * - /planning.png      — Planning & Quotation
 * - /build.avif        — Build & Project Management
 * - /maintenance.png   — Completion & Aftercare
 * - /images/cursor-pencil.png (+ @2x) — custom section cursor
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

type Stage = {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string;
  iconAlt: string;
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
    icon: "/visit.png",
    iconAlt: "Hard hat icon representing an on-site consultation visit",
  },
  {
    id: "planning",
    number: "02",
    title: "Planning & Quotation",
    description:
      "You receive a detailed quote and timeline outlining exactly what's included, how long it will take, and when each phase happens. No vague promises — just clear expectations and full transparency before any work begins.",
    icon: "/planning.png",
    iconAlt: "Blueprint document icon representing the project quote and timeline",
  },
  {
    id: "build",
    number: "03",
    title: "Build & Project Management",
    description:
      "Our experienced team gets to work, handling every trade and keeping the site safe, clean, and on schedule. You'll receive regular updates throughout, and we're always available to answer questions or adjust plans as needed.",
    icon: "/build.avif",
    iconAlt: "Hammer icon representing hands-on construction work",
  },
  {
    id: "completion",
    number: "04",
    title: "Completion & Aftercare",
    description:
      "We walk through everything together and don't sign off until you're 100% satisfied. We're still here after handover, should anything need attention — every project includes our aftercare support for full peace of mind.",
    icon: "/maintenance.png",
    iconAlt: "Key icon representing project handover",
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

export default function OurProcess() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLOListElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<HTMLDivElement | null>(null);
  const markerCoreRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);
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
        gsap.set(badges, { rotateX: reduceMotion ? 0 : 0, scale: 1 });

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

              // ---- ANIMATION 3: stage "stamp" punch on that card's icon,
              // timed just behind the card's own reveal.
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
        .bsl-stage-badge img {
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            filter 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (hover: hover) and (pointer: fine) {
          .bsl-stage-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 22px 40px -24px rgba(28, 23, 18, 0.28);
            border-color: rgba(162, 96, 40, 0.28);
          }
          .bsl-stage-card:hover .bsl-stage-badge img {
            transform: scale(1.08);
            filter: drop-shadow(0 10px 18px rgba(28, 23, 18, 0.28)) drop-shadow(0 1px 0 rgba(255, 255, 255, 0.4));
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
                    <span aria-hidden="true" className="bsl-corner-mark bsl-corner-mark--tl" />
                    <span aria-hidden="true" className="bsl-corner-mark bsl-corner-mark--br" />

                    {/* Numeral + icon duo — the card's signature header row.
                        The numeral drops, tallies up, and gleams once on
                        entry; the icon stamps in a beat behind it. Neither
                        is hidden as a watermark any more — both carry equal
                        visual weight. */}
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

                      {/* Icon shown large and un-badged — no circular medallion
                          behind it, so the artwork itself carries the visual
                          weight. */}
                      <div
                        ref={(el) => {
                          badgeRefs.current[i] = el;
                        }}
                        className="bsl-stage-badge relative flex h-16 w-16 shrink-0 items-center justify-center lg:h-[4.5rem] lg:w-[4.5rem]"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={stage.icon}
                          alt={stage.iconAlt}
                          width={72}
                          height={72}
                          className="h-14 w-14 object-contain lg:h-16 lg:w-16"
                          style={{
                            filter:
                              "drop-shadow(0 8px 16px rgba(28,23,18,0.22)) drop-shadow(0 1px 0 rgba(255,255,255,0.4))",
                          }}
                        />
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