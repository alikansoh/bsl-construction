import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";

import type { PublicProject } from "@/components/ProjectDetail";

/**
 * app/projects/page.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * The public /projects index. Same "drawing set" system as
 * /projects/[slug] (ProjectDetail.tsx): CornerMarks registration brackets,
 * a title-block stats strip, mono annotation labels, and a faint
 * blueprint grid — so moving from the index into a project page feels
 * like turning to the next sheet in the same set rather than landing on
 * a different site.
 *
 * Category tabs are derived from whatever `category` values actually
 * exist on published projects (not a hardcoded list), so this keeps
 * working as categories are added/renamed from the admin.
 * -------------------------------------------------------------------------
 */

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

export const metadata: Metadata = {
  title: "Our Projects | BSL Construction",
  description:
    "Browse completed construction, mechanical & electrical, and commercial projects delivered by BSL Construction.",
};

/* -------------------------------------------------------------------------
 * Data fetching
 * ---------------------------------------------------------------------- */

interface ProjectsResponse {
  success: boolean;
  count?: number;
  projects?: PublicProject[];
}

/*
  Same reasoning as the [slug] page: server-side `fetch` has no implicit
  origin, so build one from an env var or fall back to the incoming
  request's own host/protocol.
*/
async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error(
      "Could not resolve a base URL for the API request — set NEXT_PUBLIC_SITE_URL.",
    );
  }

  return `${protocol}://${host}`;
}

