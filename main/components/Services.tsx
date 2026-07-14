"use client";

/**
 * Services.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * The section directly after Hero. Shows four flagship service
 * categories as premium, editorial-style cards, then hands off to a full
 * listing page ("Discover all services") for the rest of the sixteen-item
 * menu — rather than trying to give every trade the same heavyweight
 * treatment.
 *
 * Category grouping (not part of the original data, chosen as a
 * reasonable default — swap freely):
 *   New Builds            → /services/new-builds
 *   Extensions             → /services/extensions
 *   Full Refurbishments    → /services/full-refurbishments
 *   Kitchens & Bathrooms   → /services/kitchens-bathrooms (merges the
 *                             separate Kitchen / Bathroom menu items)
 *
 * The remaining trades (Electricals, Plumbing, Tiling, Painting and
 * Decorating, etc.) are not duplicated here — they live on /services,
 * using the lighter tile-grid layout built for the full sixteen-item
 * list. Each service, including these four, is assumed to have its own
 * page at /services/[slug].
 *
 * Design language:
 * - Light theme, white ground and white cards, hairline borders and a
 *   layered shadow rather than a background color shift.
 * - Cards run 1 / 2 / 4 per row (mobile / tablet / wide desktop) instead
 *   of maxing out at 2 columns, so on larger screens each card stays
 *   compact rather than ballooning to fill the row.
 * - Tall, editorial (4:5) project imagery — reads like a portfolio of
 *   finished work rather than a blog-style thumbnail grid.
 * - The old "DWG 01–04" numbering is gone; each card carries a short,
 *   true kicker ("Ground-Up", "Add & Adapt"...) that actually describes
 *   the scope of that service, so the label encodes information instead
 *   of decorating with a fake sequence.
 * - A thin blueprint-ruler tick line under the section intro is the one
 *   nod to the brand's drafting/construction roots — quiet, structural,
 *   not literal.
 * - The intro line ("From first foundation...") is split per letter and
 *   given a slow, continuous wave/writhe — a small ambient signature
 *   that sits above the cards, distinct from their hover choreography.
 *   Skipped entirely under prefers-reduced-motion.
 * - Signature card interaction: hovering (or focusing) a card plays one
 *   GSAP timeline — the card lifts, the image settles and darkens under
 *   a scrim, a "View project" badge scales in, the corner-registration
 *   brackets draw on, and the arrow nudges — instead of several
 *   independent CSS transitions firing separately.
 * - Scroll-driven GSAP: each card wipes into view once (clip-path
 *   curtain reveal, not a plain fade) via its own ScrollTrigger, and the
 *   image drifts gently (parallax) as the card passes through the
 *   viewport.
 * - Pointer tilt: on fine-pointer devices, the card leans subtly toward
 *   the cursor for a tactile, premium feel. Skipped on touch devices and
 *   under prefers-reduced-motion.
 *
 * Styling: Tailwind utility classes for layout/color/type; GSAP for
 * anything scroll-linked, continuous, or orchestrated. Uses next/image
 * (fill layout, so each media wrapper stays `relative` with a defined
 * aspect ratio).
 * Expects files at:
 *   /public/services/new-builds.jpg
 *   /public/services/extensions.jpg
 *   /public/services/full-refurbishments.jpg
 *   /public/services/kitchens-bathrooms.jpg
 *
 * Requires the `gsap` package: npm install gsap
 * -------------------------------------------------------------------------
 */

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type FeaturedService = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  image: string;
  href: string;
};

const FEATURED_SERVICES: FeaturedService[] = [
  {
    id: "new-builds",
    kicker: "Ground-Up",
    title: "New Builds",
    description:
      "Ground-up homes engineered for the site they stand on, not just the plan they started as.",
    image: "/building.jpg",
    href: "/services/new-builds",
  },
  {
    id: "extensions",
    kicker: "Add & Adapt",
    title: "Extensions",
    description:
      "More space without losing the character of the original house.",
    image: "/extension.jpg",
    href: "/services/extensions",
  },
  {
    id: "full-refurbishments",
    kicker: "Whole-Home",
    title: "Full Refurbishments",
    description:
      "Whole-home renovations, coordinated from first fix through to the final coat.",
    image: "/rennovation.jpg",
    href: "/services/full-refurbishments",
  },
  {
    id: "kitchens-bathrooms",
    kicker: "Fit & Finish",
    title: "Kitchens & Bathrooms",
    description:
      "The two rooms that get used the most, fitted properly and built to last.",
    image: "/kitchen.jpg",
    href: "/services/kitchens-bathrooms",
  },
];

const SUBTITLE = "From first foundation to final fit-out — here's where most projects start.";

