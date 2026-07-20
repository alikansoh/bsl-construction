/**
 * app/services/[slug]/page.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Redesign pass v8 — "Blueprint Light" (hero contrast fix)
 *
 * WHAT CHANGED FROM v7
 * 1. HERO OVERLAY REBUILT — v7 tried to carve out an opaque "paper" panel
 *    on the left of the hero via a hard-stopped diagonal gradient
 *    (`var(--bsl-paper) 0%, var(--bsl-paper) 26%...`). Two problems: (a)
 *    that panel was a fully opaque solid color, so it didn't tint the
 *    photo, it erased it — exactly where the headline sits, which is the
 *    one place a photographic hero most needs to be visible; and (b) a
 *    100deg gradient's stop positions shift with the box's aspect ratio,
 *    so on a wide/short hero the "safe" zone didn't land in the same
 *    place as the text, and on some images/viewports the h1 ended up
 *    partly over raw photo with dark ink-colored text on it — unreadable.
 *    Replaced with a single, consistent left-to-right dark scrim plus a
 *    top-down nav scrim. Both are translucent (never opaque), so the
 *    photo is always visible, and both are dark enough everywhere text
 *    sits that light text reads reliably regardless of the individual
 *    service photo's own brightness or the viewport's aspect ratio.
 * 2. HERO TEXT FLIPPED TO LIGHT — headline, kicker, back link, and spec
 *    list were all dark ink colors, which is what made them disappear
 *    into the photo. Now white/paper-toned, with the category kicker and
 *    dimension rule using --bsl-blue-bright (not the base --bsl-blue,
 *    which is too muted against a dark backdrop) so the blue "plan"
 *    vocabulary still reads on the dark hero, and a light tan swapped in
 *    for the brown "build" bullet dots for the same reason.
 * 3. BLUEPRINT DOTS MOVED ABOVE THE SCRIM — previously sandwiched between
 *    the photo and the dark wash, so the wash mostly cancelled them out.
 *    Now drawn in a light paper tint above the scrim, so the texture
 *    actually reads.
 * 4. SUBTLE HEADLINE TEXT-SHADOW ADDED — small insurance for the busiest
 *    parts of any given photo; kept low-blur/low-opacity so it doesn't
 *    read as a glossy effect.
 * -------------------------------------------------------------------------
 */
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import { getAllServices, getServiceBySlug, getOtherServices } from "@/lib/services";
import ServiceFaqAccordion from "@/components/Servicefaqaccordion";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-mono",
});

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllServices().map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.title} | BSL Construction`,
    description: service.shortDescription,
  };
}

const PROCESS_STEPS = [
  {
    title: "Tell Us What's Needed",
    copy: "A quick fix or a full renovation — describe the job and we'll give you an honest, no-pressure quote.",
  },
  {
    title: "Scope & Schedule",
    copy: "For bigger work we plan materials and layout together; for repairs and maintenance, we just book a time that suits you.",
  },
  {
    title: "Get It Done",
    copy: "Our tradespeople show up on time, whether it's a one-hour callout or a multi-week build — tidy, and in constant contact.",
  },
  {
    title: "Sign Off Together",
    copy: "We check the work with you before we call it done. Not right, or something else turns up? We come back and fix it.",
  },
];

const HERO_SPECS = [
  { label: "Big Renovations & Small Repairs", detail: "Same crew, same standard, either way" },
  { label: "Free, No-Pressure Quotes", detail: "Honest pricing, up front" },
  { label: "On Time, Every Time", detail: "We work to the schedule we give you" },
];

const TRUST_ITEMS = ["No call-out fee", "Written quote in 48hrs", "Local tradespeople"];

const WHY_BSL_ITEMS = [
  {
    title: "Licensed & Insured",
    copy: "Every job is covered — full public liability insurance and licensed tradespeople, no exceptions.",
    icon: (
      <path
        d="M11 2L18 5V10.5C18 15 14.9 18.6 11 20C7.1 18.6 4 15 4 10.5V5L11 2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Fixed-Price Quotes",
    copy: "The number you're quoted is the number you pay. No surprise line items once the work is underway.",
    icon: (
      <path
        d="M11 3V19M15.5 6.5C15.5 5 13.5 4 11 4C8.5 4 6.5 5.2 6.5 7C6.5 8.8 8.5 9.5 11 10C13.5 10.5 15.5 11.2 15.5 13C15.5 14.8 13.5 16 11 16C8.5 16 6.5 15 6.5 13.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Local Tradespeople",
    copy: "Every crew member lives and works in the area — no subcontracted strangers, no long call-out drives.",
    icon: (
      <path
        d="M11 20C11 20 17.5 14.6 17.5 9.5C17.5 5.9 14.6 3 11 3C7.4 3 4.5 5.9 4.5 9.5C4.5 14.6 11 20 11 20Z M11 12C12.38 12 13.5 10.88 13.5 9.5C13.5 8.12 12.38 7 11 7C9.62 7 8.5 8.12 8.5 9.5C8.5 10.88 9.62 12 11 12Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Workmanship Guarantee",
    copy: "If something isn't right after we've signed off, we come back and put it right at no extra cost.",
    icon: (
      <path
        d="M4 11L9 16L18 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const related = getOtherServices()
    .filter((s) => s.slug !== service.slug)
    .sort((a, b) => {
      const aMatch = a.category === service.category ? 0 : 1;
      const bMatch = b.category === service.category ? 0 : 1;
      return aMatch - bMatch;
    })
    .slice(0, 3);

  const faqStructuredData =
    service.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: service.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  const leadParagraph = service.description[0];
  const restParagraphs = service.description.slice(1);
  const pullQuote = service.highlights[0];

  return (
    <main className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} bsl-root`}>
      <style>{`
        :root {
          --bsl-ink: #1C2321;
          --bsl-ink-soft: #4C5652;
          --bsl-paper: #F6F4EE;
          --bsl-paper-deep: #ECE7DC;
          --bsl-blue: #2B5A6B;
          --bsl-blue-bright: white;
          --bsl-brown: #8A5433;
          --bsl-brown-deep: #6B3F26;
          --bsl-brown-light: #CFA073;
          --bsl-line: rgba(28,35,33,0.12);
        }
        .bsl-root {
          font-family: var(--font-body), 'Inter', ui-sans-serif, system-ui, sans-serif;
        }
        .bsl-display {
          font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
        }
        .bsl-mono {
          font-family: var(--font-mono), ui-monospace, monospace;
        }
        .bsl-blueprint-grid {
          background-image: radial-gradient(circle, rgba(43,90,107,0.11) 1px, transparent 1px);
          background-size: 26px 26px;
        }
        /* Dark-backdrop variant of the blueprint dot texture, used in the
           hero now that it sits above the scrim instead of below it —
           needs a light dot to read against the dark wash. */
        .bsl-blueprint-grid-dark {
          background-image: radial-gradient(circle, rgba(246,244,238,0.18) 1px, transparent 1px);
          background-size: 26px 26px;
        }
        .bsl-hero-scale {
          animation: bslHeroScale 16s ease-out forwards;
          filter: brightness(1.02) saturate(0.94);
        }
        @keyframes bslHeroScale {
          from { transform: scale(1.06); }
          to { transform: scale(1); }
        }
        /* Signature device: a dimension line, like a measurement callout
           on a blueprint — tick, line, tick — used as the recurring
           divider instead of a decorative gradient rule. Stays blue: this
           is the "plan" mark, brown is reserved for build/action. */
        .bsl-dim-rule {
          position: relative;
          height: 1px;
          background: var(--bsl-blue);
        }
        .bsl-dim-rule::before,
        .bsl-dim-rule::after {
          content: "";
          position: absolute;
          top: -3px;
          width: 1px;
          height: 7px;
          background: var(--bsl-blue);
        }
        .bsl-dim-rule::before { left: 0; }
        .bsl-dim-rule::after { right: 0; }

        /* Light variant for use over the dark hero photo — same device,
           brighter blue so it doesn't disappear against the dark scrim. */
        .bsl-dim-rule--light,
        .bsl-dim-rule--light::before,
        .bsl-dim-rule--light::after {
          background: var(--bsl-blue-bright);
        }

        /* Spec-sheet row rule for the "What's Included" panel: a full-width
           hairline with ticks only at the left, reading like a measured
           line item rather than a decorative card border. Brown here since
           each row is a build/material line item. */
        .bsl-spec-row {
          position: relative;
          border-top: 1px solid var(--bsl-line);
        }
        .bsl-spec-row::before {
          content: "";
          position: absolute;
          top: -1px;
          left: 0;
          width: 22px;
          height: 1px;
          background: var(--bsl-brown);
        }

        .bsl-focus:focus-visible {
          outline: 2px solid var(--bsl-blue);
          outline-offset: 3px;
          border-radius: 4px;
        }
        @media (prefers-reduced-motion: reduce) {
          .bsl-hero-scale { animation: none; }
          * { transition-duration: 0.01ms !important; }
        }
      `}</style>

      {faqStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
      )}

      {/* ---- Hero — single consistent dark scrim so text always has
          contrast, on every photo, at every viewport ---- */}
      <header
        data-hero-root
        className="relative isolate overflow-hidden bg-[var(--bsl-ink)] px-5 pb-24 pt-32 sm:px-8 lg:px-10 lg:pb-32 lg:pt-40"
      >
        <div className="absolute inset-0 -z-30">
          <Image
            src={service.image}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="bsl-hero-scale object-cover"
          />
        </div>

        {/* Primary scrim — a single left-to-right dark wash, translucent
            the whole way across so the photo is always visible, and dark
            enough on the left (where the copy lives) that light text
            reads regardless of the individual photo's own brightness. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20"
          style={{
            background:
              "linear-gradient(100deg, rgba(28,35,33,0.92) 0%, rgba(28,35,33,0.84) 32%, rgba(28,35,33,0.6) 56%, rgba(28,35,33,0.36) 78%, rgba(28,35,33,0.2) 100%)",
          }}
        />
        {/* Extra top-down darkening so the transparent nav band always has
            contrast, independent of the diagonal wash above it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-40 bg-gradient-to-b from-black/60 via-black/20 to-transparent sm:h-48"
        />

        {/* Blueprint dot texture, drawn above the scrim in a light tint so
            it still reads as texture instead of disappearing into it. */}
        <div
          aria-hidden="true"
          className="bsl-blueprint-grid-dark pointer-events-none absolute inset-0 -z-10"
        />

        {/* Short fade into the section below — only the final stretch, so
            it doesn't wash out the copy sitting above it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-b from-transparent to-[var(--bsl-paper)] sm:h-32"
        />

        <div className="relative mx-auto max-w-[1180px]">
          <Link
            href="/services"
            className="bsl-focus bsl-mono mb-7 inline-flex w-fit items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[var(--bsl-paper)]/75 transition-colors hover:text-white"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M12 7H2M2 7L6.5 2.5M2 7L6.5 11.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            All services
          </Link>

          <span className="bsl-mono mb-3 block text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[var(--bsl-blue-bright)]">
            {service.category}
          </span>
          <div aria-hidden="true" className="bsl-dim-rule bsl-dim-rule--light mb-7 w-24" />

          <h1
            className="bsl-display mb-6 max-w-2xl text-[clamp(2.3rem,5.6vw,3.9rem)] font-semibold leading-[1.06] tracking-[-0.02em] text-white"
            style={{ textShadow: "0 4px 28px rgba(0,0,0,0.35)" }}
          >
            {service.title}
          </h1>
          <p className="max-w-lg text-[clamp(1rem,1.4vw,1.1rem)] leading-[1.7] text-[var(--bsl-paper)]/85">
            {service.shortDescription}
          </p>

          {/* Spec strip — three scannable reasons to trust the business,
              styled as measured line items. Bullet marks use the light
              tan so they hold up against the dark hero backdrop while
              staying in the brown "build/craft" register. */}
          <ul className="mt-10 flex max-w-2xl flex-col gap-4 sm:mt-12 sm:flex-row sm:flex-wrap sm:gap-x-9 sm:gap-y-4">
            {HERO_SPECS.map((spec) => (
              <li key={spec.label} className="flex items-start gap-3 sm:min-w-[15rem] sm:max-w-[16rem]">
                <span aria-hidden="true" className="mt-[0.35rem] h-[3px] w-[3px] shrink-0 rounded-full bg-[var(--bsl-brown-light)]" />
                <div>
                  <p className="bsl-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-white/95">
                    {spec.label}
                  </p>
                  <p className="mt-1 text-[0.82rem] leading-[1.5] text-[var(--bsl-paper)]/65">{spec.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* ---- Floating spec plate ---- */}
      <div className="relative z-10 mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <div className="relative -mt-14 flex flex-col gap-6 rounded-[1.5rem] border border-[var(--bsl-line)] bg-white p-6 shadow-[0_30px_70px_-32px_rgba(28,35,33,0.28)] sm:-mt-16 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-8 lg:-mt-[4.5rem]">
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            className="absolute left-5 top-5 text-[var(--bsl-blue)]/35 sm:left-6 sm:top-6"
          >
            <path d="M1 9V1H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            className="absolute bottom-5 right-5 text-[var(--bsl-blue)]/35 sm:bottom-6 sm:right-6"
          >
            <path d="M21 13V21H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>

          <div className="pl-2 pr-8 sm:pr-0">
            <span className="bsl-mono mb-1.5 block text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[var(--bsl-blue)]">
              Job Type
            </span>
            <p className="bsl-display text-[1.25rem] font-semibold leading-snug text-[var(--bsl-ink)] sm:text-[1.4rem]">
              {service.category}
            </p>
          </div>

          <div aria-hidden="true" className="hidden h-14 w-px shrink-0 bg-[var(--bsl-line)] sm:block" />

          <Link
            href="/contact#quote"
            className="bsl-focus group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--bsl-brown-deep)] px-7 py-3.5 text-[0.83rem] font-semibold uppercase tracking-[0.08em] text-[var(--bsl-paper)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[var(--bsl-brown)]"
          >
            Get a Free Quote
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              className="transition-transform duration-300 ease-out group-hover:translate-x-1"
            >
              <path
                d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* ---- Main content — description, modernized ---- */}
      <section className="bg-white px-5 pb-14 pt-10 sm:px-8 lg:px-10 lg:pb-20 lg:pt-14">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div>
            <div className="relative mb-10 aspect-[16/10] w-full overflow-hidden rounded-[1.5rem] shadow-[0_30px_60px_-28px_rgba(28,35,33,0.25)] ring-1 ring-[var(--bsl-line)]">
              <Image
                src={service.image}
                alt={service.imageAlt}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                priority
                className="object-cover"
              />
            </div>

            {/* Lead paragraph: a blue kicker bar instead of a drop cap —
                same "start here" signal without the storybook feel. */}
            {leadParagraph && (
              <div className="mb-9 flex gap-5">
                <div aria-hidden="true" className="mt-1.5 h-auto w-[3px] shrink-0 bg-[var(--bsl-blue)]" />
                <p className="text-[1.15rem] font-medium leading-[1.7] text-[var(--bsl-ink)]">
                  {leadParagraph}
                </p>
              </div>
            )}

            {/* Highlight card: mono label + plain-set quote, blueprint-style
                left bar. Brown here — this is a material/craft callout,
                not a plan callout. */}
            {pullQuote && (
              <div className="relative my-10 rounded-[1.1rem] border border-[var(--bsl-line)] bg-[var(--bsl-paper)] py-6 pl-7 pr-6 sm:pl-8">
                <div aria-hidden="true" className="absolute bottom-4 left-0 top-4 w-[3px] bg-[var(--bsl-brown)]" />
                <span className="bsl-mono mb-2.5 block text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[var(--bsl-brown)]">
                  Key detail
                </span>
                <p className="bsl-display text-[1.2rem] font-medium leading-[1.5] text-[var(--bsl-ink)]">
                  {pullQuote}
                </p>
              </div>
            )}

            {restParagraphs.map((paragraph, i) => (
              <p key={i} className="mb-6 text-[1.02rem] leading-[1.8] text-[var(--bsl-ink-soft)] last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-[1.25rem] border border-[var(--bsl-line)] bg-[var(--bsl-paper)] p-7">
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                className="absolute right-5 top-5 text-[var(--bsl-blue)]/35"
              >
                <path d="M1 9V1H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M21 13V21H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>

              <span className="bsl-mono mb-3 block text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[var(--bsl-blue)]">
                {service.category}
              </span>
              <h2 className="bsl-display mb-3 text-[1.2rem] font-semibold leading-snug text-[var(--bsl-ink)]">
                Ready to get started?
              </h2>
              <div aria-hidden="true" className="bsl-dim-rule mb-5 w-16" />
              <p className="mb-6 text-[0.92rem] leading-[1.65] text-[var(--bsl-ink-soft)]">
                Tell us what you have in mind and we&apos;ll follow up with a free,
                no-obligation quote for your {service.title.toLowerCase()} work.
              </p>

              <Link
                href="/contact#quote"
                className="bsl-focus group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--bsl-brown-deep)] px-8 py-4 text-[0.83rem] font-semibold uppercase tracking-[0.08em] text-[var(--bsl-paper)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[var(--bsl-brown)]"
              >
                Get a Free Quote
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-out group-hover:translate-x-1"
                >
                  <path
                    d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>

              {/* Trust line — plain text, no chips/pills. A small brown
                  tick sits before each item; that's the only accent, no
                  border/background/uppercase treatment left over. */}
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--bsl-line)] pt-6 text-[0.8rem] font-medium text-[var(--bsl-ink-soft)]">
                {TRUST_ITEMS.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <span aria-hidden="true" className="text-[var(--bsl-brown)]">
                      ✓
                    </span>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ---- What's Included — redesigned as a spec sheet, not template cards ---- */}
      {service.highlights.length > 0 && (
        <section className="bg-[var(--bsl-paper)] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <span className="bsl-mono mb-3 block text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[var(--bsl-blue)]">
                  What&apos;s Included
                </span>
                <div aria-hidden="true" className="bsl-dim-rule mb-5 w-20" />
                <h2 className="bsl-display text-[clamp(1.7rem,3.2vw,2.4rem)] font-semibold leading-[1.15] tracking-[-0.01em] text-[var(--bsl-ink)]">
                  Every {service.title} Job Covers
                </h2>
              </div>
              <span className="bsl-mono shrink-0 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[var(--bsl-ink-soft)]">
                {service.highlights.length} line items
              </span>
            </div>

            {/* A single bordered spec panel: each highlight is a measured
                row rather than an isolated card, so the section reads as
                one coherent document — closer to a scope-of-work sheet
                than a stack of marketing tiles. Brown carries the
                checkmark + "Included" tag since this is the build/craft
                register. */}
            <div className="overflow-hidden rounded-[1.1rem] border border-[var(--bsl-line)] bg-white">
              {service.highlights.map((point, idx) => (
                <div
                  key={point}
                  className={`group relative flex items-start gap-5 px-6 py-6 transition-colors duration-300 ease-out hover:bg-[var(--bsl-paper)]/60 sm:px-8 sm:py-7 ${
                    idx !== 0 ? "bsl-spec-row" : ""
                  } ${idx % 2 === 1 ? "bg-[var(--bsl-paper)]/25" : ""}`}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.5rem] border border-[var(--bsl-brown)]/35 bg-[var(--bsl-paper)] text-[var(--bsl-brown)] transition-colors duration-300 ease-out group-hover:border-[var(--bsl-brown)] group-hover:bg-[var(--bsl-brown)] group-hover:text-white">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M3 8.5L6.2 11.5L13 4.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  <p className="pt-1 text-[1rem] leading-[1.6] text-[var(--bsl-ink)] sm:pt-1.5">{point}</p>

                  <span className="bsl-mono ml-auto hidden shrink-0 self-center whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--bsl-brown)] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 sm:block">
                    Included
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- Why Work With BSL — 4-up benefit block, blueprint-style icons ---- */}
      <section className="relative overflow-hidden bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div
          aria-hidden="true"
          className="bsl-blueprint-grid pointer-events-none absolute inset-0 opacity-40"
        />
        <div className="relative mx-auto max-w-[1180px]">
          <div className="mb-14 max-w-2xl">
            <span className="bsl-mono mb-3 block text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[var(--bsl-blue)]">
              Why Work With BSL
            </span>
            <div aria-hidden="true" className="bsl-dim-rule mb-5 w-20" />
            <h2 className="bsl-display text-[clamp(1.7rem,3.2vw,2.4rem)] font-semibold leading-[1.15] tracking-[-0.01em] text-[var(--bsl-ink)]">
              What You Get With Every Booking
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_BSL_ITEMS.map((item) => (
              <div
                key={item.title}
                className="relative rounded-[1rem] border border-[var(--bsl-line)] bg-[var(--bsl-paper)]/50 p-6"
              >
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-[0.6rem] border border-[var(--bsl-brown)]/35 bg-white text-[var(--bsl-brown)]">
                  <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                    {item.icon}
                  </svg>
                </span>
                <h3 className="bsl-display mb-2 text-[1.05rem] font-semibold text-[var(--bsl-ink)]">
                  {item.title}
                </h3>
                <p className="text-[0.92rem] leading-[1.65] text-[var(--bsl-ink-soft)]">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Our Process — a real sequence, so numbers earn their keep ---- */}
      <section className="relative overflow-hidden bg-[var(--bsl-paper)] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div
          aria-hidden="true"
          className="bsl-blueprint-grid pointer-events-none absolute inset-0 opacity-40"
        />
        <div className="relative mx-auto max-w-[1180px]">
          <div className="mb-14 max-w-2xl">
            <span className="bsl-mono mb-3 block text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[var(--bsl-blue)]">
              How We Work
            </span>
            <div aria-hidden="true" className="bsl-dim-rule mb-5 w-20" />
            <h2 className="bsl-display text-[clamp(1.7rem,3.2vw,2.4rem)] font-semibold leading-[1.15] tracking-[-0.01em] text-[var(--bsl-ink)]">
              Our Process, Start to Finish
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, idx) => (
              <div key={step.title} className="relative rounded-[1rem] border border-[var(--bsl-line)] bg-white/70 p-6 backdrop-blur-sm">
                <span className="bsl-mono mb-5 block text-[0.85rem] font-semibold text-[var(--bsl-blue)]">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="bsl-display mb-2 text-[1.05rem] font-semibold text-[var(--bsl-ink)]">
                  {step.title}
                </h3>
                <p className="text-[0.92rem] leading-[1.65] text-[var(--bsl-ink-soft)]">{step.copy}</p>
                {idx < PROCESS_STEPS.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="bsl-dim-rule absolute right-[-1rem] top-2 hidden w-8 lg:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FAQs ---- */}
      {service.faqs.length > 0 && (
        <section
          aria-labelledby="service-faq-heading"
          className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24"
        >
          <div className="mx-auto max-w-[820px]">
            <div className="mb-10 text-center lg:mb-12">
              <span className="bsl-mono mb-4 inline-flex items-center justify-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[var(--bsl-blue)]">
                FAQs
              </span>
              <div aria-hidden="true" className="bsl-dim-rule mx-auto mb-5 w-20" />
              <h2
                id="service-faq-heading"
                className="bsl-display mb-4 text-[clamp(1.7rem,3.4vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.01em] text-[var(--bsl-ink)]"
              >
                Common Questions About {service.title}
              </h2>
              <p className="text-[0.96rem] leading-[1.65] text-[var(--bsl-ink-soft)]">
                Answered honestly, before you have to ask twice. Anything else, just get in touch.
              </p>
            </div>

            <ServiceFaqAccordion faqs={service.faqs} />

            <p className="mt-10 text-center text-[0.92rem] text-[var(--bsl-ink-soft)]">
              Still have questions?{" "}
              <Link href="/contact#quote" className="bsl-focus font-semibold text-[var(--bsl-blue)] hover:text-[var(--bsl-ink)]">
                Talk to the team
              </Link>
              .
            </p>
          </div>
        </section>
      )}

      {/* ---- Related services ---- */}
      {related.length > 0 && (
        <section className="bg-[var(--bsl-paper)] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-[1180px]">
            <span className="bsl-mono mb-3 block text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[var(--bsl-blue)]">
              Continue exploring
            </span>
            <h3 className="bsl-display mb-10 text-[clamp(1.35rem,2.4vw,1.8rem)] font-semibold text-[var(--bsl-ink)]">
              You might also need
            </h3>
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/services/${r.slug}`}
                  className="bsl-focus group flex flex-col overflow-hidden rounded-[1.1rem] bg-white ring-1 ring-transparent transition-all duration-300 ease-out hover:shadow-[0_22px_44px_-20px_rgba(28,35,33,0.2)] hover:ring-[var(--bsl-blue)]/35"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={r.image}
                      alt={r.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col px-6 py-5">
                    <span className="bsl-mono mb-1.5 block text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--bsl-blue)]">
                      {r.category}
                    </span>
                    <h4 className="bsl-display mb-3 text-[1rem] font-semibold text-[var(--bsl-ink)]">{r.title}</h4>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-[var(--bsl-blue)] opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0.5 group-hover:opacity-100">
                      View service
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path
                          d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}