async function getProjects(): Promise<PublicProject[]> {
  const base = await getBaseUrl();

  const res = await fetch(`${base}/api/projects`, {
    // Projects are edited from the admin at any time — always read fresh.
    // (Anonymous requests are already scoped to status=published server-side.)
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load projects");
  }

  const data: ProjectsResponse = await res.json();

  if (!data.success || !Array.isArray(data.projects)) {
    return [];
  }

  return data.projects;
}

/* -------------------------------------------------------------------------
 * Signature device: drawing-sheet corner registration marks
 * (kept local + minimal here rather than importing from the client-only
 * ProjectDetail component, since this page is a server component)
 * ---------------------------------------------------------------------- */

function CornerMarks({
  color = "#A26028",
  size = 14,
  thickness = 1.5,
  inset = 0,
}: {
  color?: string;
  size?: number;
  thickness?: number;
  inset?: number;
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
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
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

/* -------------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------------- */

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function slugifyCategory(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/*
  Derives the tab list from whatever categories are actually present on
  published projects, in first-seen order, each tagged with a stable
  URL-safe slug and a count for the title-block-style tab strip.
*/
function deriveCategories(projects: PublicProject[]) {
  const seen = new Map<string, { label: string; slug: string; count: number }>();

  for (const project of projects) {
    const label = project.category?.trim();
    if (!label) continue;

    const slug = slugifyCategory(label);
    const existing = seen.get(slug);

    if (existing) {
      existing.count += 1;
    } else {
      seen.set(slug, { label, slug, count: 1 });
    }
  }

  return Array.from(seen.values());
}

/* -------------------------------------------------------------------------
 * Project card
 * ---------------------------------------------------------------------- */

function ProjectCard({ project, index }: { project: PublicProject; index: number }) {
  const meta = [
    project.location,
    project.completedAt ? formatDate(project.completedAt) : null,
  ].filter(Boolean) as string[];

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="
        group relative flex h-full flex-col overflow-hidden
        border border-black/[0.08] bg-white
        shadow-[0_1px_2px_rgba(11,11,13,0.04)]
        transition-all duration-500 ease-out
        hover:-translate-y-1.5 hover:border-[#A26028]/30
        hover:shadow-[0_28px_60px_-24px_rgba(11,11,13,0.22)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A26028] focus-visible:ring-offset-2
      "
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#e9e6df]">
        {project.thumbnail?.url ? (
          <Image
            src={project.thumbnail.url}
            alt={project.thumbnail.alt || project.title}
            fill
            priority={index < 3}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.2,0.65,0.3,0.9)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#E9E1D7] via-[#DED3C6] to-[#CFC1B2]" />
        )}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0B0D]/78 via-[#0B0B0D]/5 to-transparent opacity-90"
        />

        <div className="absolute inset-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <CornerMarks color="#FAF7F2" size={12} thickness={1} />
        </div>

        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <span className="bsl-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/80">
            {project.category}
          </span>
          <span className="bsl-mono flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/20 text-[0.6rem] text-white/90 backdrop-blur-sm">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {project.featured && (
          <span className="bsl-mono absolute bottom-4 left-4 -rotate-3 rounded-[2px] border border-[#E8C599]/60 bg-[#0B0B0D]/40 px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.14em] text-[#E8C599] backdrop-blur-sm">
            Featured
          </span>
        )}

        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[#A26028] via-[#E8C599] to-[#A26028] transition-transform duration-500 ease-out group-hover:scale-x-100"
        />
      </div>

      <div className="relative flex flex-1 flex-col px-6 pb-6 pt-6">
        <div aria-hidden="true" className="mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-[#A26028] transition-all duration-500 group-hover:w-14" />
          {meta.length > 0 && (
            <span className="bsl-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#6b6b70]">
              {meta.join(" · ")}
            </span>
          )}
        </div>

        <h3 className="bsl-project-headline text-[1.3rem] font-medium leading-[1.15] tracking-[-0.01em] text-[#0B0B0D] transition-colors duration-300 group-hover:text-[#8A5121]">
          {project.title}
        </h3>

        {project.shortDescription && (
          <p className="bsl-body mt-3 flex-1 text-[0.9rem] leading-relaxed text-[#6b6b70]">
            {project.shortDescription}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-black/[0.08] pt-4">
          <span className="bsl-mono text-[0.62rem] uppercase tracking-[0.14em] text-[#6b6b70]">
            View Project
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#A26028]/25 text-[#A26028] transition-all duration-300 group-hover:border-[#A26028] group-hover:bg-[#A26028] group-hover:text-white">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-[2px]">
              <path d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------
 * Page
 * ---------------------------------------------------------------------- */

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ category: activeCategory }, projects] = await Promise.all([
    searchParams,
    getProjects(),
  ]);

  const categories = deriveCategories(projects);

  const visibleProjects = activeCategory
    ? projects.filter(
        (project) =>
          project.category && slugifyCategory(project.category) === activeCategory,
      )
    : projects;

  const featuredCount = projects.filter((p) => p.featured).length;

  return (
    <div
      className={`bg-[#FAF7F2] ${fraunces.variable} ${archivo.variable} ${plexMono.variable}`}
    >
      {/* =================================================================
          HERO
      ================================================================== */}
      <section className="relative overflow-hidden bg-[#0b0b0e] px-6 pb-16 pt-32 md:px-10 md:pb-20 md:pt-40">
      <Image
          src="/project.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="z-0 object-cover object-center opacity-50"
        />
        
       
        <div className="absolute inset-6 z-[3] md:inset-8">
          <CornerMarks color="#E8C599" size={18} thickness={1} />
        </div>

        <div className="relative z-[3] mx-auto max-w-[1280px]">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-12 bg-[#A26028]" />
            <span className="bsl-mono text-[0.68rem] uppercase tracking-[0.24em] text-[#E8C599]">
              Our Projects
            </span>
          </div>

          <h1 className="bsl-project-headline max-w-3xl text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[1.06] tracking-[-0.02em] text-white">
            A record of what we&apos;ve{" "}
            <span className="italic text-[#E8C599]">built and signed off</span>
          </h1>

          <p className="bsl-body mt-5 max-w-xl text-[clamp(1rem,1.3vw,1.1rem)] leading-[1.7] text-white/70">
            Every project below is a completed sheet in the same set — browse
            by discipline or view the full record.
          </p>

          {/* title-block stats strip */}
          <div className="mt-10 border-t border-white/15 pt-0">
            <div className="grid grid-cols-3">
              {[
                { label: "Projects", value: String(projects.length).padStart(2, "0") },
                { label: "Disciplines", value: String(categories.length).padStart(2, "0") },
                { label: "Featured", value: String(featuredCount).padStart(2, "0") },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`border-white/15 py-5 pr-6 ${i > 0 ? "border-l pl-6" : ""}`}
                >
                  <p className="bsl-mono text-[0.62rem] uppercase tracking-[0.24em] text-white/45">
                    {stat.label}
                  </p>
                  <p className="mt-1.5 font-serif text-lg italic text-[#E8C599]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          CATEGORY FILTER
      ================================================================== */}
      {categories.length > 0 && (
        <div className="sticky top-0 z-30 border-b border-black/10 bg-[#FAF7F2]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-2 overflow-x-auto px-6 py-4 md:px-10">
            <Link
              href="/projects"
              className={`bsl-mono whitespace-nowrap rounded-full border px-4 py-2 text-[0.68rem] uppercase tracking-[0.12em] transition-colors ${
                !activeCategory
                  ? "border-[#A26028] bg-[#A26028] text-white"
                  : "border-black/15 text-[#0B0B0D] hover:border-[#A26028] hover:text-[#A26028]"
              }`}
            >
              All ({projects.length})
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/projects?category=${cat.slug}`}
                className={`bsl-mono whitespace-nowrap rounded-full border px-4 py-2 text-[0.68rem] uppercase tracking-[0.12em] transition-colors ${
                  activeCategory === cat.slug
                    ? "border-[#A26028] bg-[#A26028] text-white"
                    : "border-black/15 text-[#0B0B0D] hover:border-[#A26028] hover:text-[#A26028]"
                }`}
              >
                {cat.label} ({cat.count})
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================
          PROJECT GRID
      ================================================================== */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(162,96,40,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(162,96,40,0.6) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative mx-auto max-w-[1280px] px-6 md:px-10">
          {visibleProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProjects.map((project, index) => (
                <ProjectCard key={project.slug} project={project} index={index} />
              ))}
            </div>
          ) : (
            <div className="relative border border-dashed border-black/15 bg-white/60 px-6 py-16 text-center">
              <p className="bsl-mono text-xs uppercase tracking-[0.1em] text-[#6b6b70]">
                No projects in this category yet
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =================================================================
          CTA
      ================================================================== */}
      <section className="mx-auto max-w-[1280px] px-6 pb-20 md:px-10 md:pb-28">
        <div className="relative overflow-hidden bg-[#0B0B0D] px-8 py-16 text-center sm:px-16">
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
              Have a project like this in mind?
            </h2>
            <p className="bsl-body mx-auto mt-4 max-w-lg text-white/70">
              Tell us what you&apos;re building and we&apos;ll get back to you
              with a straightforward quote.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact#quote"
                className="group inline-flex items-center gap-2 bg-[#A26028] px-9 py-4 text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-white outline-none transition-all duration-300 hover:-translate-y-1 hover:bg-[#8A5121] focus-visible:ring-2 focus-visible:ring-[#E8C599] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0D]"
              >
                Get a Free Quote
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

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
      `}</style>
    </div>
  );
}