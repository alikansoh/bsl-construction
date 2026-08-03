import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";

/**
 * app/blog/[slug]/page.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * The public article page. Continues the drawing-set system from
 * /projects/[slug]: a light title-block hero with CornerMarks, a stats
 * strip (here: Category / Author / Read Time in place of location/date),
 * and a faint blueprint grid on the body section. The article body itself
 * is set in Fraunces/Archivo prose so long-form reading stays legible
 * against the rest of the site's tighter display type.
 *
 * Note: `content` is assumed to be sanitized HTML from the admin's rich
 * text editor (matching the Blog model) and is rendered accordingly. If
 * it's actually Markdown, swap the body render for your markdown renderer
 * of choice (e.g. react-markdown) — the surrounding `.bsl-prose` styles
 * will still apply.
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

/* -------------------------------------------------------------------------
 * Types & data fetching
 * ---------------------------------------------------------------------- */

interface BlogImage {
  url: string;
  alt?: string;
}

interface BlogSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

interface PublicBlog {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  tags?: string[];
  status: string;
  featured?: boolean;
  publishedAt?: string;
  readTime?: string;
  thumbnail?: BlogImage;
  coverImage?: BlogImage;
  content: string;
  seo?: BlogSeo;
}

interface BlogResponse {
  success: boolean;
  blog?: PublicBlog;
}

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

