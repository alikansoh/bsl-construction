"use client";

/**
 * Footer.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Closes out the page's trust-building arc (Projects → Why Choose Us →
 * Our Process → FAQ → Footer). Same system as the rest of the site:
 * #1C1712 / #6E6259 / #A26028 / #E8C599, Fraunces serif, warm palette.
 *
 * WHY DARK
 * - Every section above sits on white or ivory (#FBF9F6). Closing on
 *   #1C1712 — the site's own "ink" text colour, promoted to a background —
 *   reads as a deliberate final beat rather than "yet another card",
 *   the way a portfolio's back cover differs from its pages.
 *
 * SIGNATURE ELEMENT — the brass plaque
 * - Projects.tsx frames its hero photograph with hairline corner marks
 *   that double as "photo-corner mounts" and "blueprint registration
 *   marks". That same bracket motif reappears once more here, framing
 *   the closing call-to-action — turning it into a small brass plaque,
 *   the kind of nameplate a builder leaves on a finished job. It's the
 *   one bit of ornament in an otherwise quiet section.
 * - It intentionally does NOT reuse the ring-toggle from WhyChooseUs /
 *   OurProcess / FAQ — that motif means "confirmed / checked" and belongs
 *   to those sections; the plaque brackets are a distinct, final signature.
 *
 * CONTENT
 * - Quick Links stays to the site's top-level pages only — it's
 *   navigation, not a services directory, so individual services aren't
 *   itemised here (that's the Services page's job).
 * - "Areas We Cover" mirrors the FAQ's "areas-covered" answer, rendered as
 *   flowing text (mid-dot separated) rather than pill badges — quieter,
 *   and avoids reusing the Projects.tsx pin-badge treatment twice.
 * - The logo sits inside the same ivory "mat" Projects.tsx uses to frame
 *   its photographs (#FBF9F6) — the BSL mark has black in it, so it needs
 *   a light plate to stay legible against the dark footer. The three
 *   accreditation logos (Checkatrade / Gas Safe / Houzz) get the same
 *   mat for the same reason — full-colour artwork needs a light backing.
 *   Each logo also carries its own `size` in the ACCREDITATIONS array
 *   below, rather than one shared height class, since real badge artwork
 *   varies a lot in aspect ratio and visual weight — Gas Safe's mark in
 *   particular reads small next to the other two at a matched height, so
 *   it's given a taller allotment to look correct once real artwork is
 *   dropped in.
 * - Contact details, social links, and the accreditation logo files are
 *   placeholders — search for "TODO" and drop in BSL Construction's real
 *   phone, email, address, profile URLs, and the official badge image
 *   files (download each from the accreditation body's own member page)
 *   before shipping.
 *
 * ACCESSIBILITY
 * - Visually-hidden <h2> labels the landmark for screen-reader nav.
 * - `prefers-reduced-motion: reduce` disables the entrance fade; content
 *   simply renders in place.
 *
 * DEPENDENCY: requires `gsap` (already used elsewhere on this site) for
 * the single entrance fade — not for layout or scroll-linking.
 * -------------------------------------------------------------------------
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const NAV_LINKS = ["Home", "About", "Services", "Projects", "Contact Us"];

// Mirrors FAQ.tsx's "areas-covered" answer.
const AREAS = [
  "Ealing",
  "Fulham",
  "Wembley",
  "Chiswick",
  "Acton",
  "Hammersmith",
  "Richmond",
  "Kensington",
  "Chelsea",
  "Notting Hill",
  "Hampstead",
];

function navHref(label: string) {
  return label === "Home" ? "/" : `/${label.toLowerCase().replace(" ", "-")}`;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M13.6 21.4v-6.9h2.2l.33-2.6h-2.53V10.2c0-.75.2-1.27 1.28-1.27h1.37V6.6c-.24-.03-1.05-.1-2-.1-1.98 0-3.33 1.2-3.33 3.44v1.9H8.6v2.6h2.32v6.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GuaranteeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12.5l2.6 2.6L16 9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SOCIALS = [
  // TODO: swap "#" for BSL Construction's real profile URLs.
  { name: "Instagram", href: "#", Icon: InstagramIcon },
  { name: "Facebook", href: "#", Icon: FacebookIcon },
];

// TODO: these `src` paths are placeholders. Download each body's official
// badge artwork from their own member/logo page (Checkatrade, Gas Safe
// Register, and Houzz all provide these to verified members) and drop the
// files in /public/badges/ using the filenames below — or update the
// paths to match wherever you place them. Accreditation logos are
// trademarked; use the issued artwork as-is rather than recreating it.
//
// `size` controls the rendered height of each mark independently (see the
// CONTENT note above) — bump it further per-logo if real artwork still
// reads too small or too large once dropped in.
const ACCREDITATIONS = [
  { name: "Checkatrade", href: "https://www.checkatrade.com", src: "/check.png", size: "h-6 sm:h-7" },
  { name: "Gas Safe Registered", href: "https://www.gassaferegister.co.uk", src: "/gas.svg", size: "h-9 sm:h-10" },
  { name: "Houzz", href: "https://www.houzz.co.uk", src: "/houzz.png", size: "h-6 sm:h-7" },
];

export default function Footer() {
  const reducedMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const year = new Date().getFullYear();

  // Single, quiet fade/rise the first time the footer is scrolled into
  // view — the last of the site's entrance beats, deliberately the
  // smallest one. IntersectionObserver rather than ScrollTrigger, so it
  // behaves identically on mobile (same reasoning as FAQ.tsx).
  useEffect(() => {
    const node = contentRef.current;
    if (!node || reducedMotion) return;

    gsap.set(node, { opacity: 0, y: 16 });

    const rect = node.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight * 0.9;

    const reveal = () => gsap.to(node, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" });

    if (alreadyVisible) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <footer aria-labelledby="footer-heading" className="relative bg-[#1C1712] px-5 pb-8 pt-16 lg:px-8 lg:pb-10 lg:pt-20">
      <h2 id="footer-heading" className="sr-only">
        Site footer — navigation and contact details
      </h2>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        .bsl-serif { font-family: 'Fraunces', 'Iowan Old Style', 'Palatino Linotype', Palatino, serif; }

        .footer-plaque { border: 1px solid rgba(232, 197, 153, 0.16); }
        .footer-corner { stroke: #E8C599; opacity: 0.55; }

        .footer-link { transition: color 0.2s ease; }
        .footer-link:hover { color: #E8C599; }

        .footer-social {
          transition: border-color 0.25s ease, color 0.25s ease, background 0.25s ease;
        }
        .footer-social:hover {
          border-color: rgba(232, 197, 153, 0.5);
          color: #E8C599;
          background: rgba(232, 197, 153, 0.06);
        }

        .footer-top {
          transition: border-color 0.25s ease, color 0.25s ease, transform 0.25s ease;
        }
        .footer-top:hover {
          border-color: rgba(232, 197, 153, 0.5);
          color: #E8C599;
          transform: translateY(-2px);
        }

        @media (prefers-reduced-motion: reduce) {
          .footer-top:hover { transform: none; }
        }
      `}</style>

      <div ref={contentRef} className="mx-auto max-w-[1180px] min-[1440px]:max-w-[1360px]">
        {/* -------------------------------------------------------------
            THE PLAQUE — closing CTA, framed like a brass nameplate with
            the same corner-bracket marks Projects.tsx uses on its hero
            photograph. The one ornamented moment in this section.
        ------------------------------------------------------------- */}
        <div className="footer-plaque relative mb-14 rounded-[18px] bg-gradient-to-br from-[#221b14] to-[#1C1712] px-6 py-8 sm:px-10 sm:py-9 lg:mb-16">
          <svg
            className="pointer-events-none absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M 1 12 L 1 1 L 12 1" strokeWidth={1.25} strokeLinecap="round" className="footer-corner fill-none" />
            <path d="M 88 1 L 99 1 L 99 12" strokeWidth={1.25} strokeLinecap="round" className="footer-corner fill-none" />
            <path d="M 99 88 L 99 99 L 88 99" strokeWidth={1.25} strokeLinecap="round" className="footer-corner fill-none" />
            <path d="M 12 99 L 1 99 L 1 88" strokeWidth={1.25} strokeLinecap="round" className="footer-corner fill-none" />
          </svg>

          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="mb-2 inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#A26028]">
                <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
                Est. in London
              </span>
              <p className="bsl-serif max-w-[420px] text-[clamp(1.4rem,3vw,1.9rem)] font-medium leading-[1.2] tracking-[-0.01em] text-white">
                Let&apos;s build something you&apos;re proud of.
              </p>
            </div>

            <Link
              href="/contact#quote"
              className="inline-flex w-fit flex-none items-center gap-2 rounded-full bg-[#A26028] px-7 py-3.5 text-[0.95rem] font-bold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121]"
            >
              Get Free Quote
            </Link>
          </div>
        </div>

        {/* -------------------------------------------------------------
            COLUMNS — quiet and disciplined by design; the plaque above
            already spent this section's one moment of ornament.
        ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_1fr_0.9fr] lg:gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex rounded-xl bg-[#FBF9F6] px-4 py-3">
              <Image
                src="/logo.png"
                alt="BSL Construction"
                width={160}
                height={80}
                className="h-auto w-[140px]"
              />
            </Link>
            <p className="mt-4 max-w-[280px] text-[0.92rem] leading-[1.7] text-white/55">
              Full property refurbishments, extensions, kitchens, bathrooms and ongoing maintenance —
              managed start to finish, one trusted team.
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              {SOCIALS.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={`BSL Construction on ${name}`}
                  className="footer-social flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <span className="mb-4 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#A26028]">
              Quick Links
            </span>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((label) => (
                <li key={label}>
                  <Link href={navHref(label)} className="footer-link text-[0.92rem] text-white/70">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas we cover */}
          <div>
            <span className="mb-4 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#A26028]">
              Areas We Cover
            </span>
            <p className="text-[0.92rem] leading-[1.75] text-white/55">
              {AREAS.join(" · ")}
            </p>
          </div>

          {/* Contact */}
          <div>
            <span className="mb-4 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#A26028]">
              Get In Touch
            </span>
            {/* TODO: replace the placeholders below with BSL Construction's real phone, email and address. */}
            <ul className="flex flex-col gap-2 text-[0.92rem] text-white/70">
              <li>
                <a href="tel:+442000000000" className="footer-link">020 0000 0000</a>
              </li>
              <li>
                <a href="mailto:info@bslconstruction.co.uk" className="footer-link">info@bslconstruction.co.uk</a>
              </li>
              <li className="text-white/55">London, UK</li>
            </ul>
          </div>
        </div>

        {/* -------------------------------------------------------------
            ACCREDITATIONS — real logo artwork (see TODO on the
            ACCREDITATIONS array). Full-colour logos need a light
            background to read properly, so each sits on the same ivory
            mat as the wordmark above. Each logo renders at its own
            `size` rather than one shared height, so a mark that reads
            small (Gas Safe) can be given more room without inflating
            the others.
        ------------------------------------------------------------- */}
        <div className="mt-12 flex flex-col items-start gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:gap-6 lg:mt-14">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/40">
            Accredited &amp; Trusted
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {ACCREDITATIONS.map(({ name, href, src, size }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center justify-center rounded-lg bg-[#FBF9F6] px-5 py-2 transition-transform duration-200 ease-out hover:-translate-y-0.5"
              >
                <Image
                  src={src}
                  alt={name}
                  width={120}
                  height={40}
                  className={`w-auto object-contain ${size}`}
                />
              </a>
            ))}
          </div>
        </div>

        {/* -------------------------------------------------------------
            BOTTOM BAR
        ------------------------------------------------------------- */}
        <div className="mt-14 flex flex-col items-start gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between lg:mt-16">
          <div className="flex flex-col gap-3 text-[0.78rem] text-white/45 sm:flex-row sm:items-center sm:gap-5">
            <span>© {year} BSL Construction. All rights reserved.</span>
            <span className="flex items-center gap-5">
              <Link href="/privacy" className="footer-link">Privacy Policy</Link>
              <Link href="/terms" className="footer-link">Terms of Service</Link>
            </span>
          </div>

          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-[0.78rem] font-medium text-[#E8C599]/80">
              <GuaranteeIcon />
              12-month workmanship guarantee
            </span>
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="footer-top flex h-9 w-9 flex-none items-center justify-center rounded-full border border-white/15 text-white/70"
            >
              <ArrowUpIcon />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}