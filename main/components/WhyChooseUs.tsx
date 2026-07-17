"use client";

/**
 * WhyChooseUs.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * "Why Choose Us" — a trust section that extends the visual language of
 * Projects.tsx (#1C1712 / #6E6259 / #A26028 / #E8C599, Fraunces serif,
 * warm ivory panels) with two signature moments: a set of mounted "brass
 * coin" medallions rendered in real 3D, and a count-up stat bar.
 *
 * FIX IN THIS PASS — count-up not firing on mobile
 * - Root cause: the stat bar's "has it scrolled into view yet" check used
 *   `ScrollTrigger`. Mobile Safari (and some Chrome/Android builds) fire a
 *   `resize` event when the address bar collapses/expands mid-scroll;
 *   ScrollTrigger's default behaviour is to recalculate all trigger
 *   start/end positions on resize, which can silently shift a trigger's
 *   position after the user has already scrolled past it — so `onEnter`
 *   never fires. This is a known, common mobile issue with
 *   ScrollTrigger-based reveals, not specific to this markup.
 * - Fix, two parts:
 *   1. `ScrollTrigger.config({ ignoreMobileResize: true })` is now set
 *      once, globally, right after the plugin registers. This stops the
 *      address-bar resize from re-triggering recalculation for every
 *      ScrollTrigger in this file (cards + medallions + parallax too).
 *   2. The stat bar's visibility check no longer uses ScrollTrigger at
 *      all — it uses a plain `IntersectionObserver` instead, which is the
 *      standard reliable way to detect "has this element been seen once"
 *      and doesn't depend on pixel-accurate scroll math the way
 *      ScrollTrigger does. GSAP still does the actual opacity/count tween;
 *      only the "when do I start" detection changed.
 *
 * SPACING
 * - This section is designed to sit directly beneath a section that
 *   already carries generous bottom padding (e.g. Projects.tsx). Its own
 *   top padding is intentionally tight (`pt-8 lg:pt-10`) so two large
 *   paddings don't stack into a dead gap; bottom padding stays generous
 *   so the section still reads as complete on its own.
 *
 * SIGNATURE ELEMENT — brass coin medallions in 3D
 * - Each reason is anchored by a small two-layer "coin": a conic-gradient
 *   rim (the bevel) wrapping a radial-gradient face, echoing the gold
 *   accent (#A26028 / #E8C599) used for the blueprint corner-marks in
 *   Projects.tsx. The icon itself is engraved with a two-tone drop-shadow
 *   so it reads as struck into the metal, not printed on top of it.
 * - Entrance: cards live inside a shared `perspective` stage. On
 *   scroll-into-view, each coin swings into frame with real rotateY and
 *   rises out of the page (negative → zero translateZ), staggered
 *   left-to-right, like plaques being mounted one at a time. Once
 *   mounted, each coin settles into a slow, independent idle float —
 *   an ambient, jewellery-case kind of stillness rather than a static
 *   icon.
 * - Ambient depth: for as long as the section is on screen (desktop,
 *   motion-enabled only), the whole card grid holds a very slight
 *   rotateX that eases toward dead-level as you scroll through it.
 * - Hover (fine pointer only): the coin tilts to follow the cursor via
 *   `gsap.quickTo`, a soft highlight tracks the same position across its
 *   face, and a soft contact shadow beneath the coin drifts opposite the
 *   tilt — the coin reads as genuinely lifted off the card, not skewed.
 * - The carpenter's-square icon (`SquareIcon`) deliberately rhymes with
 *   the corner registration marks in Projects.tsx — precision is the
 *   throughline connecting both sections.
 *
 * STAT BAR
 * - A quiet, editorial "by the numbers" strip between the header and the
 *   card wall. Numbers count up once, on first view, using a tweened
 *   proxy value rather than a CSS animation, so the count can ease
 *   naturally. Figures are placeholder — replace with the client's real
 *   trading history / completed-project counts before launch.
 *
 * CONTENT — four pillars, West London focus
 * - Reduced from six reasons to four, matching the client's own service
 *   copy: comprehensive services, an experienced team, attention to
 *   detail, and an established/trusted reputation. Each card names West
 *   London explicitly so the section keeps carrying local-SEO weight even
 *   if read out of context (e.g. as a search snippet or by a screen
 *   reader jumping straight to one card). The grid now runs a single row
 *   of four on large screens (`lg:grid-cols-4`) instead of 3x2.
 *
 * SEO
 * - Copy is written to read naturally while covering the phrases a
 *   prospective client actually searches for (West London renovation,
 *   fully insured contractor, experienced tradespeople, referral-driven
 *   reputation) alongside the service areas already named in
 *   Projects.tsx. Heading order is a single <h2> with four <h3> reasons —
 *   no skipped levels.
 * - A minimal HomeAndConstructionBusiness JSON-LD block is included.
 *   Placeholder fields (url, telephone, address, logo) are marked with
 *   TODOs — fill them in, and if the site already emits an
 *   Organization/LocalBusiness schema elsewhere, merge rather than
 *   duplicate, since duplicate business entities can confuse indexing.
 *
 * ACCESSIBILITY / PERFORMANCE
 * - `prefers-reduced-motion: reduce` disables all transform animation and
 *   the count-up (final values are set immediately instead).
 * - Cursor-follow tilt, shine, and contact shadow are gated to
 *   `(hover: hover) and (pointer: fine)` so touch devices never get a
 *   stuck hover state.
 * - Implemented with `gsap.matchMedia()` so desktop-only behaviour is
 *   cleanly torn down on breakpoint change / unmount, matching the
 *   pattern used in Projects.tsx.
 *
 * DEPENDENCY: requires `gsap` (npm install gsap).
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // Prevents mobile browsers' address-bar show/hide from firing a resize
  // event that makes ScrollTrigger recalculate (and potentially shift)
  // every trigger's start/end position mid-scroll. Set once, globally.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

type IconType = "layers" | "hardhat" | "square" | "shield";

type Reason = {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: IconType;
};

// SEO note: each title/description is written to stand on its own (a
// screen reader or search snippet may surface just one), so avoid
// pronouns that depend on a neighbouring card for context, and name
// West London explicitly in every card.
const REASONS: Reason[] = [
  {
    id: "comprehensive-services",
    badge: "Full-Service Delivery",
    title: "Comprehensive Services, Start To Finish",
    description:
      "We offer a complete range of construction services across West London — from full property refurbishments and extensions to kitchens, bathrooms, decorating, and ongoing maintenance. We manage the entire process, so our clients never have to chase different trades or timelines themselves.",
    icon: "layers",
  },
  {
    id: "experienced-team",
    badge: "Decades Of Experience",
    title: "A Genuinely Experienced Team",
    description:
      "Our team brings decades of combined experience to every West London project, partnering with skilled tradespeople, architects, and engineers wherever needed so each job is handled by real experts. We show up when we say we will, communicate openly at every stage, and deliver the kind of results we'd want in our own homes.",
    icon: "hardhat",
  },
  {
    id: "attention-to-detail",
    badge: "Meticulous Finish",
    title: "Attention To Every Last Detail",
    description:
      "Excellence lives in the details, and that's exactly where we focus — from how your walls are finished to how fixtures are aligned and the site is left clean. On every West London home we work on, quality isn't just an outcome, it's how we work.",
    icon: "square",
  },
  {
    id: "established-trusted",
    badge: "Fully Insured & Vetted",
    title: "An Established, Trusted Name In West London",
    description:
      "BSL Construction is fully insured, vetted, and regularly recommended by clients across West London who return to us time and again. Much of our work comes from referrals — a result of our consistency, our discipline, and the pride we take in both our workmanship and our service.",
    icon: "shield",
  },
];

// Placeholder — replace with real, verifiable figures before launch.
const STATS: { value: number; suffix: string; label: string }[] = [
  { value: 15, suffix: "+", label: "Years Experience" },
  { value: 100, suffix: "%", label: "Client Satisfaction" },
  { value: 12, suffix: "-Mo", label: "Workmanship Guarantee" },
];

function LayersIcon() {
  // Stacked layers — reads as "a full range of services", used for the
  // comprehensive-services card.
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6" aria-hidden="true">
      <path d="M12 3.5l8.5 4.25L12 12l-8.5-4.25L12 3.5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 12.75L12 17l8.5-4.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 17.25L12 21.5l8.5-4.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HardHatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6" aria-hidden="true">
      <path d="M4.5 15.5a7.5 7.5 0 0 1 15 0" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 15.5h19" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7v3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 15.5V12M14.5 15.5V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SquareIcon() {
  // A carpenter's / try square with measurement ticks — a deliberate echo
  // of the blueprint corner marks used in Projects.tsx.
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6" aria-hidden="true">
      <path d="M4.5 3.5v17h17" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 8.2h2.4M4.5 12.6h2.4M4.5 17h2.4" strokeLinecap="round" />
      <path d="M9.3 20.5v-2.4M13.7 20.5v-2.4M18.1 20.5v-2.4" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6" aria-hidden="true">
      <path d="M12 3.5l6.5 2.6v5.4c0 4.6-3.2 7.4-6.5 8.5-3.3-1.1-6.5-3.9-6.5-8.5V6.1L12 3.5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12.1l2 2 4-4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReasonIcon({ type }: { type: IconType }) {
  switch (type) {
    case "layers":
      return <LayersIcon />;
    case "hardhat":
      return <HardHatIcon />;
    case "square":
      return <SquareIcon />;
    case "shield":
      return <ShieldIcon />;
  }
}

// TODO: fill in real business details and merge with any sitewide
// Organization/LocalBusiness schema rather than emitting a duplicate.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: "BSL Construction",
  description:
    "Design-and-build renovation, extension, and refurbishment company serving West London homeowners.",
  areaServed: ["Kensington", "Chelsea", "Notting Hill", "Hampstead"],
  // url: "https://www.example.com",
  // telephone: "+44-XXX-XXX-XXXX",
};

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const statBarRef = useRef<HTMLDivElement | null>(null);
  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const medallionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ---- Stat bar count-up: its own effect, independent of the card/coin
  // ScrollTrigger setup below. Uses IntersectionObserver rather than
  // ScrollTrigger to detect "has this been seen yet" — IntersectionObserver
  // doesn't depend on pixel-accurate scroll offsets the way ScrollTrigger
  // does, so it isn't affected by mobile browsers resizing their address
  // bar mid-scroll, which is what was breaking this on mobile before.
  useEffect(() => {
    const statBar = statBarRef.current;
    const statEls = statRefs.current.filter((el): el is HTMLSpanElement => Boolean(el));
    if (!statBar || statEls.length === 0) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      statEls.forEach((el, i) => {
        el.textContent = `${STATS[i].value}${STATS[i].suffix}`;
      });
      return;
    }

    gsap.set(statEls, { opacity: 0, y: 8 });

    let hasRun = false;
    const runCountUp = () => {
      if (hasRun) return;
      hasRun = true;
      gsap.to(statEls, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" });
      statEls.forEach((el, i) => {
        const proxy = { val: 0 };
        gsap.to(proxy, {
          val: STATS[i].value,
          duration: 1.3,
          ease: "power2.out",
          delay: 0.1,
          onUpdate: () => {
            el.textContent = `${Math.round(proxy.val)}${STATS[i].suffix}`;
          },
        });
      });
    };

    // If the stat bar is already on screen at mount (e.g. a short mobile
    // viewport where this section starts near the top), fire right away
    // instead of waiting on an observer callback that may never come.
    const rect = statBar.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
    if (alreadyVisible) {
      runCountUp();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCountUp();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(statBar);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;

    const cards = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    const medallions = medallionRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    if (cards.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        reduceMotion: "(prefers-reduced-motion: reduce)",
        canHover: "(hover: hover) and (pointer: fine)",
        isDesktop: "(min-width: 1024px)",
      },
      (context) => {
        const { reduceMotion, canHover, isDesktop } = context.conditions as {
          reduceMotion: boolean;
          canHover: boolean;
          isDesktop: boolean;
        };

        const triggers: ScrollTrigger[] = [];
        const cleanups: Array<() => void> = [];

        // ---- Initial state — cards
        gsap.set(cards, {
          opacity: reduceMotion ? 1 : 0,
          y: reduceMotion ? 0 : 24,
          scale: reduceMotion ? 1 : 0.97,
        });
        gsap.set(medallions, {
          opacity: reduceMotion ? 1 : 0,
          rotateY: reduceMotion ? 0 : -150,
          z: reduceMotion ? 0 : -70,
        });
        gsap.set(grid, {
          rotateX: reduceMotion || !isDesktop ? 0 : 6,
        });

        // ---- Entrance: coins mounted one at a time, left to right, then
        // settle into an independent idle float.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: grid,
            start: "top 85%",
            once: true,
          },
          onComplete: () => {
            if (reduceMotion) return;
            medallions.forEach((medallion, i) => {
              gsap.to(medallion, {
                y: -4,
                duration: 2.6 + (i % 3) * 0.4,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
                delay: i * 0.12,
              });
            });
          },
        });

        cards.forEach((card, i) => {
          tl.to(
            card,
            { opacity: 1, y: 0, scale: 1, duration: reduceMotion ? 0.01 : 0.7, ease: "power3.out" },
            reduceMotion ? 0 : i * 0.1
          );
        });
        medallions.forEach((medallion, i) => {
          tl.to(
            medallion,
            { opacity: 1, rotateY: 0, z: 0, duration: reduceMotion ? 0.01 : 0.85, ease: "power3.out" },
            reduceMotion ? 0 : i * 0.1 + 0.06
          );
        });

        if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);

        // ---- Ambient parallax: the wall of coins settles from a slight
        // upward tilt to dead-level as the section scrolls through.
        // Desktop only — this is a large, continuous scrub effect that
        // isn't worth the extra scroll-listener cost on mobile.
        if (isDesktop && !reduceMotion) {
          const parallax = ScrollTrigger.create({
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            onUpdate: (self) => {
              gsap.set(grid, { rotateX: 6 - self.progress * 8 });
            },
          });
          triggers.push(parallax);
        }

        // ---- Hover tilt + shine + grounded contact shadow, fine-pointer
        // devices only.
        if (canHover && !reduceMotion) {
          cards.forEach((card, i) => {
            const medallion = medallions[i];
            const shine = shineRefs.current[i];
            const shadow = shadowRefs.current[i];
            if (!medallion) return;

            const rotateX = gsap.quickTo(medallion, "rotateX", { duration: 0.5, ease: "power3.out" });
            const rotateY = gsap.quickTo(medallion, "rotateY", { duration: 0.5, ease: "power3.out" });
            const lift = gsap.quickTo(card, "y", { duration: 0.4, ease: "power3.out" });
            const shadowX = shadow ? gsap.quickTo(shadow, "x", { duration: 0.5, ease: "power3.out" }) : null;
            const shadowSkew = shadow ? gsap.quickTo(shadow, "skewX", { duration: 0.5, ease: "power3.out" }) : null;

            const handleMove = (e: MouseEvent) => {
              const rect = medallion.getBoundingClientRect();
              const px = (e.clientX - rect.left) / rect.width - 0.5;
              const py = (e.clientY - rect.top) / rect.height - 0.5;
              rotateY(px * 28);
              rotateX(py * -28);
              shadowX?.(-px * 14);
              shadowSkew?.(-px * 22);
              if (shine) {
                shine.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
                shine.style.setProperty("--my", `${(py + 0.5) * 100}%`);
              }
            };
            const handleEnter = () => {
              lift(-4);
              if (shine) shine.style.opacity = "1";
              if (shadow) shadow.style.opacity = "1";
            };
            const handleLeave = () => {
              rotateX(0);
              rotateY(0);
              lift(0);
              shadowX?.(0);
              shadowSkew?.(0);
              if (shine) shine.style.opacity = "0";
              if (shadow) shadow.style.opacity = "0";
            };

            card.addEventListener("mousemove", handleMove);
            card.addEventListener("mouseenter", handleEnter);
            card.addEventListener("mouseleave", handleLeave);
            cleanups.push(() => {
              card.removeEventListener("mousemove", handleMove);
              card.removeEventListener("mouseenter", handleEnter);
              card.removeEventListener("mouseleave", handleLeave);
            });
          });
        }

        return () => {
          triggers.forEach((t) => t.kill());
          cleanups.forEach((fn) => fn());
        };
      }
    );

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="why-choose-us-heading"
      className="bg-white px-5 pt-2 pb-16 lg:px-8 lg:pt-2 lg:pb-24"
    >
      {/* Serif display face, shared with Projects.tsx. For production,
          replace with next/font/google and drop this tag. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        .bsl-serif { font-family: 'Fraunces', 'Iowan Old Style', 'Palatino Linotype', Palatino, serif; }
        .bsl-shine {
          background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.85), rgba(255,255,255,0) 55%);
        }
        .bsl-blueprint-grid {
          background-image: radial-gradient(circle, rgba(28,23,18,0.07) 1px, transparent 1px);
          background-size: 22px 22px;
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />

      <div className="mx-auto max-w-[1180px] min-[1440px]:max-w-[1360px]">
        <header className="mx-auto mb-10 max-w-[680px] text-center lg:mb-12">
          <span className="mb-3 inline-flex items-center justify-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#A26028]">
            <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
            Why Choose Us
            <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
          </span>
          <h2
            id="why-choose-us-heading"
            className="bsl-serif mb-3 text-[clamp(2rem,4.2vw,3rem)] font-medium leading-[1.1] tracking-[-0.01em] text-[#1C1712]"
          >
            Why West London Homeowners Choose BSL Construction
          </h2>
          <p className="text-[clamp(0.95rem,1.6vw,1.05rem)] leading-[1.6] text-[#6E6259]">
            BSL Construction is a design-and-build renovation company trusted across Kensington, Chelsea,
            Notting Hill, and Hampstead — delivering comprehensive, fully insured renovations, extensions,
            and refurbishments from a single experienced, in-house team.
          </p>
        </header>

        {/* Stat bar — quiet, editorial "by the numbers" strip. */}
        <div
          ref={statBarRef}
          className="mx-auto mb-12 grid max-w-2xl grid-cols-3 divide-x divide-[#1C1712]/10 lg:mb-16"
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center px-3 text-center sm:px-6">
              <span
                ref={(el) => {
                  statRefs.current[i] = el;
                }}
                aria-hidden="true"
                className="bsl-serif text-[clamp(1.6rem,3.4vw,2.4rem)] font-medium leading-none text-[#1C1712]"
              >
                0{stat.suffix}
              </span>
              <span className="sr-only">{`${stat.value}${stat.suffix} ${stat.label}`}</span>
              <span className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#6E6259]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Perspective stage — a shared 3D space for the whole card wall. */}
        <div ref={stageRef} className="relative" style={{ perspective: "1400px" }}>
          <div
            aria-hidden="true"
            className="bsl-blueprint-grid pointer-events-none absolute -inset-6 -z-10 opacity-70"
          />
          <div
            ref={gridRef}
            style={{ transformStyle: "preserve-3d", willChange: "transform" }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
          >
            {REASONS.map((reason, i) => (
              <div
                key={reason.id}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#FBF9F6] p-7 pt-8 ring-1 ring-[#1C1712]/[0.06] shadow-[0_1px_2px_rgba(28,23,18,0.05)] transition-shadow duration-300 ease-out hover:shadow-[0_28px_54px_-26px_rgba(28,23,18,0.28)]"
                style={{ willChange: "transform" }}
              >
                {/* Coin medallion — the signature 3D element. Its own
                    perspective well so rotateX/rotateY read as true
                    depth, not a flat skew. */}
                <div className="relative mb-6 h-[68px] w-[68px]" style={{ perspective: "700px" }}>
                  <div
                    aria-hidden="true"
                    ref={(el) => {
                      shadowRefs.current[i] = el;
                    }}
                    className="absolute left-1/2 top-[62px] h-2.5 w-11 -translate-x-1/2 rounded-full bg-[#1C1712]/30 opacity-0 blur-md"
                  />
                  <div
                    ref={(el) => {
                      medallionRefs.current[i] = el;
                    }}
                    className="relative h-full w-full rounded-full p-[3px]"
                    style={{
                      transformStyle: "preserve-3d",
                      background:
                        "conic-gradient(from 200deg, #8A5121, #E8C599 25%, #A26028 55%, #E8C599 80%, #8A5121)",
                      boxShadow: "0 14px 26px -14px rgba(162,96,40,0.55), 0 2px 4px rgba(28,23,18,0.15)",
                    }}
                  >
                    <div
                      className="flex h-full w-full items-center justify-center rounded-full"
                      style={{ background: "radial-gradient(circle at 34% 30%, #F3D9AE, #A26028 68%, #8A5121)" }}
                    >
                      <span
                        className="text-[#FBF9F6]"
                        style={{
                          filter:
                            "drop-shadow(0 1px 0 rgba(255,255,255,0.35)) drop-shadow(0 -1px 1px rgba(28,23,18,0.4))",
                        }}
                      >
                        <ReasonIcon type={reason.icon} />
                      </span>
                    </div>
                    <div
                      ref={(el) => {
                        shineRefs.current[i] = el;
                      }}
                      aria-hidden="true"
                      className="bsl-shine pointer-events-none absolute inset-0 rounded-full opacity-0"
                      style={{ "--mx": "50%", "--my": "50%" } as CSSProperties}
                    />
                  </div>
                </div>

                <span className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#A26028]">
                  {reason.badge}
                </span>
                <h3 className="bsl-serif mb-2.5 text-[1.12rem] font-medium leading-snug text-[#1C1712] transition-colors duration-300 group-hover:text-[#8A5121]">
                  {reason.title}
                </h3>
                <p className="text-[0.92rem] leading-[1.7] text-[#6E6259]">{reason.description}</p>

                <span
                  aria-hidden="true"
                  className="absolute inset-x-7 bottom-0 h-[2px] origin-left scale-x-0 bg-[#A26028] transition-transform duration-500 ease-out group-hover:scale-x-100"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}