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
 * DATA SOURCE
 * - This section no longer ships hardcoded project data. On mount it fetches
 *   `/api/projects` (the same endpoint the /projects index page uses) and
 *   shows up to 4 projects, chosen like this:
 *     1. Take every project with `featured: true`.
 *     2. If there are already 4 (or more) featured projects, show only the
 *        first 4 featured ones — nothing else is added.
 *     3. If there are fewer than 4 featured projects, fill the remaining
 *        slots with the next non-featured projects (in API order) until
 *        there are 4 total, or the list runs out.
 *   See `pickFeaturedProjects()` below for the exact logic.
 * - While the fetch is in flight the stage renders a quiet pulse skeleton
 *   in place of the photo/details grid so the header/subtitle don't jump.
 *   If the fetch fails or the API returns no projects, the whole section
 *   renders nothing (there is nothing meaningful to show).
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
 *   swipeable stack. On mobile you can switch projects by:
 *     1. Swiping left/right on the photograph (touch gesture),
 *     2. Tapping the (larger, mobile-sized) prev/next arrows, or
 *     3. Tapping a thumbnail in the rail.
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
 *   is then driven entirely by swipe gestures, arrows, and the thumbnail
 *   rail, exactly like a normal carousel.
 * - Manual navigation (arrows, thumbnails, numeral rail, swipe) works in
 *   both modes: on desktop it scrolls the page to the matching pinned
 *   position (ScrollTrigger's onUpdate then plays the crossfade); on
 *   mobile it plays the crossfade directly.
 * - Implemented with `gsap.matchMedia()` so the two modes are cleanly
 *   isolated and torn down on breakpoint change / unmount. A
 *   `ScrollTrigger.refresh()` is forced once the hero image has loaded,
 *   since async image loads are a common cause of mistimed trigger math.
 *   It's also forced once the fetched projects arrive, since the stage
 *   markup (and therefore its scroll geometry) doesn't exist until then.
 *
 * IMAGES
 * - Uses next/image. Each project's full photo set is fetched and merged
 *   (heroImage, then thumbnail, then every entry in `gallery`, de-duplicated
 *   by URL) — the same merge order ProjectDetail.tsx uses on the /projects/
 *   [slug] page. The main photo shows the active project's first image; a
 *   single horizontally-scrolling photo rail sits between the prev/next
 *   arrows and lets visitors browse every other photo for the active
 *   project without leaving the homepage. Switching *projects* is done via
 *   the prev/next arrows and the numeral rail (there's no longer a
 *   separate row of project thumbnails); doing so always resets back to
 *   that project's first photo.
 *
 * DEPENDENCY: requires `gsap` (npm install gsap).
 * -------------------------------------------------------------------------
 */

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type ProjectImage = {
  url: string;
  alt: string;
};

type Project = {
  id: string;
  slug: string;
  kicker: string;
  title: string;
  location: string;
  description: string;
  images: ProjectImage[];
};

/* ----------------------------------------------------------------------- */
/* API types + fetch/selection logic                                        */
/* ----------------------------------------------------------------------- */

interface ApiProjectImage {
  url: string;
  alt?: string;
}

interface ApiProject {
  slug: string;
  title: string;
  shortDescription?: string;
  category?: string;
  location?: string;
  featured?: boolean;
  thumbnail?: ApiProjectImage;
  heroImage?: ApiProjectImage;
  gallery?: ApiProjectImage[];
}

interface ProjectsApiResponse {
  success: boolean;
  count?: number;
  projects?: ApiProject[];
}

const FEATURED_LIMIT = 4;

/*
  Picks up to `limit` projects:
    - If there are `limit` or more featured projects, only featured
      projects are returned (the first `limit` of them, in API order).
    - Otherwise every featured project is included, and the remaining
      slots are filled with non-featured projects (in API order) until
      `limit` is reached or the source list is exhausted.
*/
function pickFeaturedProjects(all: ApiProject[], limit = FEATURED_LIMIT): ApiProject[] {
  const featured = all.filter((p) => p.featured);

  if (featured.length >= limit) {
    return featured.slice(0, limit);
  }

  const featuredSlugs = new Set(featured.map((p) => p.slug));
  const rest = all.filter((p) => !featuredSlugs.has(p.slug));

  return [...featured, ...rest].slice(0, limit);
}

/*
  Merges every photo available for a project into one de-duplicated list,
  in the same priority order ProjectDetail.tsx uses for its "On site"
  gallery: heroImage first, then thumbnail, then each `gallery` entry.
  This is what lets the homepage stage show *all* of a project's photos
  (not just the hero shot) in the thumbnail rail beneath the main image.
*/
function mergeProjectImages(project: ApiProject): ProjectImage[] {
  const combined: ProjectImage[] = [];
  const seen = new Set<string>();

  const pushImage = (image?: ApiProjectImage) => {
    if (!image?.url || seen.has(image.url)) return;
    seen.add(image.url);
    combined.push({ url: image.url, alt: image.alt || project.title });
  };

  pushImage(project.heroImage);
  pushImage(project.thumbnail);
  (project.gallery || []).forEach(pushImage);

  return combined;
}

function toDisplayProject(project: ApiProject): Project {
  return {
    id: project.slug,
    slug: project.slug,
    kicker: project.category || "Project",
    title: project.title,
    location: project.location || "",
    description: project.shortDescription || "",
    images: mergeProjectImages(project),
  };
}

const SUBTITLE =
  "Every project below was delivered on time, on budget, and finished to a standard our clients are proud to show off.";

const NAVBAR_HEIGHT_FALLBACK = 80;
const SWIPE_THRESHOLD = 40;

function getNavbarHeight(): number {
  if (typeof document === "undefined") return NAVBAR_HEIGHT_FALLBACK;
  const nav = document.querySelector<HTMLElement>(".site-nav");
  const height = nav?.getBoundingClientRect().height;
  return height && height > 0 ? height : NAVBAR_HEIGHT_FALLBACK;
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4 lg:h-4 lg:w-4"
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

/* ----------------------------------------------------------------------- */
/* Loading skeleton — shown while the fetch is in flight                    */
/* ----------------------------------------------------------------------- */

function StageSkeleton() {
  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[auto_1fr_1fr] lg:gap-10 xl:gap-14">
      <div className="hidden lg:block" aria-hidden="true" />
      <div className="animate-pulse rounded-[22px] bg-[#FBF9F6] p-3 ring-1 ring-[#1C1712]/[0.06] sm:p-4">
        <div className="aspect-[4/3] w-full rounded-2xl bg-[#1C1712]/10" />
      </div>
      <div className="animate-pulse">
        <div className="mb-4 h-3 w-40 rounded-full bg-[#1C1712]/10" />
        <div className="mb-3 h-8 w-3/4 rounded-full bg-[#1C1712]/10" />
        <div className="mb-2 h-4 w-full rounded-full bg-[#1C1712]/10" />
        <div className="mb-8 h-4 w-5/6 rounded-full bg-[#1C1712]/10" />
        <div className="h-12 w-48 rounded-full bg-[#1C1712]/10" />
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "empty" | "error">(
    "loading"
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageFading, setImageFading] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(NAVBAR_HEIGHT_FALLBACK);
  const total = projects.length;
  const active = projects[activeIndex];
  const activeImage = active?.images[activeImageIndex] ?? active?.images[0];

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const pinHostRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLAnchorElement | null>(null);
  const imageInnerRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const switcherRef = useRef<HTMLDivElement | null>(null);
  const heroTimeline = useRef<gsap.core.Timeline | null>(null);

  const activeIndexRef = useRef(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const swipeConsumedClick = useRef(false);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  function selectImage(index: number) {
    if (!active || index === activeImageIndex || index < 0 || index >= active.images.length) {
      return;
    }

    setImageFading(true);
    window.setTimeout(() => {
      setActiveImageIndex(index);
      setImageFading(false);
    }, 160);
  }

  /* --------------------------- fetch projects ---------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Failed to load projects");

        const data: ProjectsApiResponse = await res.json();
        if (cancelled) return;

        if (!data.success || !Array.isArray(data.projects) || data.projects.length === 0) {
          setLoadState("empty");
          return;
        }

        const selected = pickFeaturedProjects(data.projects, FEATURED_LIMIT).map(
          toDisplayProject
        );

        if (selected.length === 0) {
          setLoadState("empty");
          return;
        }

        setProjects(selected);
        setLoadState("ready");
      } catch {
        if (!cancelled) setLoadState("error");
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  function goTo(nextIndex: number) {
    if (total <= 1) return;
    const clamped = ((nextIndex % total) + total) % total;
    if (clamped === activeIndexRef.current) return;

    activeIndexRef.current = clamped;
    setImageFading(true);
    window.setTimeout(() => {
      setActiveIndex(clamped);
      setActiveImageIndex(0);
      setImageFading(false);
    }, 180);
  }

  function handleHeroClick(e: React.MouseEvent) {
    if (swipeConsumedClick.current) {
      e.preventDefault();
      swipeConsumedClick.current = false;
    }
  }

  /* Touch swipe on the hero image (mobile). Native non-passive listeners so
     preventDefault() can stop the page scroll and the <a> link firing. */
  useEffect(() => {
    const el = heroRef.current;
    if (!el || total <= 1) return;

    let startX = 0;
    let startY = 0;
    let horizontal = false;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      horizontal = false;
    };

    const onMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (!horizontal && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        horizontal = true;
      }
      if (horizontal) {
        // stop vertical scroll + the browser's native link drag
        e.preventDefault();
      }
    };

    const onEnd = (e: TouchEvent) => {
      if (!horizontal) return;
      const dx = e.changedTouches[0].clientX - startX;
      // any real horizontal drag cancels the click-through to the project page
      swipeConsumedClick.current = true;
      if (Math.abs(dx) >= SWIPE_THRESHOLD) {
        goTo(activeIndexRef.current + (dx < 0 ? 1 : -1));
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
    // goTo is stable enough (only reads refs + setState); re-bind when the
    // stage (re)mounts or the project count changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, loadState]);

  useEffect(() => {
    const handleResize = () => setNavbarHeight(getNavbarHeight());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Nothing to animate until the fetch has resolved and the real stage
    // markup (hero/details/switcher) has been rendered.
    if (loadState !== "ready" || total === 0) return;

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

        // The switcher is driven entirely by manual navigation (arrows,
        // swipe, thumbnails, numeral rail) on every breakpoint — no
        // scroll-pinning, so `goTo` just updates React state directly.
        void isDesktop;
        scrollTriggerRef.current = null;

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

    // The pinned stage's scroll geometry depends on markup that only exists
    // once projects have loaded, so force a refresh once it's mounted.
    ScrollTrigger.refresh();

    return () => mm.revert();
  }, [loadState, total]);

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

  // Nothing to show — fetch failed or the API returned no projects at all.
  if (loadState === "empty" || loadState === "error") {
    return null;
  }

  const words = SUBTITLE.split(" ");

  return (
    <section
      ref={sectionRef}
      aria-labelledby="projects-heading"
      style={{ scrollMarginTop: navbarHeight }}
      className="bg-white px-5 pb-16 pt-2 lg:px-8 lg:pb-24 lg:pt-3"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        .bsl-serif { font-family: 'Fraunces', 'Iowan Old Style', 'Palatino Linotype', Palatino, serif; }
        @keyframes bsl-scroll-hint { 0%, 100% { transform: translateY(0); opacity: 0.55; } 50% { transform: translateY(5px); opacity: 1; } }
      `}</style>

      <div className="mx-auto max-w-[1180px] min-[1440px]:max-w-[1360px]">
        <header className="mx-auto mb-12 max-w-[640px] text-center lg:mb-14">
          <span className="mx-auto mb-3 inline-flex items-center justify-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#A26028]">
            <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
            Our Projects
          </span>
          <h2
            id="projects-heading"
            className="bsl-serif mb-3 text-[clamp(2rem,4.2vw,3rem)] font-medium leading-[1.1] tracking-[-0.01em] text-[#1C1712]"
          >
            Recent Work Across London
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
            className="mx-auto mt-7 h-px w-full max-w-[220px] bg-[repeating-linear-gradient(90deg,rgba(162,96,40,0.55)_0px,rgba(162,96,40,0.55)_6px,transparent_6px,transparent_14px)]"
          />
        </header>

        <div ref={pinHostRef} className="relative">
          {loadState === "loading" || !active || !activeImage ? (
            <StageSkeleton />
          ) : (
            <div
              ref={stageRef}
              className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[auto_1fr_1fr] lg:gap-10 xl:gap-14"
            >
              <nav
                aria-label="Jump to a project"
                className="hidden flex-col items-center lg:flex"
              >
                {projects.map((project, index) => (
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

              <div className="relative rounded-[22px] bg-[#FBF9F6] p-3 shadow-[0_1px_2px_rgba(28,23,18,0.06)] ring-1 ring-[#1C1712]/[0.06] sm:p-4">
                <a
                  ref={heroRef}
                  href={`/projects/${active.slug}`}
                  onMouseEnter={() => heroTimeline.current?.play()}
                  onMouseLeave={() => heroTimeline.current?.reverse()}
                  onFocus={() => heroTimeline.current?.play()}
                  onBlur={() => heroTimeline.current?.reverse()}
                  onClick={handleHeroClick}
                  style={{ touchAction: "pan-y" }}
                  className="group relative block overflow-hidden rounded-2xl bg-white transition-shadow duration-300 ease-out hover:shadow-[0_28px_56px_-20px_rgba(28,23,18,0.28),0_8px_20px_-8px_rgba(162,96,40,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A26028]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <div ref={imageInnerRef} className="absolute inset-0 -top-[8%] h-[116%] w-full">
                      <Image
                        data-card-image
                        src={activeImage.url}
                        alt={activeImage.alt || `${active.title} in ${active.location} — completed by BSL Construction`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                        className={`object-cover transition-opacity duration-300 ease-out ${
                          imageFading ? "opacity-0" : "opacity-100"
                        }`}
                        draggable={false}
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

                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 text-[0.65rem] font-medium text-white/90 backdrop-blur-sm lg:hidden"
                    >
                      <ChevronIcon direction="left" />
                      Swipe
                      <ChevronIcon direction="right" />
                    </span>
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

              <div ref={detailsRef} className="flex min-w-0 flex-col" aria-live="polite">
                <span className="mb-3 flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#A26028]">
                  Project {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  <span aria-hidden="true" className="h-px flex-1 bg-[#A26028]/25" />
                </span>

                <h3 className="bsl-serif mb-3 text-[clamp(1.5rem,2.6vw,2.1rem)] font-medium leading-tight tracking-[-0.01em] text-[#1C1712]">
                  {active.title}
                </h3>

                <p className="mb-8 text-[clamp(0.95rem,1.4vw,1.02rem)] leading-[1.75] text-[#6E6259]">
                  {active.description}
                </p>

                <a
                  href="/contact#quote"
                  className="mb-9 inline-flex w-fit items-center gap-2 rounded-full bg-[#A26028] px-7 py-3.5 text-[0.95rem] font-bold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121]"
                >
                  Start a Project Like This
                </a>

                <div ref={switcherRef} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    {total > 1 && (
                      <button
                        type="button"
                        onClick={() => goTo(activeIndex - 1)}
                        aria-label="Previous project"
                        className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[#1C1712]/15 text-[#1C1712] transition-colors duration-200 hover:border-[#A26028] hover:bg-[#A26028]/5 hover:text-[#A26028] active:bg-[#A26028]/10 lg:h-9 lg:w-9"
                      >
                        <ChevronIcon direction="left" />
                      </button>
                    )}

                    {/* Photo rail for the CURRENTLY ACTIVE project — every
                        merged image (hero, thumbnail, gallery). Switching
                        *projects* still happens via these arrows (and the
                        numeral rail); this row only switches the photo
                        shown in the hero frame above. */}
                    <div
                      role="tablist"
                      aria-label={`Photos of ${active.title}`}
                      className="flex flex-1 min-w-0 flex-nowrap gap-2.5 overflow-x-auto overflow-y-hidden scroll-px-2 px-0.5 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {active.images.map((img, index) => (
                        <button
                          key={`${img.url}-${index}`}
                          type="button"
                          role="tab"
                          aria-selected={index === activeImageIndex}
                          aria-label={`Photo ${index + 1} of ${active.images.length}, ${active.title}`}
                          onClick={() => selectImage(index)}
                          className={`group/thumb relative h-16 w-24 flex-none overflow-hidden rounded-lg border transition-all duration-200 lg:h-14 lg:w-20 ${
                            index === activeImageIndex
                              ? "border-[#A26028] opacity-100 ring-1 ring-[#A26028]/50"
                              : "border-[#1C1712]/10 opacity-55 hover:opacity-85"
                          }`}
                        >
                          <Image
                            src={img.url}
                            alt=""
                            fill
                            sizes="(max-width: 1024px) 96px, 80px"
                            aria-hidden="true"
                            className="object-cover"
                          />
                          <span
                            aria-hidden="true"
                            className={`absolute inset-x-0 bottom-0 h-[3px] origin-left bg-[#A26028] transition-transform duration-300 ease-out ${
                              index === activeImageIndex ? "scale-x-100" : "scale-x-0"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    {total > 1 && (
                      <button
                        type="button"
                        onClick={() => goTo(activeIndex + 1)}
                        aria-label="Next project"
                        className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[#1C1712]/15 text-[#1C1712] transition-colors duration-200 hover:border-[#A26028] hover:bg-[#A26028]/5 hover:text-[#A26028] active:bg-[#A26028]/10 lg:h-9 lg:w-9"
                      >
                        <ChevronIcon direction="right" />
                      </button>
                    )}
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
          )}
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