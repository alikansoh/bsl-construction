"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

const SERVICES = [
  "New Builds",
  "Extensions",
  "Refurbishments",
  "Plumbing",
  "Heating",
  "Air Conditioning",
  "Electrical",
  "Commercial Maintenance",
  "Hotel Maintenance",
];

function useMounted(delayMs = 0) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delayMs);

    return () => clearTimeout(t);
  }, [delayMs]);

  return mounted;
}

function useScrolled(threshold = 60) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > threshold);
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [threshold]);

  return scrolled;
}

export default function Hero() {
  const mounted = useMounted(100);
  const scrolled = useScrolled(60);

  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    let cancelled = false;

    const tryPlay = () => {
      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (!cancelled) {
              setIsPlaying(true);
            }
          })
          .catch(() => {
            if (!cancelled) {
              setIsPlaying(false);
            }
          });
      }
    };

    const handlePlaying = () => {
      if (!cancelled) {
        setIsPlaying(true);
      }
    };

    const handlePause = () => {
      if (!cancelled) {
        setIsPlaying(false);
      }
    };

    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);

    if (video.readyState >= 1) {
      tryPlay();
    } else {
      video.addEventListener("loadedmetadata", tryPlay, {
        once: true,
      });
    }

    document.addEventListener("touchstart", tryPlay, {
      once: true,
    });

    document.addEventListener("click", tryPlay, {
      once: true,
    });

    document.addEventListener(
      "visibilitychange",
      tryPlay
    );

    return () => {
      cancelled = true;

      video.removeEventListener(
        "loadedmetadata",
        tryPlay
      );

      video.removeEventListener(
        "playing",
        handlePlaying
      );

      video.removeEventListener(
        "pause",
        handlePause
      );

      document.removeEventListener(
        "touchstart",
        tryPlay
      );

      document.removeEventListener(
        "click",
        tryPlay
      );

      document.removeEventListener(
        "visibilitychange",
        tryPlay
      );
    };
  }, []);

  const handleManualPlay = () => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = true;

    video.play().catch(() => {
      // Poster image remains as fallback.
    });
  };

  return (
    <section
      className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden ${fraunces.variable}`}
    >
      {/* =========================================================
          BACKGROUND VIDEO
      ========================================================== */}

      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-poster.jpg"
          preload="auto"
          className="h-full w-full object-cover"
        >
          <source
            src="/hero-video.mp4"
            type="video/mp4"
          />
        </video>

        {/* Manual play fallback */}

        {mounted && !isPlaying && (
          <button
            type="button"
            onClick={handleManualPlay}
            aria-label="Play background video"
            className="group absolute inset-0 z-[2] flex items-center justify-center bg-[#0B0B0D]/20 transition-colors duration-300 hover:bg-[#0B0B0D]/30"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
              <svg
                className="ml-1 h-6 w-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>

      {/* =========================================================
          GRADIENT OVERLAYS
      ========================================================== */}

      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0B0B0D]/30 via-[#0B0B0D]/15 to-[#0B0B0D]/60"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0B0B0D]/45 via-transparent to-[#0B0B0D]/15"
      />

      {/* =========================================================
          HERO CONTENT
      ========================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 pb-44 pt-28 md:px-10 md:pb-48 md:pt-32">
        <div className="max-w-5xl">

          {/* EYEBROW */}

          <div
            className={`mb-6 flex items-center gap-3 transition-all duration-700 ${
              mounted
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            }`}
          >
            <span className="h-px w-10 bg-[#E8C599]" />

            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#E8C599]">
              Building • Mechanical • Commercial
            </span>
          </div>

          {/* HEADLINE */}

          <h1
            className={`bsl-hero-headline mb-7 max-w-4xl text-[clamp(2.8rem,6.5vw,5.8rem)] font-medium leading-[1.03] tracking-[-0.025em] text-white transition-all duration-700 ${
              mounted
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            }`}
          >
            Complete Building,
            <br />

            <span className="font-serif italic text-[#E8C599]">
              Mechanical & Commercial
            </span>

            <br />

            Services
          </h1>

          {/* SHORTER DESCRIPTION */}

          <p
            className={`mb-10 max-w-2xl text-[clamp(1rem,1.5vw,1.18rem)] leading-[1.75] text-white/80 transition-all duration-700 delay-100 ${
              mounted
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            }`}
          >
            From new builds and extensions to mechanical,
            electrical and commercial maintenance, BSL
            Construction delivers reliable building solutions
            across London.
          </p>

          {/* CTA BUTTONS */}

          <div
            className={`flex flex-wrap items-center gap-4 transition-all duration-700 delay-200 ${
              mounted
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            }`}
          >
            {/* Primary CTA */}

            <Link
              href="/contact#quote"
              className="group relative overflow-hidden rounded-full bg-[#A26028] px-9 py-4 text-[0.88rem] font-semibold uppercase tracking-[0.1em] text-white shadow-[0_10px_30px_-10px_rgba(162,96,40,0.4)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#8A5121] hover:shadow-[0_16px_45px_-12px_rgba(162,96,40,0.55)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get a Free Quote

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

            {/* Secondary CTA */}

            <Link
              href="/projects"
              className="group relative overflow-hidden rounded-full border border-white/30 bg-white/5 px-9 py-4 text-[0.88rem] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#A26028] hover:bg-[#A26028]/10"
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
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================
          SCROLL INDICATOR
          
          Positioned ABOVE the service ticker,
          BELOW the CTA buttons,
          with enough spacing to avoid touching them.
      ========================================================== */}

      <div
        aria-hidden="true"
        className={`absolute bottom-[112px] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 transition-all duration-700 md:bottom-[125px] ${
          mounted && !scrolled
            ? "translate-y-0 opacity-100 delay-500"
            : "translate-y-3 opacity-0"
        }`}
      >
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/50 p-1.5">
          <span className="h-2 w-1 animate-[bsl-scroll-wheel_1.6s_ease-in-out_infinite] rounded-full bg-[#E8C599]" />
        </div>

        <span className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-white/60">
          Scroll
        </span>
      </div>

      {/* =========================================================
          SERVICES TICKER
      ========================================================== */}

      <div
        className={`absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0B0B0D]/50 backdrop-blur-md transition-all duration-700 delay-300 ${
          mounted
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      >
        {/* Gold accent */}

        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#A26028] to-transparent"
        />

        <div className="mx-auto flex max-w-[1280px] items-stretch">

          {/* Fixed label */}

          <div className="hidden shrink-0 items-center gap-3 border-r border-white/10 px-6 py-5 sm:flex md:px-10">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#A26028]" />

            <span className="whitespace-nowrap text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#E8C599]">
              Our Services
            </span>
          </div>

          {/* Scrolling ticker */}

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
              {[
                ...SERVICES,
                ...SERVICES,
                ...SERVICES,
              ].map((service, i) => (
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

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
        .bsl-hero-headline {
          font-family:
            var(--font-fraunces),
            'Iowan Old Style',
            'Palatino Linotype',
            Palatino,
            serif;
        }

        @keyframes bsl-marquee {
          0% {
            transform: translateX(0%);
          }

          100% {
            transform: translateX(-33.3333%);
          }
        }

        @keyframes bsl-scroll-wheel {
          0% {
            transform: translateY(0);
            opacity: 1;
          }

          70% {
            transform: translateY(10px);
            opacity: 0;
          }

          100% {
            transform: translateY(0);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}