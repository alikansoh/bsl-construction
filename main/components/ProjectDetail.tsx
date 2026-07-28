"use client";

/**
 * ProjectDetail.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * The public /projects/[slug] page.
 *
 * DESIGN SYSTEM — "drawing set"
 * -------------------------------------------------------------------------
 * Construction runs on documents: blueprints, title blocks, revision
 * stamps, dimension lines, survey stakes. Instead of decorating this page
 * with generic glow-blobs and filled numbered circles, every structural
 * device is borrowed from an actual drawing set:
 *
 *  - CornerMarks — the registration brackets printed on drawing sheets —
 *    frame the hero image, the sidebar note, the spec block, gallery
 *    tiles on hover, and the lightbox.
 *  - The spec sheet is laid out as a title block (DWG NO. / SCALE / REV),
 *    the way every architectural drawing identifies itself.
 *  - The challenge → solution → result band uses diamond datum markers
 *    and a ruler-tick dimension line instead of filled step-circles.
 *  - Labels and data run in a mono "annotation" face (IBM Plex Mono);
 *    prose runs in Archivo; headlines stay in Fraunces, as elsewhere in
 *    the site.
 *
 * GALLERY SOURCE: the "On site" gallery/lightbox pulls from a merged,
 * de-duplicated set of images — heroImage, thumbnail, then project.gallery,
 * in that order — rather than project.gallery alone. This means the same
 * hero shot and card thumbnail a visitor already saw are browsable inside
 * the lightbox too, instead of only living in the header/card chrome.
 *
 * Palette, motion library (GSAP + ScrollTrigger) and behaviour are
 * unchanged from the rest of the site — this is the same near-black +
 * brass system as Hero.tsx / Navbar.tsx, executed with more intention.
 *
 * Requires `gsap` (`npm install gsap`).
 */

import Image from "next/image";
import Link from "next/link";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-archivo",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex-mono",
});

/* ----------------------------------------------------------------------- */
/* Types                                                                    */
/* ----------------------------------------------------------------------- */

export interface PublicProjectImage {
  url: string;
  alt: string;
}

export interface PublicListBlock {
  title: string;
  items: string[];
}

export interface PublicProjectDetailRow {
  label: string;
  value: string;
}