async function getBlog(slug: string): Promise<PublicBlog | null> {
  const base = await getBaseUrl();

  const res = await fetch(`${base}/api/blogs/${slug}`, {
    // Posts are edited from the admin at any time — always read fresh.
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to load blog post");
  }

  const data: BlogResponse = await res.json();

  if (!data.success || !data.blog) {
    return null;
  }

  return data.blog;
}

/* -------------------------------------------------------------------------
 * Metadata
 * ---------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlog(slug);

  if (!post) {
    return { title: "Article not found" };
  }

  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || post.excerpt;

  return {
    title,
    description,
    keywords: post.seo?.keywords?.length ? post.seo.keywords : undefined,
    openGraph: {
      title,
      description,
      images: post.coverImage?.url ? [{ url: post.coverImage.url }] : undefined,
      type: "article",
    },
  };
}

/* -------------------------------------------------------------------------
 * Signature device: drawing-sheet corner registration marks
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

function formatLongDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function slugifyCategory(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* -------------------------------------------------------------------------
 * Page
 * ---------------------------------------------------------------------- */

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlog(slug);

  if (!post) {
    notFound();
  }

  const heroImage = post.coverImage?.url || post.thumbnail?.url;

  return (
    <div
      className={`bg-[#FAF7F2] ${fraunces.variable} ${archivo.variable} ${plexMono.variable}`}
    >
      {/* =================================================================
          HERO / TITLE BLOCK
      ================================================================== */}
      <section className="relative overflow-hidden bg-[#F3ECE0] px-6 pb-16 pt-32 md:px-10 md:pb-20 md:pt-40">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={post.coverImage?.alt || post.title}
            fill
            priority
            sizes="100vw"
            className="z-0 object-cover object-center opacity-25"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 bg-gradient-to-br from-[#F8F2E6] via-[#F3ECE0] to-[#EFE6D6]"
          />
        )}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#F3ECE0] via-[#F3ECE0]/75 to-[#F3ECE0]/35"
        />

        <div className="absolute inset-6 z-[3] md:inset-8">
          <CornerMarks color="#A26028" size={18} thickness={1} />
        </div>

        <div className="relative z-[3] mx-auto max-w-[880px]">
          <Link
            href="/blog"
            className="bsl-mono group mb-8 inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.18em] text-[#0B0B0D]/55 transition-colors hover:text-[#A26028]"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1">
              <path d="M12 7H2M2 7L6.5 2.5M2 7L6.5 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Field Notes
          </Link>

          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-12 bg-[#A26028]" />
            <Link
              href={`/blog?category=${slugifyCategory(post.category)}`}
              className="bsl-mono text-[0.68rem] uppercase tracking-[0.24em] text-[#8A5121] hover:underline"
            >
              {post.category}
            </Link>
          </div>

          <h1 className="bsl-project-headline max-w-3xl text-[clamp(2rem,4.6vw,3.4rem)] font-medium leading-[1.1] tracking-[-0.02em] text-[#0B0B0D]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="bsl-body mt-5 max-w-2xl text-[clamp(1rem,1.3vw,1.1rem)] leading-[1.7] text-[#0B0B0D]/65">
              {post.excerpt}
            </p>
          )}

          {/* title-block stats strip */}
          <div className="mt-10 border-t border-black/10 pt-0">
            <div className="grid grid-cols-3">
              {[
                { label: "Author", value: post.author },
                { label: "Published", value: formatLongDate(post.publishedAt) },
                { label: "Read Time", value: post.readTime || "—" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`border-black/10 py-5 pr-4 ${i > 0 ? "border-l pl-4" : ""}`}
                >
                  <p className="bsl-mono text-[0.6rem] uppercase tracking-[0.22em] text-[#0B0B0D]/45">
                    {stat.label}
                  </p>
                  <p className="bsl-project-headline mt-1.5 text-[0.95rem] italic leading-tight text-[#8A5121] sm:text-lg">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          ARTICLE BODY
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

        <div className="relative mx-auto max-w-[760px] px-6 md:px-10">
          <article
            className="bsl-prose"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.tags && post.tags.length > 0 && (
            <div className="mt-14 flex flex-wrap items-center gap-2 border-t border-black/[0.08] pt-8">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bsl-mono rounded-full border border-[#A26028]/25 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.1em] text-[#8A5121]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-black/[0.08] pt-8">
            <div>
              <p className="bsl-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#6b6b70]">
                Written by
              </p>
              <p className="bsl-project-headline mt-1 text-[1.05rem] text-[#0B0B0D]">
                {post.author}
              </p>
            </div>
            <Link
              href="/blog"
              className="bsl-mono group flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.14em] text-[#A26028] hover:text-[#8A5121]"
            >
              More Notes
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#A26028]/25 text-[#A26028] transition-all duration-300 group-hover:border-[#A26028] group-hover:bg-[#A26028] group-hover:text-white">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-[2px]">
                  <path d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </div>
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

        /* Article body typography — Fraunces headings over Archivo body,
           so long-form reading stays warm and legible against the rest
           of the site's tighter display type. */
        .bsl-prose {
          font-family: var(--font-archivo), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 1.05rem;
          line-height: 1.8;
          color: #2b2b2e;
        }
        .bsl-prose > * + * {
          margin-top: 1.3em;
        }
        .bsl-prose h2 {
          font-family: var(--font-fraunces), 'Iowan Old Style', Palatino, serif;
          font-size: clamp(1.4rem, 2.4vw, 1.9rem);
          font-weight: 500;
          letter-spacing: -0.01em;
          line-height: 1.25;
          color: #0B0B0D;
          margin-top: 2em;
        }
        .bsl-prose h3 {
          font-family: var(--font-fraunces), 'Iowan Old Style', Palatino, serif;
          font-size: clamp(1.15rem, 1.8vw, 1.4rem);
          font-weight: 500;
          line-height: 1.3;
          color: #0B0B0D;
          margin-top: 1.8em;
        }
        .bsl-prose a {
          color: #A26028;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .bsl-prose strong {
          color: #0B0B0D;
          font-weight: 600;
        }
        .bsl-prose blockquote {
          border-left: 2px solid #A26028;
          padding-left: 1.25em;
          font-style: italic;
          color: #6b6b70;
        }
        .bsl-prose ul,
        .bsl-prose ol {
          padding-left: 1.4em;
        }
        .bsl-prose li + li {
          margin-top: 0.5em;
        }
        .bsl-prose img {
          width: 100%;
          height: auto;
          border: 1px solid rgba(11,11,13,0.08);
        }
        .bsl-prose code {
          font-family: var(--font-plex-mono), ui-monospace, monospace;
          font-size: 0.9em;
          background: rgba(162,96,40,0.08);
          padding: 0.15em 0.4em;
        }
        .bsl-prose hr {
          border: none;
          border-top: 1px solid rgba(11,11,13,0.1);
        }
      `}</style>
    </div>
  );
}