export default function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const hoverTimelines = useRef<(gsap.core.Timeline | null)[]>([]);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  // ---- Card scroll-reveal, parallax, hover choreography, pointer tilt.
  useEffect(() => {
    const cards = cardRefs.current.filter(
      (el): el is HTMLAnchorElement => el !== null
    );
    if (cards.length === 0) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    const scrollTriggers: ScrollTrigger[] = [];
    const parallaxTriggers: ScrollTrigger[] = [];
    const moveCleanups: (() => void)[] = [];

    cards.forEach((card, i) => {
      const q = gsap.utils.selector(card);
      const image = q("[data-card-image]");
      const corners = q("[data-card-corner]");
      const arrow = q("[data-card-arrow]");
      const scrim = q("[data-card-scrim]");
      const badge = q("[data-card-badge]");

      // ---- Entrance: a curtain-wipe reveal instead of a plain fade.
      gsap.set(card, {
        opacity: reduceMotion ? 1 : 0,
        y: reduceMotion ? 0 : 24,
        transformPerspective: 800,
      });
      gsap.set(image, {
        clipPath: reduceMotion ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
        scale: reduceMotion ? 1.03 : 1.12,
      });
      gsap.set(corners, { opacity: 0 });
      gsap.set(badge, { opacity: 0, scale: 0.7, y: 10 });
      gsap.set(scrim, { opacity: 0 });

      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: card,
          start: "top 88%",
          once: true,
          onEnter: () => {
            const delay = reduceMotion ? 0 : (i % 4) * 0.1;
            gsap.to(card, {
              opacity: 1,
              y: 0,
              duration: reduceMotion ? 0.01 : 0.75,
              ease: "power3.out",
              delay,
            });
            gsap.to(image, {
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1.03,
              duration: reduceMotion ? 0.01 : 1.05,
              ease: "power3.out",
              delay,
            });
          },
        })
      );

      // ---- Parallax: image drifts gently as the card scrolls through
      // the viewport, for a bit of depth. Skipped under reduced motion.
      if (!reduceMotion) {
        parallaxTriggers.push(
          ScrollTrigger.create({
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
            onUpdate: (self) => {
              gsap.set(image, { y: (self.progress - 0.5) * 28 });
            },
          })
        );
      }

      // ---- Hover / focus: one orchestrated moment — lift, image settle,
      // scrim, badge, corner draw, arrow nudge — instead of several
      // independent CSS transitions.
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
      tl.to(
        card,
        {
          y: reduceMotion ? 0 : -5,
          scale: reduceMotion ? 1 : 1.012,
          duration: reduceMotion ? 0.01 : 0.5,
        },
        0
      )
        .to(image, { scale: reduceMotion ? 1.03 : 1.14, duration: reduceMotion ? 0.01 : 0.9 }, 0)
        .to(scrim, { opacity: reduceMotion ? 0 : 0.34, duration: reduceMotion ? 0.01 : 0.45 }, 0)
        .to(badge, { opacity: 1, scale: 1, y: 0, duration: reduceMotion ? 0.01 : 0.4 }, 0.05)
        .to(
          corners,
          {
            opacity: 1,
            strokeDashoffset: 0,
            duration: reduceMotion ? 0.01 : 0.45,
            stagger: reduceMotion ? 0 : 0.05,
          },
          0.05
        )
        .to(arrow, { x: reduceMotion ? 0 : 3, duration: reduceMotion ? 0.01 : 0.25 }, 0.1);
      hoverTimelines.current[i] = tl;

      // ---- Pointer tilt: a subtle 3D lean toward the cursor. Fine
      // pointers only, and skipped under reduced motion.
      if (canHover && !reduceMotion) {
        const rotateX = gsap.quickTo(card, "rotateX", { duration: 0.6, ease: "power3.out" });
        const rotateY = gsap.quickTo(card, "rotateY", { duration: 0.6, ease: "power3.out" });

        const handleMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          rotateY(px * 5);
          rotateX(py * -5);
        };
        const handleLeave = () => {
          rotateX(0);
          rotateY(0);
        };

        card.addEventListener("mousemove", handleMove);
        card.addEventListener("mouseleave", handleLeave);
        moveCleanups.push(() => {
          card.removeEventListener("mousemove", handleMove);
          card.removeEventListener("mouseleave", handleLeave);
        });
      }
    });

    return () => {
      scrollTriggers.forEach((t) => t.kill());
      parallaxTriggers.forEach((t) => t.kill());
      hoverTimelines.current.forEach((tl) => tl?.kill());
      hoverTimelines.current = [];
      moveCleanups.forEach((fn) => fn());
    };
  }, []);

  // ---- Subtitle: a slow, continuous per-letter wave — an ambient
  // signature distinct from the cards' own (hover-triggered) motion.
  useEffect(() => {
    const subtitle = subtitleRef.current;
    if (!subtitle) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const letters = subtitle.querySelectorAll("[data-letter]");
    if (letters.length === 0) return;

    const tween = gsap.to(letters, {
      y: -4,
      rotate: 3,
      duration: 1.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: {
        each: 0.032,
        yoyo: true,
        repeat: -1,
      },
    });

    return () => {
      tween.kill();
      gsap.set(letters, { clearProps: "transform" });
    };
  }, []);

  const words = SUBTITLE.split(" ");

  return (
    <section
      ref={sectionRef}
      aria-labelledby="services-heading"
      className="bg-white px-5 py-16 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-[1180px] min-[1440px]:max-w-[1320px]">
        <header className="mb-12 max-w-[640px] lg:mb-14">
          <span className="mb-3 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#A26028]">
            What We Do
          </span>
          <h2
            id="services-heading"
            className="mb-3 text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.18] tracking-[-0.01em] text-[#1C1712]"
          >
            Our Services
          </h2>
          <p
            ref={subtitleRef}
            className="py-1 text-[clamp(0.95rem,1.6vw,1.05rem)] leading-[1.6] text-[#6E6259]"
          >
            {words.map((word, wi) => (
              <Fragment key={wi}>
                <span className="inline-block">
                  {word.split("").map((char, ci) => (
                    <span key={ci} data-letter className="inline-block">
                      {char}
                    </span>
                  ))}
                </span>
                {wi < words.length - 1 ? " " : ""}
              </Fragment>
            ))}
          </p>
          <div
            aria-hidden="true"
            className="mt-7 h-px w-full max-w-[220px] bg-[repeating-linear-gradient(90deg,rgba(162,96,40,0.55)_0px,rgba(162,96,40,0.55)_6px,transparent_6px,transparent_14px)]"
          />
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
          {FEATURED_SERVICES.map((service, i) => (
            <a
              key={service.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              href={service.href}
              onMouseEnter={() => hoverTimelines.current[i]?.play()}
              onMouseLeave={() => hoverTimelines.current[i]?.reverse()}
              onFocus={() => hoverTimelines.current[i]?.play()}
              onBlur={() => hoverTimelines.current[i]?.reverse()}
              className="group relative block overflow-hidden rounded-xl border border-[#1C1712]/10 bg-white shadow-[0_1px_2px_rgba(28,23,18,0.04)] transition-[border-color,box-shadow] duration-300 ease-out hover:border-[#A26028]/40 hover:shadow-[0_20px_40px_-14px_rgba(28,23,18,0.20)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A26028]"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  data-card-image
                  src={service.image}
                  alt={`${service.title} project by BSL Construction`}
                  fill
                  sizes="(min-width: 1280px) 23vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                />

                {/* Scrim that deepens on hover so the badge and corner
                    brackets read clearly against the photo. */}
                <div
                  data-card-scrim
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
                />

                {/* Blueprint-style corner registration marks — the
                    signature detail, recolored for a light card. Drawn
                    in by the GSAP hover timeline, not CSS transitions. */}
                <svg
                  className="pointer-events-none absolute inset-2.5 h-[calc(100%-1.25rem)] w-[calc(100%-1.25rem)]"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    data-card-corner
                    d="M 1 16 L 1 1 L 16 1"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    className="fill-none stroke-white opacity-0 [stroke-dasharray:32] [stroke-dashoffset:32]"
                  />
                  <path
                    data-card-corner
                    d="M 84 1 L 99 1 L 99 16"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    className="fill-none stroke-white opacity-0 [stroke-dasharray:32] [stroke-dashoffset:32]"
                  />
                  <path
                    data-card-corner
                    d="M 99 84 L 99 99 L 84 99"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    className="fill-none stroke-white opacity-0 [stroke-dasharray:32] [stroke-dashoffset:32]"
                  />
                  <path
                    data-card-corner
                    d="M 16 99 L 1 99 L 1 84"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    className="fill-none stroke-white opacity-0 [stroke-dasharray:32] [stroke-dashoffset:32]"
                  />
                </svg>

                {/* "View project" badge — appears centered over the image
                    on hover/focus, the premium hover cue on top of the
                    always-visible text link below. */}
                <div
                  data-card-badge
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-[0.7rem] font-semibold tracking-wide text-[#1C1712] shadow-[0_8px_24px_rgba(28,23,18,0.3)]">
                    View project
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path
                        d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="px-4 pb-5 pt-4 lg:px-5 lg:pb-6 lg:pt-5">
                <span className="mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#A26028]">
                  {service.kicker}
                </span>
                <h3 className="mb-1.5 text-[1.05rem] font-bold leading-[1.3] text-[#1C1712] lg:text-[1.15rem]">
                  {service.title}
                </h3>
                <p className="mb-3.5 text-[0.85rem] leading-[1.5] text-[#6E6259]">
                  {service.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold tracking-[0.02em] text-[#A26028]">
                  View the work
                  <svg
                    data-card-arrow
                    width="13"
                    height="13"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-12 flex justify-center lg:mt-14">
          <a
            href="/services"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-[#1C1712] px-7 py-3.5 text-sm font-semibold text-[#1C1712] transition-colors duration-200 ease-out hover:bg-[#1C1712] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1712]"
          >
            Discover all services
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              className="transition-transform duration-200 ease-out group-hover:translate-x-[3px]"
            >
              <path
                d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}