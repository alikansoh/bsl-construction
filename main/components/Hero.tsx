"use client";

import React, { useEffect, useState } from "react";
import { Fraunces } from "next/font/google";
import Link from "next/link";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

const SERVICES = [
  "Home Building",
  "Maintenance",
  "Renovations",
  "Extensions",
  "Refurbishments",
  "Loft Conversions",
];

function useMounted(delayMs = 0) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delayMs);
    return () => clearTimeout(t);
  }, []);

  return mounted;
}

function useScrolled(threshold = 60) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

export default function Hero() {
  const mounted = useMounted(100);
  const scrolled = useScrolled(60);

  return (
    <section
      className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden ${fraunces.variable}`}
    >
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-poster.jpg"
          preload="auto"
          className="h-full w-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Lighter luxury gradient overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0B0B0D]/35 via-[#0B0B0D]/20 to-[#0B0B0D]/65"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0B0B0D]/50 via-transparent to-[#0B0B0D]/15"
      />

      {/* Decorative gold vertical line */}
      <div
        aria-hidden="true"
        className={`absolute left-1/2 top-28 z-[2] h-16 w-[1px] bg-gradient-to-b from-transparent via-[#A26028] to-transparent transition-all duration-1000 md:left-[10%] md:top-1/2 md:h-24 md:-translate-y-1/2 ${
          mounted ? "opacity-100 md:scale-y-100" : "opacity-0 md:scale-y-0"
        }`}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 pb-24 md:px-10 md:pb-28">
        <div className="max-w-3xl">
          {/* Headline */}
          <h1
            className={`bsl-hero-headline mb-6 text-[clamp(2.6rem,7vw,5.5rem)] font-medium leading-[1.05] tracking-[-0.02em] text-white transition-all duration-700 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            Crafting Homes
            <br />
            <span className="font-serif italic text-[#E8C599]">Without Compromise</span>
          </h1>

          {/* Subhead */}
          <p
            className={`mb-10 max-w-xl text-[clamp(1rem,1.5vw,1.15rem)] leading-[1.75] text-white/80 transition-all duration-700 delay-100 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            Bespoke construction and renovation, delivered with precision, integrity, and
            enduring quality in every detail.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-wrap items-center gap-4 transition-all duration-700 delay-200 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <Link
              href="/contact#quote"
              className="group relative overflow-hidden rounded-full bg-[#A26028] px-9 py-4 text-[0.88rem] font-semibold uppercase tracking-[0.1em] text-white shadow-[0_10px_30px_-10px_rgba(162,96,40,0.4)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#8A5121] hover:shadow-[0_16px_45px_-12px_rgba(162,96,40,0.55)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Your Project
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
              </span>
            </Link>

            <Link
              href="#projects"
              className="group relative overflow-hidden rounded-full border border-white/30 bg-white/5 px-9 py-4 text-[0.88rem] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#A26028] hover:bg-[#A26028]/10 hover:text-white"
            >
              <span className="relative z-10 flex items-center gap-2">
                View Our Work
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Services ticker — anchored to the bottom of the hero */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0B0B0D]/45 backdrop-blur-md transition-all duration-700 delay-300 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {/* hairline gold accent along the top edge */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#A26028] to-transparent"
        />

        <div className="mx-auto flex max-w-[1280px] items-stretch">
          {/* fixed label */}
          <div className="hidden shrink-0 items-center gap-3 border-r border-white/10 px-6 py-5 sm:flex md:px-10">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#A26028]" />
            <span className="whitespace-nowrap text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#E8C599]">
              Our Services
            </span>
          </div>

          {/* scrolling ticker, faded at both edges */}
          <div
            className="min-w-0 flex-1 overflow-hidden py-5"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0, black 48px, black calc(100% - 48px), transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0, black 48px, black calc(100% - 48px), transparent 100%)",
            }}
          >
            <div className="flex w-max animate-[bsl-marquee_30s_linear_infinite]">
              {[...SERVICES, ...SERVICES, ...SERVICES].map((service, i) => (
                <span
                  key={`${service}-${i}`}
                  className="flex shrink-0 items-center gap-6 whitespace-nowrap px-6 text-[0.78rem] font-medium uppercase tracking-[0.16em] text-white/75"
                >
                  {service}
                  <span className="font-serif text-[0.7rem] italic text-[#A26028]">
                    &#10022;
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll down indicator */}
      <div
        aria-hidden="true"
        className={`absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 transition-all duration-700 md:bottom-28 ${
          mounted && !scrolled
            ? "translate-y-0 opacity-100 delay-500"
            : "translate-y-3 opacity-0"
        }`}
      >
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-white/60">
          Scroll
        </span>
        <div className="relative h-10 w-[1px] overflow-hidden bg-white/20">
          <span className="absolute inset-x-0 top-0 h-1/2 w-full animate-[bsl-scroll-line_2s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-[#E8C599] to-transparent" />
        </div>
      </div>

      <style>{`
        .bsl-hero-headline {
          font-family: var(--font-fraunces), 'Iowan Old Style', 'Palatino Linotype', Palatino, serif;
        }
        @keyframes bsl-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.3333%); }
        }
        @keyframes bsl-scroll-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </section>
  );
}