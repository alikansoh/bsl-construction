"use client";

/**
 * Hero.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Scroll-scrubbed video hero with mobile-first responsive sizing.
 * - Video begins at the start of the clip.
 * - On phones the sticky hero is a full-bleed 100dvh viewport (no side
 *   "letterboxing" feel), with a top-loading progress bar (like a stories
 *   UI) instead of the desktop's thin vertical side rail — a vertical bar
 *   reads as clutter on a narrow screen, a top bar reads as native.
 * - The SEO strip becomes a horizontally scrollable, snap-aligned row on
 *   mobile with soft edge fades, instead of wrapping pills into a ragged
 *   multi-line block.
 * - Scroll runway length is a CSS custom property, overridden per
 *   breakpoint, so the scrub distance itself is responsive (not just the
 *   viewport size).
 * - Mobile-safe priming play-then-pause to force iOS/Android to decode.
 * - Poster + static fallback for Low Power Mode / Data Saver.
 * - Respects prefers-reduced-motion and safe-area insets (notches/home
 *   indicators), and has a dedicated short-landscape treatment.
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/video1.mp4";
const POSTER_SRC = "/hero-poster.jpg"; // Add this to /public

// Start playback at the beginning of the clip
const START_TIME_SECONDS = 0;

// How close the video's currentTime needs to be to the smoothed target
// before we bother re-seeking. Smaller = more precise but more seek calls.
const SEEK_THRESHOLD = 0.01;
// Exponential smoothing factor for the scroll -> video-time follow.
// Lower = smoother/laggier, higher = snappier/twitchier.
const SMOOTHING = 0.2;
const MAX_DT = 1 / 24;
const OBSERVER_MARGIN = "200px 0px 200px 0px";

const SEO_PHRASES = ["New Builds", "Renovations", "Home Maintenance", "General Contracting"];

const STAGES: { at: number; text: string }[] = [
  { at: 0.0, text: "Timber-frame construction, built to last." },
  { at: 0.45, text: "Full renovations and home extensions, done right." },
  { at: 0.8, text: "Ongoing home maintenance — the job doesn't end at handover." },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getStageText(progress: number) {
  let current = STAGES[0].text;
  for (const item of STAGES) {
    if (progress >= item.at) current = item.text;
  }
  return current;
}

function frameFactor(smoothing: number, dt: number) {
  return 1 - Math.pow(1 - smoothing, dt * 60);
}

export default function Hero() {
  const scrollSpaceRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const textLayerARef = useRef<HTMLHeadingElement>(null);
  const textLayerBRef = useRef<HTMLHeadingElement>(null);
  const activeLayerRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const isSeekingRef = useRef(false);
  const inViewRef = useRef(true);
  const lastTextRef = useRef(STAGES[0].text);
  const lastFrameTimeRef = useRef<number | null>(null);
  const displayedTimeRef = useRef(START_TIME_SECONDS);
  const [isReady, setIsReady] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Runs once on mount. Previously this effect re-ran whenever isReady or
  // useFallback changed, which tore down and rebuilt the rAF loop and the
  // IntersectionObserver right as the video became ready — causing a visible
  // hitch. Readiness/fallback are now tracked with local closures instead of
  // being effect dependencies, so the loop stays uninterrupted.
  useEffect(() => {
    const video = videoRef.current;
    const scrollSpace = scrollSpaceRef.current;
    if (!video || !scrollSpace) return;

    let fullDuration = 0;
    let playableDuration = 0;
    let primed = false;

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const primeVideo = async () => {
      if (primed || playableDuration <= 0) return;
      primed = true;

      try {
        video.muted = true;
        video.currentTime = START_TIME_SECONDS;
        await video.play();
        video.pause();
        setIsReady(true);
      } catch {
        setUseFallback(true);
      }
    };

    const handleLoadedMetadata = () => {
      fullDuration = video.duration || 0;
      playableDuration = Math.max(fullDuration - START_TIME_SECONDS, 0);
      video.currentTime = START_TIME_SECONDS;
      displayedTimeRef.current = START_TIME_SECONDS;
      primeVideo();
    };

    const handleCanPlay = () => {
      if (!primed) primeVideo();
    };

    const handleError = () => {
      setUseFallback(true);
    };

    const handleSeeking = () => {
      isSeekingRef.current = true;
    };
    const handleSeeked = () => {
      isSeekingRef.current = false;
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("seeked", handleSeeked);

    if (video.readyState >= 1) handleLoadedMetadata();

    const textLayers = [textLayerARef, textLayerBRef];

    const swapText = (nextText: string) => {
      const activeIndex = activeLayerRef.current;
      const nextIndex = (activeIndex + 1) % 2;
      const activeEl = textLayers[activeIndex].current;
      const nextEl = textLayers[nextIndex].current;
      if (!activeEl || !nextEl) return;

      if (nextEl.dataset.text !== nextText) {
        nextEl.textContent = nextText;
        nextEl.dataset.text = nextText;
      }

      nextEl.classList.remove("hero-text-hide");
      nextEl.classList.add("hero-text-show");
      activeEl.classList.remove("hero-text-show");
      activeEl.classList.add("hero-text-hide");

      activeLayerRef.current = nextIndex;
    };

    const loop = (now: number) => {
      if (!inViewRef.current) {
        rafIdRef.current = null;
        lastFrameTimeRef.current = null;
        return;
      }

      const last = lastFrameTimeRef.current ?? now;
      const dt = clamp((now - last) / 1000, 0, MAX_DT);
      lastFrameTimeRef.current = now;

      const rect = scrollSpace.getBoundingClientRect();
      const total = scrollSpace.offsetHeight - window.innerHeight;
      const scrolled = clamp(-rect.top, 0, total);
      const progress = total > 0 ? scrolled / total : 0;

      if (playableDuration > 0) {
        const targetTime = START_TIME_SECONDS + progress * playableDuration;
        // With reduced motion, snap straight to the target instead of
        // easing toward it — no scroll-linked animation, just the value.
        const factor = reduceMotionQuery.matches ? 1 : frameFactor(SMOOTHING, dt);
        displayedTimeRef.current += (targetTime - displayedTimeRef.current) * factor;

        if (
          !isSeekingRef.current &&
          Math.abs(video.currentTime - displayedTimeRef.current) > SEEK_THRESHOLD
        ) {
          // Plain currentTime assignment (not fastSeek) on purpose: fastSeek
          // is unsupported in Chromium entirely, and where it does exist
          // (Safari) it snaps to the nearest keyframe rather than the exact
          // requested time, which reads as jumpy during a slow scroll-scrub.
          // A precise seek every frame looks smoother in practice as long
          // as the source video has reasonably frequent keyframes.
          video.currentTime = displayedTimeRef.current;
        }
      }

      const nextText = getStageText(progress);
      if (nextText !== lastTextRef.current) {
        lastTextRef.current = nextText;
        swapText(nextText);
      }

      // Drive both the desktop (vertical, height-based) and mobile
      // (horizontal, width-based) progress bar from a single CSS custom
      // property, so no JS branching on breakpoint is needed — each
      // layout just reads the property differently.
      if (progressFillRef.current) {
        progressFillRef.current.style.setProperty("--hero-progress", `${progress * 100}%`);
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting && rafIdRef.current === null) {
          lastFrameTimeRef.current = null;
          rafIdRef.current = requestAnimationFrame(loop);
        }
      },
      { rootMargin: OBSERVER_MARGIN }
    );
    observer.observe(scrollSpace);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("seeked", handleSeeked);
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={scrollSpaceRef} data-hero-root className="hero-scroll-space">
      <div className="hero-sticky">
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          muted
          playsInline
          webkit-playsinline="true"
          preload="metadata"
          disablePictureInPicture
          className={`hero-video ${isReady ? "hero-video-ready" : ""}`}
        />

        {useFallback && (
          <div className="hero-fallback">
            <img src={POSTER_SRC} alt="BSL Construction project" />
          </div>
        )}

        <div className="hero-overlay" />

        <div className="hero-progress">
          <div ref={progressFillRef} className="hero-progress-fill" />
        </div>

        <div className="hero-caption-stack">
          <div className="hero-caption-glow" aria-hidden="true" />
          <h1
            ref={textLayerARef}
            className="hero-heading hero-text-show"
            data-text={STAGES[0].text}
          >
            {STAGES[0].text}
          </h1>
          <h1
            ref={textLayerBRef}
            className="hero-heading hero-text-hide"
            data-text=""
          />
        </div>

        <div className="hero-scroll-hint" aria-hidden="true">
          <span className="hero-scroll-line" />
        </div>

        <div className="hero-seo">
          <div className="hero-seo-track">
            {SEO_PHRASES.map((phrase, i) => (
              <span key={phrase} className="hero-seo-pill">
                {phrase}
                {i < SEO_PHRASES.length - 1 && (
                  <span className="hero-seo-dot">•</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-scroll-space {
          /* Scroll runway length — how much scroll distance it takes to
             scrub through the whole clip. Overridden per breakpoint below
             so the pacing feels right on phones vs. desktop, instead of
             using one fixed length for every viewport. */
          --hero-scroll-length: 170vh;
          height: var(--hero-scroll-length);
          position: relative;
        }

        .hero-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-video,
        .hero-fallback {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .hero-video {
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.5s ease;
          will-change: opacity;
          transform: translateZ(0);
        }
        .hero-video-ready {
          opacity: 1;
        }

        .hero-fallback img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.72) 0%,
            rgba(0, 0, 0, 0.32) 30%,
            rgba(0, 0, 0, 0.12) 48%,
            rgba(0, 0, 0, 0.16) 100%
          );
          z-index: 1;
        }

        /* ----------------------------------------------------------------
           Progress bar — vertical rail on desktop by default. Driven by
           the --hero-progress custom property set from rAF.
           ---------------------------------------------------------------- */
        .hero-progress {
          position: absolute;
          right: 0.75rem;
          top: 7.5rem;
          width: 4px;
          height: calc(100% - 12rem);
          max-height: 220px;
          background: rgba(255, 255, 255, 0.18);
          border-radius: 2px;
          z-index: 3;
        }
        .hero-progress-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: var(--hero-progress, 0%);
          background: #e0a077;
          border-radius: 2px;
          transition: height 0.05s linear;
        }

        .hero-caption-stack {
          position: absolute;
          bottom: 21%;
          left: 0;
          right: 0;
          z-index: 2;
          width: min(92vw, 560px);
          margin: 0 auto;
          box-sizing: border-box;
          padding: 0 1rem;
          min-height: 5rem;
        }

        .hero-caption-glow {
          position: absolute;
          inset: -1.5rem -1rem;
          background: radial-gradient(
            ellipse at center,
            rgba(0, 0, 0, 0.38) 0%,
            rgba(0, 0, 0, 0.16) 55%,
            transparent 80%
          );
          z-index: -1;
          pointer-events: none;
        }

        .hero-heading {
          position: absolute;
          inset: 0;
          margin: 0;
          font-size: clamp(1.75rem, 6vw, 2.75rem);
          font-weight: 700;
          line-height: 1.25;
          color: #fff;
          text-align: center;
          text-shadow: 0 2px 18px rgba(0, 0, 0, 0.55);
          transition: opacity 0.4s ease, transform 0.4s ease;
          will-change: opacity, transform;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-text-show {
          opacity: 1;
          transform: translateY(0);
        }
        .hero-text-hide {
          opacity: 0;
          transform: translateY(14px);
        }

        .hero-scroll-hint {
          position: absolute;
          bottom: 5.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          width: 22px;
          height: 34px;
          border: 2px solid rgba(255, 255, 255, 0.55);
          border-radius: 12px;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }
        .hero-scroll-line {
          display: block;
          width: 3px;
          height: 7px;
          margin-top: 7px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 2px;
          animation: hero-bounce 1.6s ease-in-out infinite;
        }

        @keyframes hero-bounce {
          0%,
          100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(8px);
            opacity: 0.5;
          }
        }

        /* ----------------------------------------------------------------
           SEO strip — wraps/centers on desktop by default; overridden to a
           horizontally scrollable snap row on mobile below.
           ---------------------------------------------------------------- */
        .hero-seo {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 2;
          background: rgba(11, 11, 13, 0.45);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        .hero-seo-track {
          padding: 0.85rem 1rem;
          padding-bottom: calc(0.85rem + env(safe-area-inset-bottom));
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.35rem 1rem;
        }
        .hero-seo-pill {
          font-size: clamp(0.65rem, 1.4vw, 0.75rem);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.78);
          font-weight: 600;
          white-space: nowrap;
        }
        .hero-seo-dot {
          margin-inline-start: 1rem;
          color: rgba(255, 255, 255, 0.28);
        }

        /* ----------------------------------------------------------------
           Very small phones
           ---------------------------------------------------------------- */
        @media (max-width: 380px) {
          .hero-scroll-space {
            --hero-scroll-length: 125vh;
          }
          .hero-caption-stack {
            padding: 0 0.5rem;
            bottom: 23%;
            min-height: 6.5rem;
          }
          .hero-heading {
            font-size: clamp(1.45rem, 7.5vw, 1.85rem);
            line-height: 1.22;
          }
        }

        /* ----------------------------------------------------------------
           Phones / small screens — the big overhaul:
           - full-bleed 100dvh sticky viewport, no rounded clipping
           - top-loading progress bar instead of a side rail
           - horizontally scrollable, snap-aligned SEO strip
           - caption sits with guaranteed clearance above the SEO strip
           - shorter, calmer scroll hint
           ---------------------------------------------------------------- */
        @media (max-width: 768px) {
          .hero-scroll-space {
            --hero-scroll-length: 130vh;
          }
          .hero-sticky {
            height: 100dvh;
          }

          .hero-overlay {
            background: linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.78) 0%,
              rgba(0, 0, 0, 0.4) 26%,
              rgba(0, 0, 0, 0.14) 46%,
              rgba(0, 0, 0, 0.18) 100%
            );
          }

          /* Progress becomes a slim top-loading bar, safe-area aware. */
          .hero-progress {
            top: env(safe-area-inset-top, 0px);
            left: 0;
            right: 0;
            width: 100%;
            height: 3px;
            max-height: none;
            border-radius: 0;
            background: rgba(255, 255, 255, 0.16);
          }
          .hero-progress-fill {
            top: 0;
            bottom: auto;
            height: 100%;
            width: var(--hero-progress, 0%);
            border-radius: 0;
            transition: width 0.05s linear;
          }

          .hero-caption-stack {
            bottom: calc(6.75rem + env(safe-area-inset-bottom));
            width: min(90vw, 480px);
            min-height: 6rem;
          }
          .hero-heading {
            font-size: clamp(1.6rem, 6.6vw, 2.1rem);
            line-height: 1.24;
            letter-spacing: -0.01em;
          }

          .hero-scroll-hint {
            bottom: calc(4.5rem + env(safe-area-inset-bottom));
            width: 18px;
            height: 28px;
          }
          .hero-scroll-line {
            height: 6px;
            margin-top: 6px;
          }

          /* SEO strip: single row, horizontally scrollable, edge-faded. */
          .hero-seo-track {
            flex-wrap: nowrap;
            justify-content: flex-start;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x proximity;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding: 0.7rem 1.25rem;
            padding-bottom: calc(0.7rem + env(safe-area-inset-bottom));
            gap: 0.35rem 0.85rem;
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
          .hero-seo-dot {
            margin-inline-start: 0.85rem;
          }
        }

        /* ----------------------------------------------------------------
           Short-landscape phones — dvh is tiny here, so trim vertical
           chrome aggressively and drop the scroll hint entirely.
           ---------------------------------------------------------------- */
        @media (max-width: 900px) and (max-height: 500px) and (orientation: landscape) {
          .hero-scroll-space {
            --hero-scroll-length: 220vh;
          }
          .hero-caption-stack {
            bottom: 5rem;
            width: min(80vw, 460px);
            min-height: 3.5rem;
          }
          .hero-heading {
            font-size: clamp(1.15rem, 4.5vw, 1.5rem);
            line-height: 1.2;
          }
          .hero-scroll-hint {
            display: none;
          }
          .hero-seo-track {
            padding-top: 0.5rem;
            padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
          }
        }

        /* ----------------------------------------------------------------
           Tablets
           ---------------------------------------------------------------- */
        @media (min-width: 769px) and (max-width: 1024px) {
          .hero-scroll-space {
            --hero-scroll-length: 155vh;
          }
          .hero-caption-stack {
            width: min(70vw, 600px);
          }
        }

        /* ----------------------------------------------------------------
           Desktop refinements
           ---------------------------------------------------------------- */
        @media (min-width: 769px) {
          .hero-caption-stack {
            bottom: 16%;
            width: min(78vw, 640px);
            padding: 0;
          }
          .hero-heading {
            font-size: clamp(2rem, 3.6vw, 2.75rem);
          }
          .hero-scroll-hint {
            display: none;
          }
        }

        /* ----------------------------------------------------------------
           Large / ultra-wide desktop
           ---------------------------------------------------------------- */
        @media (min-width: 1440px) {
          .hero-scroll-space {
            --hero-scroll-length: 190vh;
          }
          .hero-caption-stack {
            width: min(56vw, 720px);
          }
          .hero-heading {
            font-size: clamp(2.25rem, 3vw, 3.25rem);
          }
        }

        @media (max-height: 560px) and (min-width: 769px) {
          .hero-caption-stack {
            bottom: 20%;
          }
          .hero-scroll-hint {
            display: none;
          }
        }

        /* ----------------------------------------------------------------
           Respect reduced-motion preferences
           ---------------------------------------------------------------- */
        @media (prefers-reduced-motion: reduce) {
          .hero-heading {
            transition: opacity 0.15s linear, transform 0.15s linear;
          }
          .hero-video {
            transition: opacity 0.15s linear;
          }
          .hero-scroll-line {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}