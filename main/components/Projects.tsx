"use client";

/**
 * Projects.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * "Featured Projects" — a luxury, editorial rebuild of the Featured Projects
 * section. Same palette family as Services.tsx (#1C1712 / #6E6259 / #A26028
 * / #E8C599) pushed toward a "property lookbook" register: a museum-style
 * frame around the photograph, a hairline numeral rail marking real scroll
 * position, and a pinned scroll-driven switcher.
 *
 * NAVBAR OFFSET
 * - The site has a fixed navbar, so the pinned stage now starts at
 *   `top <NAVBAR_HEIGHT>px` instead of `top top`, and the section itself
 *   carries `scroll-margin-top` so any anchor/programmatic scroll (arrows,
 *   thumbnails, numeral rail) lands below the navbar rather than under it.
 *   Update NAVBAR_HEIGHT below if the navbar's height changes.
 *
 * LAYOUT (unchanged spatial contract, as requested)
 * - Desktop: photograph is always the LEFT column, project details are
 *   always the RIGHT column. Scrolling through the section advances to the
 *   next project — the two columns crossfade in place, they never swap
 *   sides.
 * - Mobile: photo stacks above details; scroll-pinning is disabled (see
 *   "SCROLL BEHAVIOUR" below) and the section behaves as a normal, static,
 *   swipeable stack controlled by the arrows / thumbnail rail.
 *
 * DESIGN LANGUAGE
 * - Warm ivory "mat" frame (#FBF9F6) around every hero photograph, like a
 *   mounted print in a portfolio — a deliberate departure from the
 *   edge-to-edge card treatment used elsewhere on the site, reserved for
 *   this one signature moment.
 * - The blueprint-style corner registration marks are kept from the
 *   previous pass, but now read as double duty: technical alignment marks
 *   *and* classic photo-corner mounts — an apt pairing of "craftsmanship"
 *   and "precision" for a construction company's portfolio.
 * - A quiet serif (Fraunces) is introduced for the numeral rail and project
 *   titles only — used with restraint, never for body copy — to give the
 *   page an editorial, real-estate-brochure voice. Loaded via a plain
 *   <style> @import for portability; swap for `next/font/google` in
 *   production (see comment near the bottom of the file).
 * - Two small "spec" chips (investment / programme length) sit under the
 *   project counter — real, distinguishing facts about each job, not
 *   decoration.
 *
 * SCROLL BEHAVIOUR — pinned, scroll-driven project switcher
 * - Desktop (≥1024px, no reduced-motion): the two-column stage is pinned
 *   with ScrollTrigger while the user scrolls through it; scroll progress
 *   is snapped to one stop per project. Crossing a snap point crossfades
 *   the photograph (clip-path wipe) and the details panel in place —
 *   image stays left, details stay right, only the content changes. The
 *   pin start is offset by NAVBAR_HEIGHT so the fixed navbar never
 *   overlaps the pinned stage.
 * - Mobile / touch / reduced-motion: no pinning (scroll-jacking is a poor
 *   fit for touch scrolling). The stage plays a single entrance reveal and
 *   is then driven entirely by the arrows and thumbnail rail, exactly like
 *   a normal carousel.
 * - Manual navigation (arrows, thumbnails, numeral rail) works in both
 *   modes: on desktop it scrolls the page to the matching pinned position
 *   (ScrollTrigger's onUpdate then plays the crossfade); on mobile it
 *   plays the crossfade directly.
 * - Implemented with `gsap.matchMedia()` so the two modes are cleanly
 *   isolated and torn down on breakpoint change / unmount. A
 *   `ScrollTrigger.refresh()` is forced once the hero image has loaded,
 *   since async image loads are a common cause of mistimed trigger math.
 *
 * PLACEHOLDER IMAGES
 * - Real photography sourced from Unsplash (free license) as a stand-in
 *   for commissioned project photography — swap the `image` field for the
 *   client's own photos in /public and switch these <img> tags for
 *   next/image once that's in place.
 *
 * DEPENDENCY: requires `gsap` (npm install gsap).
 * -------------------------------------------------------------------------
 */

