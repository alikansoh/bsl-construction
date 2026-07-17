"use client";

/**
 * Hero.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * CONCEPT CHANGE — this is a full rewrite, not a tweak.
 *
 * The previous version was a scroll-scrubbed hero: a canvas painted one of
 * 96/36 pre-extracted frames per scroll position, standing in for a video
 * the user "played" by scrolling. That solved a real problem (video.
 * currentTime seeking is janky) but it's a lot of machinery — a frame
 * build step, two frame sets, a sticky scroll-space, priority/background
 * loading, a rAF loop driving canvas draws — for an effect most visitors
 * only ever perceive as "there's a video back there."
 *
 * This version is a straightforward, full-bleed autoplaying background
 * video (`/hero-video.mp4`) — the standard, well-understood pattern (the
 * kind of hero Apple/Stripe-style sites use when they're *not* doing a
 * scroll-scrub set piece). It plays once the page has settled and loops
 * quietly behind the copy. Far less code, no build step, no 2.5-4MB frame
 * set — just one video file the browser streams and decodes natively.
 *
 * PERFORMANCE / GOOD-CITIZEN BEHAVIOR (kept from the old version)
 * - The poster image is what actually renders first and is what LCP
 *   measures — it's a normal <img fetchPriority="high">, not a video
 *   frame, so it paints immediately with no decode latency.
 * - The video itself doesn't start loading until after `window.load`, so
 *   it never competes with the poster, fonts, or initial JS for
 *   bandwidth on a cold load.
 * - `prefers-reduced-motion: reduce`, Save-Data, and slow connections
 *   (2g/slow-2g) all skip the video entirely — the poster stays as the
 *   hero, permanently, no wasted download.
 * - An IntersectionObserver pauses the video whenever the hero scrolls
 *   out of view and resumes it when it scrolls back in, so it isn't
 *   decoding off-screen.
 * - `muted`, `playsInline`, and `loop` are all set directly on the
 *   element (required for autoplay to be allowed on iOS/Android/most
 *   desktop browsers without a user gesture).
 *
 * SIGNATURE ELEMENT
 * A small spirit-level glyph sits beside the eyebrow label — the same
 * "level" idea that shows up in OurProcess.tsx's traveling checkpoint dot,
 * carried over as a literal instrument here. Its bubble settles into
 * center once, on load (not a loop), like a level being set down at the
 * start of a job.
 *
 * DECLUTTER / TONE PASS
 * - Dropped the bouncing scroll-chevron: on mobile it stacked directly
 *   on top of the SEO pill strip, so the bottom of the viewport carried
 *   two independent moving elements at once. The pill strip alone is
 *   enough of a "there's more below" cue.
 * - Overlay gradient moved off near-black (#1C1712) to a warmer, lighter
 *   walnut (#241C15) with a lower peak opacity — the video reads more
 *   clearly through it and the copy still holds full contrast against it.
 * - Eyebrow copy now leads with "New Builds, Renovations & Maintenance"
 *   as a single line instead of a 4-item rotating list, so maintenance
 *   reads as a core service on first glance, not one of a crowd of tags.
 * - SEO strip: fewer, calmer chips (dot separators removed, spacing
 *   opened up) so it reads as a quiet footer credential, not a second
 *   headline competing with the real one.
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from "react";

const POSTER_SRC = "/hero-poster.webp";
const POSTER_SRC_MOBILE = "/hero-poster-mobile.webp";
const VIDEO_SRC = "/hero-video.mp4";

const SEO_PHRASES = ["New Builds", "Renovations", "Property Maintenance", "General Contracting"];

const OBSERVER_MARGIN = "200px 0px 200px 0px";

// The Network Information API isn't in TypeScript's built-in DOM types
// (still non-standard / Chromium-only), so it's typed manually here
// instead of reaching for `any`. Every field is optional since support
// is inconsistent across browsers.
interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
}
interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [canLoadVideo, setCanLoadVideo] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoErrored, setVideoErrored] = useState(false);

  // Decide once whether the video is even allowed to load, then wait for
  // `window.load` so it never competes with the poster / fonts / initial
  // JS for bandwidth.
  useEffect(() => {
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const conn = (navigator as NavigatorWithConnection).connection;
    const dataSaver = Boolean(conn?.saveData);
    const slowConn = conn?.effectiveType && ["slow-2g", "2g"].includes(conn.effectiveType);

    if (reduceMotionQuery.matches || dataSaver || slowConn) {
      // Poster stays as the permanent hero image — no video request made.
      return;
    }

    let cancelled = false;
    const start = () => {
      if (!cancelled) setCanLoadVideo(true);
    };
    if (document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
    }
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
    };
  }, []);

  // Pause off-screen, resume on-screen — a background video decoding
  // outside the viewport is pure waste.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !canLoadVideo) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video) return;
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay can still be rejected in some contexts (e.g. very
            // aggressive power-saving modes) — the poster remains visible
            // underneath, so this is a silent, harmless no-op.
          });
        } else {
          video.pause();
        }
      },
      { rootMargin: OBSERVER_MARGIN }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [canLoadVideo]);

  const showVideo = canLoadVideo && !videoErrored;

  return (
    <section ref={sectionRef} className="hero">
      <div className="hero-media" aria-hidden="true">
        <picture className="hero-poster-picture">
          <source media="(max-width: 768px)" srcSet={POSTER_SRC_MOBILE} type="image/webp" />
          <img src={POSTER_SRC} alt="" className="hero-poster" fetchPriority="high" />
        </picture>

        {showVideo && (
          <video
            ref={videoRef}
            className={`hero-video ${isVideoPlaying ? "hero-video-ready" : ""}`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onPlaying={() => setIsVideoPlaying(true)}
            onError={() => setVideoErrored(true)}
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        )}
      </div>

      <div className="hero-overlay" />

      <div className="hero-content">
        <div className="hero-eyebrow-row">
          <svg
            className="hero-level"
            width="46"
            height="16"
            viewBox="0 0 46 16"
            fill="none"
            aria-hidden="true"
          >
            <rect x="1" y="1" width="44" height="14" rx="7" stroke="#E3C69B" strokeWidth="1.25" />
            <line x1="15.3" y1="3" x2="15.3" y2="13" stroke="#E3C69B" strokeOpacity="0.55" strokeWidth="1" />
            <line x1="30.7" y1="3" x2="30.7" y2="13" stroke="#E3C69B" strokeOpacity="0.55" strokeWidth="1" />
            <circle className="hero-level-bubble" cy="8" r="3.6" fill="#E3C69B" />
          </svg>
          <span className="hero-eyebrow">New Builds, Renovations &amp; Maintenance</span>
        </div>

        <h1 className="hero-heading">Every Build Follows A Plan You Can See.</h1>

        <p className="hero-subhead">
          Timber-frame builds, full renovations, and ongoing property maintenance — carried
          through the same disciplined process from first site visit to final handover.
        </p>

        <div className="hero-actions">
          <a href="#contact" className="hero-btn hero-btn-primary">
            Book A Site Visit
          </a>
          <a href="#our-process-heading" className="hero-btn hero-btn-secondary">
            See Our Process
            <span aria-hidden="true" className="hero-btn-arrow">
              →
            </span>
          </a>
        </div>
      </div>

      <div className="hero-seo">
        <div className="hero-seo-track">
          {SEO_PHRASES.map((phrase) => (
            <span key={phrase} className="hero-seo-pill">
              {phrase}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .hero-poster-picture {
          display: contents;
        }

        .hero-media,
        .hero-poster,
        .hero-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .hero-poster {
          object-fit: cover;
          z-index: 0;
        }

        .hero-video {
          object-fit: cover;
          z-index: 1;
          opacity: 0;
          transition: opacity 0.7s ease;
          will-change: opacity;
          transform: translateZ(0);
        }
        .hero-video-ready {
          opacity: 1;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: linear-gradient(
            0deg,
            rgba(36, 28, 21, 0.74) 0%,
            rgba(36, 28, 21, 0.38) 34%,
            rgba(36, 28, 21, 0.1) 54%,
            rgba(36, 28, 21, 0.18) 100%
          );
        }

        /* ----------------------------------------------------------------
           Content — headline, subhead, CTAs. Page-load sequence: eyebrow,
           heading, subhead, actions fade/rise in with a short stagger.
           Reduced-motion collapses this to an instant appearance below.
           ---------------------------------------------------------------- */
        .hero-content {
          position: relative;
          z-index: 3;
          width: min(92vw, 640px);
          margin: 0 auto;
          padding: 0 1.25rem;
          padding-bottom: 7rem;
          box-sizing: border-box;
          text-align: center;
        }

        .hero-eyebrow-row {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1.1rem;
          opacity: 0;
          animation: hero-rise 0.7s ease forwards;
          animation-delay: 0.1s;
        }
        .hero-eyebrow {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #e3c69b;
        }

        .hero-level {
          flex-shrink: 0;
        }
        .hero-level-bubble {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          animation: hero-level-settle 1.3s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          animation-delay: 0.25s;
        }
        @keyframes hero-level-settle {
          0% {
            transform: translateX(-7.5px);
          }
          55% {
            transform: translateX(8px);
          }
          78% {
            transform: translateX(-2.5px);
          }
          100% {
            transform: translateX(0);
          }
        }

        .hero-heading {
          margin: 0 0 0.9rem;
          font-family: var(--font-fraunces, inherit);
          font-size: clamp(1.9rem, 5.2vw, 3.1rem);
          font-weight: 500;
          line-height: 1.14;
          letter-spacing: -0.01em;
          color: #fbf9f6;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
          opacity: 0;
          animation: hero-rise 0.8s ease forwards;
          animation-delay: 0.2s;
        }

        .hero-subhead {
          margin: 0 auto 1.9rem;
          max-width: 46ch;
          font-size: clamp(0.95rem, 1.7vw, 1.08rem);
          line-height: 1.65;
          color: rgba(251, 249, 246, 0.85);
          opacity: 0;
          animation: hero-rise 0.8s ease forwards;
          animation-delay: 0.32s;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
          opacity: 0;
          animation: hero-rise 0.8s ease forwards;
          animation-delay: 0.44s;
        }

        .hero-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.85rem 1.6rem;
          border-radius: 9999px;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease,
            color 0.25s ease;
        }
        .hero-btn-primary {
          background: #a26028;
          color: #fbf9f6;
          box-shadow: 0 10px 24px -10px rgba(162, 96, 40, 0.6);
        }
        .hero-btn-secondary {
          background: transparent;
          color: #fbf9f6;
          border: 1.5px solid rgba(251, 249, 246, 0.4);
        }
        .hero-btn-arrow {
          transition: transform 0.25s ease;
        }

        @media (hover: hover) and (pointer: fine) {
          .hero-btn-primary:hover {
            transform: translateY(-2px);
          }
          .hero-btn-secondary:hover {
            border-color: #e3c69b;
            color: #e3c69b;
          }
          .hero-btn-secondary:hover .hero-btn-arrow {
            transform: translateX(3px);
          }
        }

        @keyframes hero-rise {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ----------------------------------------------------------------
           SEO strip — quiet footer credential, not a second headline.
           Wraps/centers on desktop; a horizontally scrollable snap row on
           mobile below.
           ---------------------------------------------------------------- */
        .hero-seo {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 3;
          background: rgba(36, 28, 21, 0.42);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        .hero-seo-track {
          padding: 0.9rem 1rem;
          padding-bottom: calc(0.9rem + env(safe-area-inset-bottom));
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem 1.6rem;
        }
        .hero-seo-pill {
          font-size: clamp(0.65rem, 1.4vw, 0.75rem);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.72);
          font-weight: 600;
          white-space: nowrap;
        }

        /* ----------------------------------------------------------------
           Very small phones
           ---------------------------------------------------------------- */
        @media (max-width: 380px) {
          .hero-content {
            padding-bottom: 8rem;
          }
          .hero-heading {
            font-size: clamp(1.5rem, 7vw, 1.9rem);
            line-height: 1.2;
          }
        }

        /* ----------------------------------------------------------------
           Phones / small screens
           ---------------------------------------------------------------- */
        @media (max-width: 768px) {
          .hero {
            height: 92vh;
            height: 92dvh;
          }
          .hero-content {
            padding-bottom: 6.5rem;
          }
          .hero-seo-track {
            flex-wrap: nowrap;
            justify-content: flex-start;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x proximity;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding: 0.75rem 1.25rem;
            padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
            gap: 0.5rem 1.4rem;
            mask-image: linear-gradient(
              to right,
              transparent 0,
              black 20px,
              black calc(100% - 20px),
              transparent 100%
            );
            -webkit-mask-image: linear-gradient(
              to right,
              transparent 0,
              black 20px,
              black calc(100% - 20px),
              transparent 100%
            );
          }
          .hero-seo-track::-webkit-scrollbar {
            display: none;
          }
          .hero-seo-pill {
            scroll-snap-align: center;
            font-size: 0.7rem;
          }
        }

        /* ----------------------------------------------------------------
           Short-landscape phones
           ---------------------------------------------------------------- */
        @media (max-width: 900px) and (max-height: 500px) and (orientation: landscape) {
          .hero-content {
            padding-bottom: 4.5rem;
          }
          .hero-heading {
            font-size: clamp(1.3rem, 4.5vw, 1.7rem);
          }
          .hero-subhead {
            display: none;
          }
        }

        /* ----------------------------------------------------------------
           Desktop refinements
           ---------------------------------------------------------------- */
        @media (min-width: 769px) {
          .hero-content {
            padding-bottom: 5.5rem;
          }
        }

        @media (min-width: 1440px) {
          .hero-content {
            width: min(60vw, 760px);
          }
        }

        @media (max-height: 560px) and (min-width: 769px) {
          .hero-content {
            padding-bottom: 3.5rem;
          }
        }

        /* ----------------------------------------------------------------
           Reduced motion — instant final state, no page-load sequence,
           no level-bubble settle.
           ---------------------------------------------------------------- */
        @media (prefers-reduced-motion: reduce) {
          .hero-eyebrow-row,
          .hero-heading,
          .hero-subhead,
          .hero-actions {
            animation: none;
            opacity: 1;
            transform: none;
          }
          .hero-level-bubble {
            animation: none;
            transform: translateX(0);
          }
          .hero-video {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}