export interface PublicProjectCta {
  title: string;
  content: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface PublicProject {
  title: string;
  slug: string;
  shortDescription: string;

  category: string;
  client?: string;
  location?: string;

  featured?: boolean;
  completedAt?: string;
  duration?: string;

  thumbnail: PublicProjectImage;
  heroImage: PublicProjectImage;
  gallery: PublicProjectImage[];

  overview: { title: string; content: string };

  challenges: PublicListBlock;
  solutions: PublicListBlock;
  results: PublicListBlock;

  technologies: string[];

  projectDetails: PublicProjectDetailRow[];

  cta?: PublicProjectCta;

  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

/* ----------------------------------------------------------------------- */
/* Helpers                                                                  */
/* ----------------------------------------------------------------------- */

const formatDate = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};

/*
  Splits a spec value like "4,200 sq ft" into a leading number and the
  remaining text, so the number can be counted up while the unit stays put.
  Falls back to `{ number: null }` for values with no leading digits.
*/
function splitLeadingNumber(value: string) {
  const match = value.trim().match(/^([\d,]+(?:\.\d+)?)(.*)$/);

  if (!match) {
    return { number: null as number | null, prefix: "", suffix: value };
  }

  const raw = match[1].replace(/,/g, "");
  const number = Number(raw);

  if (Number.isNaN(number)) {
    return { number: null as number | null, prefix: "", suffix: value };
  }

  const hasComma = match[1].includes(",");
  const decimals = raw.includes(".") ? raw.split(".")[1]?.length ?? 0 : 0;

  return {
    number,
    hasComma,
    decimals,
    suffix: match[2],
  };
}

const PROCESS_ACCENTS = {
  challenges: {
    hex: "#C1401F",
    tint: "#C1401F14",
    label: "The brief",
    stamp: "SITE ISSUE",
    // hazard-tag glyph — flags a logged problem, the way a site report does
    icon: (
      <path d="M6 3v18M6 4h10.5l-2 4 2 4H6" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  solutions: {
    hex: "#1F4B66",
    tint: "#1F4B6614",
    label: "Our approach",
    stamp: "METHOD",
    // spanner glyph — the fix that was specified on site
    icon: (
      <path
        d="M14.7 6.3a4 4 0 0 0-5.4 4.9L4 16.5V20h3.5l5.3-5.3a4 4 0 0 0 4.9-5.4l-2.6 2.6-2-2 2.6-2.6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  results: {
    hex: "#2F6B4F",
    tint: "#2F6B4F14",
    label: "The outcome",
    stamp: "SIGNED OFF",
    // check-in-shield glyph — a snagging sheet signed off complete
    icon: (
      <path
        d="M12 3.5 19 6v6c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5V6l7-2.5Z M9 12l2 2 4-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
} as const;

/* ----------------------------------------------------------------------- */
/* Signature device: drawing-sheet corner registration marks                */
/* ----------------------------------------------------------------------- */

function CornerMarks({
  color = "#A26028",
  size = 14,
  thickness = 1.5,
  inset = 0,
  className = "",
}: {
  color?: string;
  size?: number;
  thickness?: number;
  inset?: number;
  className?: string;
}) {
  const s = `${size}px`;
  const positions: Array<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    borders: string;
  }> = [
    { top: inset, left: inset, borders: "borderTop borderLeft" },
    { top: inset, right: inset, borders: "borderTop borderRight" },
    { bottom: inset, left: inset, borders: "borderBottom borderLeft" },
    { bottom: inset, right: inset, borders: "borderBottom borderRight" },
  ];

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      {positions.map((pos, i) => {
        const style: React.CSSProperties = {
          position: "absolute",
          width: s,
          height: s,
          top: pos.top,
          bottom: pos.bottom,
          left: pos.left,
          right: pos.right,
          borderColor: color,
          borderStyle: "solid",
          borderWidth: 0,
        };

        if (pos.borders.includes("borderTop")) style.borderTopWidth = thickness;
        if (pos.borders.includes("borderBottom"))
          style.borderBottomWidth = thickness;
        if (pos.borders.includes("borderLeft"))
          style.borderLeftWidth = thickness;
        if (pos.borders.includes("borderRight"))
          style.borderRightWidth = thickness;

        return <span key={i} style={style} />;
      })}
    </span>
  );
}

/* ----------------------------------------------------------------------- */
/* Small components                                                         */
/* ----------------------------------------------------------------------- */

function SpecValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { number, suffix, hasComma, decimals } = splitLeadingNumber(value);

  useEffect(() => {
    if (number === null || !ref.current) return;

    const el = ref.current;
    const proxy = { value: 0 };

    const formatter = new Intl.NumberFormat("en-GB", {
      maximumFractionDigits: decimals ?? 0,
      minimumFractionDigits: decimals ?? 0,
      useGrouping: hasComma ?? true,
    });

    const tween = gsap.to(proxy, {
      value: number,
      duration: 1.4,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        once: true,
      },
      onUpdate: () => {
        el.textContent = formatter.format(proxy.value) + suffix;
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (number === null) {
    return <>{value}</>;
  }

  return <span ref={ref}>0{suffix}</span>;
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-sm border border-dashed border-black/15 bg-white/60 px-4 py-6 text-center font-mono text-xs uppercase tracking-[0.1em] text-[#6b6b70]">
      {children}
    </p>
  );
}

/* ----------------------------------------------------------------------- */
/* Static content: "Why BSL" credentials band                               */
/* -------------------------------------------------------------------------
 * Unlike everything above it, this content is not per-project — it's the
 * same trust copy on every /projects/[slug] page (mirrors WhyChooseUs.tsx
 * on the homepage), restyled here as a row of drawing-sheet certification
 * stamps rather than the homepage's brass medallions, so it reads as part
 * of the same document rather than a bolted-on homepage section.
 * ----------------------------------------------------------------------- */

interface WhyBslItem {
  stamp: string;
  title: string;
  description: string;
}

const WHY_BSL: WhyBslItem[] = [
  {
    stamp: "Gas Safe",
    title: "Gas Safe registered",
    description:
      "Every gas, heating and boiler installation is carried out and signed off by Gas Safe registered engineers.",
  },
  {
    stamp: "Fully insured",
    title: "Fully insured, start to finish",
    description:
      "Public liability and professional indemnity cover sit behind every project, from strip-out to final fix.",
  },
  {
    stamp: "Site managed",
    title: "Dedicated site supervision",
    description:
      "A named supervisor runs the programme day to day, so trades stay coordinated and deadlines stay honest.",
  },
  {
    stamp: "12-mo cover",
    title: "Workmanship guarantee",
    description:
      "Every finished project is backed by a 12-month workmanship guarantee, no small print required.",
  },
];

const WHY_BSL_STATS: { value: string; label: string }[] = [
  { value: "15+", label: "Years in business" },
  { value: "100%", label: "Client satisfaction" },
  { value: "12-Mo", label: "Workmanship guarantee" },
];

/* ----------------------------------------------------------------------- */
/* Component                                                                */
/* ----------------------------------------------------------------------- */

export default function ProjectDetail({ project }: { project: PublicProject }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const metaBadges = [
    project.client && { label: "Client", value: project.client },
    project.location && { label: "Location", value: project.location },
    project.duration && { label: "Duration", value: project.duration },
    project.completedAt && {
      label: "Completed",
      value: formatDate(project.completedAt),
    },
  ].filter(Boolean) as { label: string; value: string }[];

  const processColumns = (
    [
      ["challenges", project.challenges],
      ["solutions", project.solutions],
      ["results", project.results],
    ] as const
  ).filter(([, block]) => block?.items?.length);

  const hasDetails = project.projectDetails.some(
    (detail) => detail.label || detail.value,
  );

  const hasCta = Boolean(project.cta?.title || project.cta?.content);

  const docNumber = project.slug
    ? project.slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 14)
    : "N/A";

  /*
    The "On site" gallery/lightbox draws from a merged, de-duplicated set
    of images — heroImage, thumbnail, then project.gallery, in that order —
    rather than project.gallery alone. This surfaces the hero shot and card
    thumbnail inside the browsable gallery too, instead of leaving them
    trapped in the header/card chrome where they can't be revisited.
  */
  const galleryImages: PublicProjectImage[] = (() => {
    const combined: PublicProjectImage[] = [];
    const seen = new Set<string>();

    const pushImage = (image?: PublicProjectImage) => {
      if (!image?.url || seen.has(image.url)) return;
      seen.add(image.url);
      combined.push(image);
    };

    pushImage(project.heroImage);
    pushImage(project.thumbnail);
    project.gallery.forEach(pushImage);

    return combined;
  })();

  /* -------------------------- load-in: headline -------------------------- */

  useEffect(() => {
    if (!headlineRef.current) return;

    const words = headlineRef.current.querySelectorAll<HTMLElement>(
      "[data-word]",
    );

    const tl = gsap.timeline({ delay: 0.15 });

    tl.set(words, { yPercent: 110, opacity: 0 }).to(words, {
      yPercent: 0,
      opacity: 1,
      duration: 1,
      ease: "power4.out",
      stagger: 0.045,
    });

    tl.from(
      "[data-hero-fade]",
      { y: 16, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 },
      "-=0.55",
    );

    tl.fromTo(
      "[data-hero-frame]",
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power1.out" },
      "-=0.9",
    );

    return () => {
      tl.kill();
    };
  }, []);

  /* --------------------------- hero parallax ----------------------------- */

  useEffect(() => {
    if (!heroRef.current || !heroImageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(heroImageRef.current, {
        yPercent: 18,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  /* ------------------------- generic scroll reveals ----------------------- */

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      const groups = gsap.utils.toArray<HTMLElement>("[data-reveal-group]");

      groups.forEach((group) => {
        const items = group.hasAttribute("data-reveal-self")
          ? [group]
          : gsap.utils.toArray<HTMLElement>("[data-reveal]", group);

        gsap.fromTo(
          items,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: group,
              start: "top 82%",
            },
          },
        );
      });

      // Dimension line drawn through the challenge/solution/result band.
      const line = rootRef.current!.querySelector<SVGPathElement>(
        "#process-line",
      );

      if (line) {
        const length = line.getTotalLength();

        gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });

        gsap.to(line, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: line,
            start: "top 75%",
            end: "bottom 60%",
            scrub: true,
          },
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  /* ------------------------------ lightbox -------------------------------- */

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);

      if (event.key === "ArrowRight") {
        setLightboxIndex((i) =>
          i === null ? null : (i + 1) % galleryImages.length,
        );
      }

      if (event.key === "ArrowLeft") {
        setLightboxIndex((i) =>
          i === null
            ? null
            : (i - 1 + galleryImages.length) % galleryImages.length,
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxIndex, galleryImages.length]);

  const headlineWords = project.title.split(" ");

  return (
    <div
      ref={rootRef}
      className={`bg-[#FAF7F2] ${fraunces.variable} ${archivo.variable} ${plexMono.variable}`}
    >
      {/* =================================================================
          HERO
      ================================================================== */}
      <section
        ref={heroRef}
        data-hero-root
        className="relative flex h-[92vh] min-h-[600px] w-full items-end overflow-hidden bg-[#0B0B0D]"
      >
        <div
          ref={heroImageRef}
          className="absolute inset-0 h-full w-full will-change-transform"
        >
          {project.heroImage?.url ? (
            <Image
              src={project.heroImage.url}
              alt={project.heroImage.alt || project.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-[#16171a]" />
          )}
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#0B0B0D]/60 via-[#0B0B0D]/20 to-[#0B0B0D]/92"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D]/50 via-transparent to-transparent"
        />

        {/* drawing-sheet registration marks, inset from the true edge */}
        <div data-hero-frame className="absolute inset-6 md:inset-8">
          <CornerMarks color="#E8C599" size={18} thickness={1} />
        </div>

        {/* sheet index, top right — echoes a drawing-set page reference */}
        <div
          data-hero-fade
          className="absolute right-8 top-8 hidden text-right sm:block"
        >
          <p className="bsl-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/40">
            Plan ref.
          </p>
          <p className="bsl-mono text-[0.72rem] uppercase tracking-[0.1em] text-[#E8C599]">
            {docNumber}
          </p>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 pb-10 pt-32 md:px-10">
          <div
            data-hero-fade
            className="mb-5 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/projects"
              className="bsl-mono text-[0.68rem] uppercase tracking-[0.28em] text-white/55 outline-none transition-colors hover:text-[#E8C599] focus-visible:text-[#E8C599] focus-visible:ring-1 focus-visible:ring-[#E8C599]"
            >
              Projects
            </Link>
            <span className="text-white/30">/</span>
            <span className="bsl-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#E8C599]">
              {project.category}
            </span>
          </div>

          <h1
            ref={headlineRef}
            className="bsl-project-headline max-w-4xl text-[clamp(2.4rem,6vw,5rem)] font-medium leading-[1.04] tracking-[-0.02em] text-white"
          >
            {headlineWords.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="inline-block overflow-hidden pb-1 align-bottom"
              >
                <span data-word className="inline-block will-change-transform">
                  {word}
                  {i < headlineWords.length - 1 ? "\u00A0" : ""}
                </span>
              </span>
            ))}
          </h1>

          {project.shortDescription && (
            <p
              data-hero-fade
              className="bsl-body mt-5 max-w-xl text-[clamp(1rem,1.4vw,1.15rem)] leading-[1.7] text-white/75"
            >
              {project.shortDescription}
            </p>
          )}

          {/* hero action row — primary quote CTA + secondary jump-to-gallery,
              the two things a visitor actually wants to do from this screen */}
          {galleryImages.length > 0 && (
            <div
              data-hero-fade
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <a
                href="#gallery"
                className="group inline-flex items-center gap-2 bg-[#A26028] px-7 py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-white outline-none transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8A5121] focus-visible:ring-2 focus-visible:ring-[#E8C599] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0D]"
              >
                See the Project
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-6-6m6 6l6-6" />
                </svg>
              </a>

              <Link
                href="/contact#quote"
                className="group inline-flex items-center gap-2 border border-white/30 px-7 py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-white outline-none transition-all duration-300 hover:border-[#E8C599] hover:text-[#E8C599] focus-visible:ring-2 focus-visible:ring-[#E8C599] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0D]"
              >
                Start a Similar Project
              </Link>
            </div>
          )}

          {/* title-block strip: mirrors the identification band on a real
              construction drawing sheet */}
          {metaBadges.length > 0 && (
            <div
              data-hero-fade
              className="mt-10 border-t border-white/15 pt-0"
            >
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap">
                {metaBadges.map((badge, i) => (
                  <div
                    key={badge.label}
                    className={`border-white/15 py-5 pr-6 ${
                      i > 0 ? "sm:border-l sm:pl-6" : ""
                    } ${i % 2 === 1 ? "border-l pl-6 sm:pl-6" : ""}`}
                  >
                    <p className="bsl-mono text-[0.62rem] uppercase tracking-[0.24em] text-white/45">
                      {badge.label}
                    </p>
                    <p className="mt-1.5 font-serif text-base italic text-[#E8C599]">
                      {badge.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =================================================================
          OVERVIEW
      ================================================================== */}
      <section className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-28">
        <div
          data-reveal-group
          className="grid gap-10 md:grid-cols-[1.6fr_1fr] md:gap-16"
        >
          <div data-reveal>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-12 bg-[#A26028]" />
              <span className="bsl-mono text-[0.64rem] uppercase tracking-[0.24em] text-[#A26028]">
                01 — Overview
              </span>
            </div>
            <h2 className="bsl-project-headline text-[clamp(1.8rem,3vw,2.6rem)] font-medium leading-[1.1] tracking-[-0.01em] text-[#0B0B0D]">
              {project.overview.title || "Overview"}
            </h2>

            {project.overview.content ? (
              <div
                className="bsl-body prose prose-lg mt-6 max-w-none text-[#3d3d42] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-6xl first-letter:italic first-letter:text-[#A26028] prose-headings:font-medium prose-headings:text-[#0B0B0D] prose-a:text-[#A26028]"
                dangerouslySetInnerHTML={{ __html: project.overview.content }}
              />
            ) : (
              <div className="mt-6">
                <EmptyNote>Overview content coming soon</EmptyNote>
              </div>
            )}
          </div>

          {project.technologies.length > 0 && (
            <div data-reveal className="md:pt-1">
              <div className="relative border border-black/[0.08] bg-white p-6 md:sticky md:top-28">
                <CornerMarks color="#A26028" size={12} thickness={1} inset={-1} />
                <p className="bsl-mono text-[0.66rem] uppercase tracking-[0.24em] text-[#A26028]">
                  On this project
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {project.technologies.map((tech, i) => (
                    <span
                      key={`${tech}-${i}`}
                      className="bsl-mono rounded-sm bg-[#1F4B66]/8 px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.04em] text-[#1F4B66]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =================================================================
          PROCESS: CHALLENGES -> SOLUTIONS -> RESULTS
          Redesigned as three annotated site-report sheets — each column
          is a torn "page" with its own stamp, glyph, tint wash, and
          hand-off arrow into the next stage, so the sequence reads as a
          real progression (problem logged -> method applied -> signed
          off) rather than three interchangeable icon cards.
          NOTE: light background (was near-black) — kept the blueprint
          grid + brass accents so it still reads as a drawing sheet.
      ================================================================== */}
      {processColumns.length > 0 && (
        <section className="relative overflow-hidden bg-[#FAF7F2] py-20 md:py-28">
          {/* faint blueprint grid, anchors the whole band as "a drawing" */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(162,96,40,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(162,96,40,0.6) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />

          <div className="relative mx-auto max-w-[1280px] px-6 md:px-10">
            <div
              data-reveal-group
              data-reveal-self
              className="mb-14 flex flex-wrap items-end justify-between gap-6"
            >
              <div className="max-w-2xl">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px w-12 bg-[#A26028]" />
                  <span className="bsl-mono text-[0.64rem] uppercase tracking-[0.24em] text-[#A26028]">
                    02 — Process
                  </span>
                </div>
                <h2 className="bsl-project-headline text-[clamp(1.8rem,3vw,2.4rem)] font-medium leading-[1.1] text-[#0B0B0D]">
                  From <span className="italic text-[#A26028]">brief</span> to
                  finished build
                </h2>
              </div>
              <p className="bsl-body max-w-sm text-sm leading-relaxed text-[#6b6b70]">
                Every project moves through the same three-stage record: what
                was logged on site, how it was resolved, and what it looked
                like signed off.
              </p>
            </div>

            <div className="relative">
              {processColumns.length > 1 && (
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 right-0 top-[52px] hidden h-px w-full md:block"
                  preserveAspectRatio="none"
                >
                  <path
                    id="process-line"
                    d="M 0 0.5 L 2000 0.5"
                    stroke="#A26028"
                    strokeWidth="1"
                    strokeDasharray="1 7"
                    fill="none"
                  />
                </svg>
              )}

              <div
                data-reveal-group
                className="grid gap-6 md:grid-cols-3 md:gap-8"
              >
                {processColumns.map(([key, block], index) => {
                  const accent = PROCESS_ACCENTS[key];
                  const isLast = index === processColumns.length - 1;

                  return (
                    <div key={key} className="relative flex">
                      <div
                        data-reveal
                        className="relative flex w-full flex-col overflow-hidden border border-black/[0.08] bg-white p-7 shadow-[0_1px_2px_rgba(11,11,13,0.04)] transition-colors duration-300 hover:border-black/20"
                      >
                        <CornerMarks color={accent.hex} size={11} thickness={1} inset={6} />

                        {/* tint wash unique to this stage */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-2xl"
                          style={{ backgroundColor: accent.tint }}
                        />

                        <div className="relative flex items-center justify-between">
                          <span
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[1.5px]"
                            style={{ borderColor: accent.hex, color: accent.hex }}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.6}
                            >
                              {accent.icon}
                            </svg>
                          </span>

                          <span
                            aria-hidden="true"
                            className="bsl-mono -rotate-3 rounded-[2px] border border-dashed px-2 py-1 text-[0.58rem] uppercase tracking-[0.14em]"
                            style={{ borderColor: `${accent.hex}80`, color: accent.hex }}
                          >
                            {accent.stamp}
                          </span>
                        </div>

                        <p
                          className="bsl-mono relative mt-6 text-[0.64rem] uppercase tracking-[0.24em]"
                          style={{ color: accent.hex }}
                        >
                          Stage 0{index + 1} — {accent.label}
                        </p>

                        <h3 className="relative mt-2 text-xl font-semibold text-[#0B0B0D]">
                          {block.title}
                        </h3>

                        <ul className="bsl-body relative mt-5 flex-1 space-y-3.5 border-t border-black/[0.08] pt-5">
                          {block.items.map((item, i) => (
                            <li
                              key={i}
                              className="flex gap-3 text-[0.94rem] leading-relaxed text-[#4a4a4f]"
                            >
                              <span
                                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{ backgroundColor: accent.hex }}
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* hand-off arrow into the next stage's sheet */}
                      {!isLast && (
                        <div
                          aria-hidden="true"
                          className="absolute -right-4 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-[#FAF7F2] text-[#A26028] md:flex"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-5-5m5 5l-5 5" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =================================================================
          GALLERY — reworked as a lit contact sheet: a large lead plate,
          a denser supporting grid, always-visible plate captions, and a
          "view all" control that opens the lightbox from the top. Draws
          from `galleryImages` (heroImage + thumbnail + project.gallery,
          de-duplicated) rather than project.gallery alone, so the header
          shot and card image are also browsable here.
      ================================================================== */}
      {galleryImages.length > 0 && (
        <section
          id="gallery"
          className="mx-auto max-w-[1280px] scroll-mt-24 px-6 py-20 md:px-10 md:py-28"
        >
          <div
            data-reveal-group
            data-reveal-self
            className="mb-10 flex flex-wrap items-end justify-between gap-6"
          >
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-12 bg-[#A26028]" />
                <span className="bsl-mono text-[0.64rem] uppercase tracking-[0.24em] text-[#A26028]">
                  03 — Gallery
                </span>
              </div>
              <h2 className="bsl-project-headline text-[clamp(1.8rem,3vw,2.4rem)] font-medium text-[#0B0B0D]">
                On site
              </h2>
            </div>

            <div className="flex items-center gap-5">
              <p className="bsl-mono text-xs uppercase tracking-[0.1em] text-[#6b6b70]">
                {String(galleryImages.length).padStart(2, "0")} plate
                {galleryImages.length === 1 ? "" : "s"}
              </p>
              <button
                type="button"
                onClick={() => setLightboxIndex(0)}
                className="group inline-flex items-center gap-2 border border-black/15 px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#0B0B0D] outline-none transition-all duration-300 hover:border-[#A26028] hover:text-[#A26028] focus-visible:ring-2 focus-visible:ring-[#A26028] focus-visible:ring-offset-2"
              >
                View All Photos
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m8-16h2a2 2 0 012 2v2m-4 12h2a2 2 0 002-2v-2" />
                </svg>
              </button>
            </div>
          </div>

          <div
            data-reveal-group
            className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
          >
            {galleryImages.map((image, index) => {
              const isLead = index === 0;

              return (
                <button
                  key={`${image.url}-${index}`}
                  type="button"
                  data-reveal
                  onClick={() => setLightboxIndex(index)}
                  className={`group relative overflow-hidden bg-[#e9e6df] outline-none focus-visible:ring-2 focus-visible:ring-[#A26028] focus-visible:ring-offset-2 ${
                    isLead
                      ? "col-span-2 row-span-2 aspect-square"
                      : index % 5 === 0
                        ? "col-span-2 row-span-2 aspect-square"
                        : "aspect-square"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || `${project.title} photo ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                  {/* permanent base gradient so captions stay legible even
                      without hover, plus a stronger wash on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D]/70 via-[#0B0B0D]/0 to-[#0B0B0D]/0 opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
                  <div className="absolute inset-0 bg-[#0B0B0D]/0 transition-colors duration-300 group-hover:bg-[#0B0B0D]/10" />

                  <div className="absolute inset-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <CornerMarks color="#FAF7F2" size={12} thickness={1} />
                  </div>

                  {/* zoom affordance, mirrors a loupe on a contact sheet */}
                  <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-[#0B0B0D]/30 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="11" cy="11" r="7" />
                      <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
                    </svg>
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <p className="bsl-mono text-[0.65rem] uppercase tracking-[0.14em] text-white">
                      Fig. {String(index + 1).padStart(2, "0")}
                    </p>
                    {isLead && (
                      <span className="bsl-mono rounded-[2px] border border-[#E8C599]/60 bg-[#0B0B0D]/40 px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.14em] text-[#E8C599] backdrop-blur-sm">
                        Lead plate
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* =================================================================
          SPEC SHEET — laid out as a drawing title block
      ================================================================== */}
      {hasDetails && (
        <section className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-[900px] px-6 md:px-10">
            <div
              data-reveal-group
              data-reveal-self
              className="mb-10 flex items-center justify-center gap-3"
            >
              <span className="h-px w-12 bg-[#A26028]" />
              <span className="bsl-mono text-[0.64rem] uppercase tracking-[0.24em] text-[#A26028]">
                04 — Specification
              </span>
              <span className="h-px w-12 bg-[#A26028]" />
            </div>

            <div data-reveal-group data-reveal-self className="relative border border-black/[0.12]">
              <CornerMarks color="#0B0B0D" size={14} thickness={1} inset={-1} />

              {/* title-block header strip */}
              <div className="grid grid-cols-3 divide-x divide-black/[0.12] border-b border-black/[0.12]">
                <div className="px-4 py-3">
                  <p className="bsl-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#9a9a9e]">
                    Dwg no.
                  </p>
                  <p className="bsl-mono mt-0.5 text-[0.72rem] text-[#0B0B0D]">
                    {docNumber}
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="bsl-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#9a9a9e]">
                    Scale
                  </p>
                  <p className="bsl-mono mt-0.5 text-[0.72rem] text-[#0B0B0D]">
                    N.T.S.
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="bsl-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#9a9a9e]">
                    Rev.
                  </p>
                  <p className="bsl-mono mt-0.5 text-[0.72rem] text-[#0B0B0D]">
                    A
                  </p>
                </div>
              </div>

              <div className="divide-y divide-black/[0.08]">
                {project.projectDetails
                  .filter((d) => d.label || d.value)
                  .map((detail, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-6 px-5 py-4"
                    >
                      <dt className="bsl-mono text-[0.72rem] uppercase tracking-[0.06em] text-[#6b6b70]">
                        {detail.label || "—"}
                      </dt>
                      <dd className="font-serif text-lg italic text-[#0B0B0D]">
                        {detail.value ? <SpecValue value={detail.value} /> : "—"}
                      </dd>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =================================================================
          TECHNOLOGIES TICKER (reprise of the homepage services marquee)
      ================================================================== */}
      {project.technologies.length > 0 && (
        <div className="relative border-y border-white/10 bg-[#0B0B0D] py-5">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#A26028] to-transparent"
          />
          <div
            className="overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0, black 48px, black calc(100% - 48px), transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0, black 48px, black calc(100% - 48px), transparent 100%)",
            }}
          >
            <div className="flex w-max animate-[bsl-project-marquee_28s_linear_infinite]">
              {[...project.technologies, ...project.technologies, ...project.technologies].map(
                (tech, i) => (
                  <span
                    key={`${tech}-${i}`}
                    className="bsl-mono flex shrink-0 items-center gap-6 whitespace-nowrap px-6 text-[0.72rem] uppercase tracking-[0.16em] text-white/75"
                  >
                    {tech}
                    <span aria-hidden="true" className="relative h-2.5 w-2.5 text-[#A26028]">
                      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
                      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
                    </span>
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
          WHY BSL — static credentials band (see note above data arrays):
          the same trust content on every project page, styled as a row of
          drawing-sheet certification stamps so it reads as part of this
          document rather than a bolted-on homepage section.
      ================================================================== */}
      <section className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-28">
        <div
          data-reveal-group
          data-reveal-self
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#A26028]" />
            <span className="bsl-mono text-[0.64rem] uppercase tracking-[0.24em] text-[#A26028]">
              05 — Why BSL
            </span>
            <span className="h-px w-12 bg-[#A26028]" />
          </div>
          <h2 className="bsl-project-headline text-[clamp(1.8rem,3vw,2.6rem)] font-medium leading-[1.1] tracking-[-0.01em] text-[#0B0B0D]">
            Every build signed off to the{" "}
            <span className="italic text-[#A26028]">same standard</span>
          </h2>
          <p className="bsl-body mt-4 text-[0.98rem] leading-[1.7] text-[#6b6b70]">
            The certifications, cover, and aftercare behind this project
            stand behind every project we build.
          </p>
        </div>

        <div
          data-reveal-group
          className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
        >
          {WHY_BSL.map((item) => (
            <div
              key={item.title}
              data-reveal
              className="relative border border-black/[0.08] bg-white p-6"
            >
              <CornerMarks color="#A26028" size={10} thickness={1} inset={-1} />

              <span
                aria-hidden="true"
                className="bsl-mono inline-block -rotate-3 rounded-[2px] border border-dashed border-[#A26028]/50 px-2 py-1 text-[0.6rem] uppercase tracking-[0.12em] text-[#A26028]"
              >
                {item.stamp}
              </span>

              <h3 className="mt-4 text-[0.98rem] font-semibold leading-snug text-[#0B0B0D]">
                {item.title}
              </h3>
              <p className="bsl-body mt-2 text-[0.86rem] leading-relaxed text-[#6b6b70]">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* stats — a second title-block row, reusing the spec sheet's
            count-up mechanic (SpecValue) for consistency */}
        <div
          data-reveal-group
          data-reveal-self
          className="relative mt-5 grid grid-cols-3 divide-x divide-black/[0.1] border border-black/[0.08] bg-white"
        >
          <CornerMarks color="#0B0B0D" size={12} thickness={1} inset={-1} />
          {WHY_BSL_STATS.map((stat) => (
            <div key={stat.label} className="px-4 py-6 text-center sm:px-6">
              <p className="font-serif text-[clamp(1.6rem,3vw,2.2rem)] italic text-[#0B0B0D]">
                <SpecValue value={stat.value} />
              </p>
              <p className="bsl-mono mt-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-[#6b6b70]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =================================================================
          CTA
      ================================================================== */}
      <section className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-28">
        <div
          data-reveal-group
          data-reveal-self
          className="relative overflow-hidden rounded-none bg-[#0B0B0D] px-8 py-16 text-center sm:px-16"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(232,197,153,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(232,197,153,0.6) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="absolute inset-5 sm:inset-8">
            <CornerMarks color="#A26028" size={18} thickness={1} />
          </div>

          <div className="relative">
            <h2 className="bsl-project-headline mx-auto max-w-2xl text-[clamp(1.8rem,3.5vw,2.8rem)] font-medium leading-[1.1] text-white">
              {hasCta
                ? project.cta!.title
                : "Have a project like this in mind?"}
            </h2>

            {hasCta && project.cta!.content ? (
              <div
                className="bsl-body prose prose-invert mx-auto mt-4 max-w-lg text-white/70"
                dangerouslySetInnerHTML={{ __html: project.cta!.content }}
              />
            ) : (
              <p className="bsl-body mx-auto mt-4 max-w-lg text-white/70">
                Tell us what you&apos;re building and we&apos;ll get back to
                you with a straightforward quote.
              </p>
            )}

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={hasCta && project.cta!.buttonHref ? project.cta!.buttonHref : "/contact#quote"}
                className="group inline-flex items-center gap-2 bg-[#A26028] px-9 py-4 text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-white outline-none transition-all duration-300 hover:-translate-y-1 hover:bg-[#8A5121] focus-visible:ring-2 focus-visible:ring-[#E8C599] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0D]"
              >
                {hasCta && project.cta!.buttonLabel
                  ? project.cta!.buttonLabel
                  : "Get a Free Quote"}
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>

              <Link
                href="/projects"
                className="inline-flex items-center gap-2 border border-white/25 px-9 py-4 text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-white outline-none transition-all duration-300 hover:border-[#E8C599] hover:text-[#E8C599] focus-visible:ring-2 focus-visible:ring-[#E8C599] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0D]"
              >
                See More Projects
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/projects"
            className="bsl-mono text-xs uppercase tracking-[0.14em] text-[#6b6b70] outline-none transition-colors hover:text-[#0B0B0D] focus-visible:text-[#0B0B0D]"
          >
            ← Back to all projects
          </Link>
        </div>
      </section>

      {/* =================================================================
          LIGHTBOX
      ================================================================== */}
      {lightboxIndex !== null && galleryImages[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0B0D]/94 p-4 backdrop-blur-sm sm:p-8"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setLightboxIndex(null);
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close photo viewer"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl font-light text-white outline-none transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-[#E8C599] sm:right-6 sm:top-6"
          >
            ×
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() =>
                  setLightboxIndex((i) =>
                    i === null
                      ? null
                      : (i - 1 + galleryImages.length) % galleryImages.length,
                  )
                }
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white outline-none transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-[#E8C599] sm:left-6"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() =>
                  setLightboxIndex((i) =>
                    i === null ? null : (i + 1) % galleryImages.length,
                  )
                }
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white outline-none transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-[#E8C599] sm:right-6"
              >
                ›
              </button>
            </>
          )}

          <div className="relative h-full max-h-[80vh] w-full max-w-4xl">
            <div className="absolute inset-3">
              <CornerMarks color="#E8C599" size={16} thickness={1} />
            </div>
            <Image
              src={galleryImages[lightboxIndex].url}
              alt={
                galleryImages[lightboxIndex].alt ||
                `${project.title} photo ${lightboxIndex + 1}`
              }
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>

          <p className="bsl-mono absolute bottom-5 text-[0.65rem] uppercase tracking-[0.18em] text-white/60">
            Fig. {String(lightboxIndex + 1).padStart(2, "0")} / {String(galleryImages.length).padStart(2, "0")}
          </p>
        </div>
      )}

      <style>{`
        .bsl-project-headline {
          font-family: var(--font-fraunces), 'Iowan Old Style', 'Palatino Linotype', Palatino, serif;
        }

        .bsl-body {
          font-family: var(--font-archivo), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .bsl-mono {
          font-family: var(--font-plex-mono), ui-monospace, 'SFMono-Regular', Menlo, monospace;
        }

        @keyframes bsl-project-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.3333%); }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-word] { transform: none !important; opacity: 1 !important; }
        }
      `}</style>
    </div>
  );
}