import { Fragment, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Project = {
  id: string;
  slug: string;
  kicker: string;
  title: string;
  location: string;
  value: string;
  duration: string;
  description: string;
  highlights: string[];
  image: string;
};

// TODO: replace `image` with commissioned project photography once
// available, and point `slug` at the real /projects/[slug] route for each
// job. Photography below is real (Unsplash, free license) and is used only
// as a stand-in for the finished renovations described in the copy.
const PROJECTS: Project[] = [
  {
    id: "kensington-townhouse",
    slug: "kensington-full-house-renovation",
    kicker: "Full Renovation",
    title: "The Kensington Townhouse",
    location: "Kensington",
    value: "From £380,000",
    duration: "22-week programme",
    description:
      "A stucco-fronted townhouse stripped to brick and rebuilt from front door to garden wall — new structure, new services, and a run of bespoke joinery that carries through every room.",
    highlights: ["Full structural rebuild", "Bespoke joinery throughout", "Smart-home integration"],
    image:
      "https://images.unsplash.com/photo-1682888813913-e13f18692019?auto=format&fit=crop&w=1600&h=1200&q=80",
  },
  {
    id: "chelsea-riverside-kitchen",
    slug: "chelsea-riverside-kitchen-extension",
    kicker: "Kitchen Extension",
    title: "The Chelsea Riverside Kitchen",
    location: "Chelsea",
    value: "From £165,000",
    duration: "14-week programme",
    description:
      "A glazed side-return extension built around river light — a book-matched marble island, and a wall of glass that disappears entirely into the structure on warm evenings.",
    highlights: ["Book-matched marble island", "Disappearing glass wall", "Zoned underfloor heating"],
    image:
      "https://images.unsplash.com/photo-1722247482141-f5112a19bed2?auto=format&fit=crop&w=1600&h=1200&q=80",
  },
  {
    id: "hampstead-loft-retreat",
    slug: "hampstead-loft-retreat",
    kicker: "Loft Conversion",
    title: "The Hampstead Loft Retreat",
    location: "Hampstead",
    value: "From £145,000",
    duration: "12-week programme",
    description:
      "An unused attic reworked into a principal suite — the original ridge beam kept exposed, a walk-in dressing room built beneath the eaves, and an ensuite tucked into the slope.",
    highlights: ["Original ridge beam retained", "Walk-in dressing room", "Ensuite beneath the eaves"],
    image:
      "https://images.unsplash.com/photo-1746531431369-3b83b957f0bf?auto=format&fit=crop&w=1600&h=1200&q=80",
  },
  {
    id: "notting-hill-garden-extension",
    slug: "notting-hill-rear-extension",
    kicker: "Rear Extension",
    title: "The Notting Hill Garden Extension",
    location: "Notting Hill",
    value: "From £210,000",
    duration: "16-week programme",
    description:
      "A full-width rear extension that opened the ground floor to the garden — Crittall-style glazing, a poured resin floor running straight out to the terrace, and a kitchen built to entertain.",
    highlights: ["Crittall-style glazing", "Poured resin flooring", "Full-width bi-fold doors"],
    image:
      "https://images.unsplash.com/photo-1682888813788-bf57c360123e?auto=format&fit=crop&w=1600&h=1200&q=80",
  },
];

const SUBTITLE =
  "Every project below was delivered on time, on budget, and finished to a standard our clients are proud to show off.";

// Height of the site's fixed navbar, in pixels. Update this if the navbar's
// height changes — it's used both to offset the pinned stage's start
// point and as the section's scroll-margin-top, so the navbar never
// overlaps the pinned photograph/details or an anchored scroll target.
const NAVBAR_HEIGHT = 80;

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        d="M12 21s-7-6.1-7-11.2A7 7 0 0 1 19 9.8C19 14.9 12 21 12 21z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.25" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-3.5 w-3.5 flex-none"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = PROJECTS.length;
  const active = PROJECTS[activeIndex];

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const pinHostRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLAnchorElement | null>(null);
  const imageInnerRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const switcherRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const heroTimeline = useRef<gsap.core.Timeline | null>(null);

  const activeIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // ---- Crossfade to a given project. Image stays left, details stay
  // right — only the content inside each column changes.
  function transitionTo(nextIndex: number) {
    const stage = stageRef.current;
    const details = detailsRef.current;
    if (!stage || !details || isAnimatingRef.current) return;

    const clamped = ((nextIndex % total) + total) % total;
    if (clamped === activeIndexRef.current) return;
    isAnimatingRef.current = true;

    const q = gsap.utils.selector(stage);
    const image = q("[data-card-image]");

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });

    tl.to(details, { opacity: 0, y: 10, duration: 0.22 }, 0)
      .to(image, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.3, ease: "power2.in" }, 0)
      .call(() => {
        activeIndexRef.current = clamped;
        setActiveIndex(clamped);
      })
      .set(image, { clipPath: "inset(0% 0% 100% 0%)" })
      .set(details, { y: 10 })
      .to(image, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power3.out" })
      .to(details, { opacity: 1, y: 0, duration: 0.4 }, "<0.08");

    thumbRefs.current[clamped]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }

  // ---- Manual navigation (arrows / thumbnails / numeral rail). When the
  // desktop pin is active this scrolls the page to the matching position
  // instead of transitioning directly — ScrollTrigger's onUpdate then
  // plays the crossfade, keeping scroll position and content in sync.
  function goTo(nextIndex: number) {
    const clamped = ((nextIndex % total) + total) % total;
    if (clamped === activeIndexRef.current) return;

    const st = scrollTriggerRef.current;
    if (st) {
      const target = st.start + (clamped / (total - 1)) * (st.end - st.start);
      window.scrollTo({ top: target, behavior: "smooth" });
    } else {
      transitionTo(clamped);
    }
  }

  // ---- Stage setup: entrance reveal, hover/tilt choreography on the
  // photograph, and the desktop pinned scroll-switcher. Isolated per
  // breakpoint with gsap.matchMedia so mobile never gets scroll-jacked.
  useEffect(() => {
    const stage = stageRef.current;
    const hero = heroRef.current;
    const details = detailsRef.current;
    const switcher = switcherRef.current;
    if (!stage || !hero || !details || !switcher) return;

    const q = gsap.utils.selector(hero);
    const image = q("[data-card-image]");
    const corners = q("[data-card-corner]");
    const badge = q("[data-card-badge]");
    const scrim = q("[data-card-scrim]");
    const border = q("[data-card-border]");

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 1024px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
        canHover: "(hover: hover) and (pointer: fine)",
      },
      (context) => {
        const { isDesktop, reduceMotion, canHover } = context.conditions as {
          isDesktop: boolean;
          reduceMotion: boolean;
          canHover: boolean;
        };

        const triggers: ScrollTrigger[] = [];

        // Initial state
        gsap.set(stage, {
          opacity: reduceMotion ? 1 : 0,
          y: reduceMotion ? 0 : 26,
          transformPerspective: 800,
        });
        gsap.set(image, {
          clipPath: reduceMotion ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
          scale: reduceMotion ? 1.03 : 1.12,
        });
        gsap.set(corners, { opacity: 0 });
        gsap.set(badge, { opacity: 0, scale: 0.7, y: 10 });
        gsap.set(scrim, { opacity: 0 });

        function playEntrance() {
          gsap.to(stage, { opacity: 1, y: 0, duration: reduceMotion ? 0.01 : 0.85, ease: "power3.out" });
          gsap.to(image, {
            clipPath: "inset(0% 0% 0% 0%)",
            scale: 1.03,
            duration: reduceMotion ? 0.01 : 1.15,
            ease: "power3.out",
          });
          gsap.to(switcher, {
            opacity: 1,
            y: 0,
            duration: reduceMotion ? 0.01 : 0.8,
            ease: "power3.out",
            delay: reduceMotion ? 0 : 0.2,
          });
        }
        gsap.set(switcher, { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 18 });

        triggers.push(
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top 82%",
            once: true,
            onEnter: playEntrance,
          })
        );

        // Hover / focus choreography on the framed photograph
        const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
        tl.to(hero, { y: reduceMotion ? 0 : -6, duration: reduceMotion ? 0.01 : 0.5 }, 0)
          .to(image, { scale: reduceMotion ? 1.03 : 1.14, duration: reduceMotion ? 0.01 : 0.9 }, 0)
          .to(scrim, { opacity: reduceMotion ? 0 : 0.4, duration: reduceMotion ? 0.01 : 0.45 }, 0)
          .to(border, { opacity: 1, duration: reduceMotion ? 0.01 : 0.4 }, 0)
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
          );
        heroTimeline.current = tl;

        let cleanupTilt = () => {};
        if (canHover && !reduceMotion) {
          const rotateX = gsap.quickTo(hero, "rotateX", { duration: 0.6, ease: "power3.out" });
          const rotateY = gsap.quickTo(hero, "rotateY", { duration: 0.6, ease: "power3.out" });

          const handleMove = (e: MouseEvent) => {
            const rect = hero.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            rotateY(px * 4);
            rotateX(py * -4);
          };
          const handleLeave = () => {
            rotateX(0);
            rotateY(0);
          };

          hero.addEventListener("mousemove", handleMove);
          hero.addEventListener("mouseleave", handleLeave);
          cleanupTilt = () => {
            hero.removeEventListener("mousemove", handleMove);
            hero.removeEventListener("mouseleave", handleLeave);
          };
        }

        // Desktop, motion-enabled: pin the stage and drive the switcher
        // from scroll position, one snap-stop per project. Pin starts
        // NAVBAR_HEIGHT px below the top of the viewport so the fixed
        // navbar never overlaps the pinned photograph/details.
        if (isDesktop && !reduceMotion) {
          const distancePerProject = Math.max(window.innerHeight * 0.85, 560);

          const st = ScrollTrigger.create({
            trigger: stage,
            start: `top ${NAVBAR_HEIGHT}px`,
            end: () => `+=${(total - 1) * distancePerProject}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.8,
            snap: {
              snapTo: 1 / (total - 1),
              duration: 0.5,
              ease: "power1.inOut",
            },
            onUpdate: (self) => {
              const idx = Math.round(self.progress * (total - 1));
              if (idx !== activeIndexRef.current) {
                transitionTo(idx);
              }
            },
          });
          scrollTriggerRef.current = st;
          triggers.push(st);
        } else {
          scrollTriggerRef.current = null;
        }

        // Async image loads can shift layout — refresh cached trigger math.
        const imgEl = hero.querySelector("img");
        const onLoad = () => ScrollTrigger.refresh();
        imgEl?.addEventListener("load", onLoad);

        return () => {
          triggers.forEach((t) => t.kill());
          tl.kill();
          cleanupTilt();
          imgEl?.removeEventListener("load", onLoad);
          scrollTriggerRef.current = null;
        };
      }
    );

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Ambient per-letter wave on the intro line
  useEffect(() => {
    const subtitle = subtitleRef.current;
    if (!subtitle) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      stagger: { each: 0.032, yoyo: true, repeat: -1 },
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
      aria-labelledby="projects-heading"
      style={{ scrollMarginTop: NAVBAR_HEIGHT }}
      className="bg-white px-5 py-16 lg:px-8 lg:py-24"
    >
      {/* Serif display face for the numeral rail and project titles only.
          For production, replace with next/font/google and drop this tag:
            import { Fraunces } from "next/font/google";
            const fraunces = Fraunces({ subsets: ["latin"], weight: ["400","500","600"] }); */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        .bsl-serif { font-family: 'Fraunces', 'Iowan Old Style', 'Palatino Linotype', Palatino, serif; }
        @keyframes bsl-scroll-hint { 0%, 100% { transform: translateY(0); opacity: 0.55; } 50% { transform: translateY(5px); opacity: 1; } }
      `}</style>

      <div className="mx-auto max-w-[1180px] min-[1440px]:max-w-[1360px]">
        <header className="mb-12 max-w-[640px] lg:mb-14">
          <span className="mb-3 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#A26028]">
            <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
            Our Projects
          </span>
          <h2
            id="projects-heading"
            className="bsl-serif mb-3 text-[clamp(2rem,4.2vw,3rem)] font-medium leading-[1.1] tracking-[-0.01em] text-[#1C1712]"
          >
            Recent Work Across West London
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

        {/* Pin host — a plain block element so ScrollTrigger can insert its
            spacer here without disturbing the header above or the "view
            all" button below. */}
        <div ref={pinHostRef} className="relative">
          <div
            ref={stageRef}
            className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[auto_1fr_1fr] lg:gap-10 xl:gap-14"
          >
            {/* Numeral rail — real scroll position, not decoration. Desktop
                only; hidden below lg where the pin is also disabled. */}
            <nav
              aria-label="Jump to a project"
              className="hidden flex-col items-center lg:flex"
            >
              {PROJECTS.map((project, index) => (
                <div key={project.id} className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    aria-current={index === activeIndex ? "true" : undefined}
                    aria-label={`Go to project ${index + 1} of ${total}: ${project.title}`}
                    className={`bsl-serif px-1 text-[0.95rem] transition-all duration-300 ease-out ${
                      index === activeIndex
                        ? "scale-125 font-medium text-[#A26028]"
                        : "text-[#1C1712]/25 hover:text-[#1C1712]/55"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </button>
                  {index < total - 1 && (
                    <span
                      aria-hidden="true"
                      className={`my-1.5 h-6 w-px transition-colors duration-500 ${
                        index < activeIndex ? "bg-[#A26028]/70" : "bg-[#1C1712]/10"
                      }`}
                    />
                  )}
                </div>
              ))}
            </nav>

            {/* Photograph — framed like a mounted print. Always the left
                column; a real link through to the project's full write-up. */}
            <div className="relative rounded-[22px] bg-[#FBF9F6] p-3 shadow-[0_1px_2px_rgba(28,23,18,0.06)] ring-1 ring-[#1C1712]/[0.06] sm:p-4">
              <a
                ref={heroRef}
                href={`/projects/${active.slug}`}
                onMouseEnter={() => heroTimeline.current?.play()}
                onMouseLeave={() => heroTimeline.current?.reverse()}
                onFocus={() => heroTimeline.current?.play()}
                onBlur={() => heroTimeline.current?.reverse()}
                className="group relative block overflow-hidden rounded-2xl bg-white transition-shadow duration-300 ease-out hover:shadow-[0_28px_56px_-20px_rgba(28,23,18,0.28),0_8px_20px_-8px_rgba(162,96,40,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A26028]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div ref={imageInnerRef} className="absolute inset-0 -top-[8%] h-[116%] w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      data-card-image
                      src={active.image}
                      alt={`${active.title} in ${active.location} — completed by BSL Construction`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent"
                  />
                  <div
                    data-card-scrim
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent"
                  />

                  {/* Blueprint corner registration marks / photo-mount
                      corners — drawn on in gold by the hover/focus timeline. */}
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
                      className="fill-none stroke-[#E8C599] opacity-0 [stroke-dasharray:32] [stroke-dashoffset:32]"
                    />
                    <path
                      data-card-corner
                      d="M 84 1 L 99 1 L 99 16"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      className="fill-none stroke-[#E8C599] opacity-0 [stroke-dasharray:32] [stroke-dashoffset:32]"
                    />
                    <path
                      data-card-corner
                      d="M 99 84 L 99 99 L 84 99"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      className="fill-none stroke-[#E8C599] opacity-0 [stroke-dasharray:32] [stroke-dashoffset:32]"
                    />
                    <path
                      data-card-corner
                      d="M 16 99 L 1 99 L 1 84"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      className="fill-none stroke-[#E8C599] opacity-0 [stroke-dasharray:32] [stroke-dashoffset:32]"
                    />
                  </svg>

                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[0.72rem] font-semibold text-[#1C1712] shadow-sm backdrop-blur-sm">
                    <PinIcon />
                    {active.location}
                  </span>
                  <span className="absolute right-4 top-4 rounded-full bg-[#A26028] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.04em] text-white">
                    {active.kicker}
                  </span>

                  <div
                    data-card-badge
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-md">
                      View full project
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

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl border border-[#1C1712]/10"
                />
                <span
                  data-card-border
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl border border-[#A26028]/50 opacity-0"
                />
              </a>
            </div>

            {/* Details — always the right column. */}
            <div ref={detailsRef} className="flex flex-col" aria-live="polite">
              <span className="mb-3 flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#A26028]">
                Project {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                <span aria-hidden="true" className="h-px flex-1 bg-[#A26028]/25" />
              </span>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#1C1712]/12 px-3 py-1 text-[0.72rem] font-medium text-[#6E6259]">
                  {active.value}
                </span>
                <span className="rounded-full border border-[#1C1712]/12 px-3 py-1 text-[0.72rem] font-medium text-[#6E6259]">
                  {active.duration}
                </span>
              </div>

              <h3 className="bsl-serif mb-3 text-[clamp(1.5rem,2.6vw,2.1rem)] font-medium leading-tight tracking-[-0.01em] text-[#1C1712]">
                {active.title}
              </h3>

              <p className="mb-6 text-[clamp(0.95rem,1.4vw,1.02rem)] leading-[1.75] text-[#6E6259]">
                {active.description}
              </p>

              <ul className="mb-8 flex flex-col gap-2.5">
                {active.highlights.map((point) => (
                  <li key={point} className="flex items-center gap-2.5 text-[0.92rem] text-[#1C1712]">
                    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#A26028]/10 text-[#A26028]">
                      <CheckIcon />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>

              <a
                href="/contact#quote"
                className="mb-9 inline-flex w-fit items-center gap-2 rounded-full bg-[#A26028] px-7 py-3.5 text-[0.95rem] font-bold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121]"
              >
                Start a Project Like This
              </a>

              {/* Switcher: prev/next arrows + thumbnail rail + progress line */}
              <div ref={switcherRef} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex - 1)}
                    aria-label="Previous project"
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[#1C1712]/15 text-[#1C1712] transition-colors duration-200 hover:border-[#A26028] hover:bg-[#A26028]/5 hover:text-[#A26028]"
                  >
                    <ChevronIcon direction="left" />
                  </button>

                  <div
                    role="tablist"
                    aria-label="Choose a project to view"
                    className="flex flex-1 gap-2.5 overflow-x-auto scroll-px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {PROJECTS.map((project, index) => (
                      <button
                        key={project.id}
                        ref={(el) => {
                          thumbRefs.current[index] = el;
                        }}
                        type="button"
                        role="tab"
                        aria-selected={index === activeIndex}
                        aria-label={`${project.title}, ${project.location}`}
                        onClick={() => goTo(index)}
                        className="group/thumb relative h-14 w-20 flex-none overflow-hidden rounded-lg border border-[#1C1712]/10"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.image}
                          alt=""
                          aria-hidden="true"
                          className={`h-full w-full object-cover transition-opacity duration-200 ${
                            index === activeIndex ? "opacity-100" : "opacity-45 group-hover/thumb:opacity-75"
                          }`}
                        />
                        <span
                          aria-hidden="true"
                          className={`absolute inset-x-0 bottom-0 h-[3px] origin-left bg-[#A26028] transition-transform duration-300 ease-out ${
                            index === activeIndex ? "scale-x-100" : "scale-x-0"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => goTo(activeIndex + 1)}
                    aria-label="Next project"
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[#1C1712]/15 text-[#1C1712] transition-colors duration-200 hover:border-[#A26028] hover:bg-[#A26028]/5 hover:text-[#A26028]"
                  >
                    <ChevronIcon direction="right" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div aria-hidden="true" className="h-px flex-1 bg-[#1C1712]/8">
                    <div
                      className="h-px bg-[#A26028] transition-[width] duration-500 ease-out"
                      style={{ width: `${((activeIndex + 1) / total) * 100}%` }}
                    />
                  </div>
                  <span
                    aria-hidden="true"
                    className="hidden shrink-0 items-center gap-1.5 text-[0.68rem] font-medium uppercase tracking-[0.08em] text-[#6E6259]/70 lg:flex"
                  >
                    Scroll to explore
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 14 14"
                      fill="none"
                      style={{ animation: "bsl-scroll-hint 1.6s ease-in-out infinite" }}
                    >
                      <path
                        d="M7 2v9M7 11l-3.5-3.5M7 11l3.5-3.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex justify-center lg:mt-16">
          <a
            href="/projects"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-[#1C1712] px-7 py-3.5 text-sm font-semibold text-[#1C1712] transition-colors duration-200 ease-out hover:bg-[#1C1712] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1712]"
          >
            View all completed projects
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