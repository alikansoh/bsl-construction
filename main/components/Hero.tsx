"use client";

/**
 * Hero.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Scroll-scrubbed video hero with mobile-first responsive sizing.
 * - Video begins at 6 seconds.
 * - On phones the sticky hero viewport is shorter (78dvh) so the video
 *   doesn't feel oversized.
 * - Scroll runway length is a CSS custom property, overridden per
 *   breakpoint, so the scrub distance itself is responsive (not just the
 *   viewport size) — this also fixes a mismatch that used to exist
 *   between the old JS constant and a hardcoded CSS min-height.
 * - Mobile-safe priming play-then-pause to force iOS/Android to decode.
 * - Poster + static fallback for Low Power Mode / Data Saver.
 * - Respects prefers-reduced-motion.
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/video1.mp4";
const POSTER_SRC = "/hero-poster.jpg"; // Add this to /public

// Start playback at 6 seconds
const START_TIME_SECONDS = 6;

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

      if (progressFillRef.current) {
        progressFillRef.current.style.height = `${progress * 100}%`;
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

        <div className="hero-caption-stack">
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

        <div className="hero-progress">
          <div ref={progressFillRef} className="hero-progress-fill" />
        </div>

        <div className="hero-seo">
          {SEO_PHRASES.map((phrase, i) => (
            <span key={phrase} className="hero-seo-pill">
              {phrase}
              {i < SEO_PHRASES.length - 1 && (
                <span className="hero-seo-dot">•</span>
              )}
            </span>
          ))}
        </div>

        <div className="hero-scroll-hint" aria-hidden="true">
          <span className="hero-scroll-line" />
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
            rgba(0, 0, 0, 0.65) 0%,
            rgba(0, 0, 0, 0.28) 30%,
            rgba(0, 0, 0, 0.15) 50%,
            rgba(0, 0, 0, 0.42) 100%
          );
          z-index: 1;
        }

        .hero-caption-stack {
          position: absolute;
          bottom: 18%;
          left: 0;
          right: 0;
          z-index: 2;
          width: min(92vw, 560px);
          margin: 0 auto;
          box-sizing: border-box;
          padding: 0 1rem;
          min-height: 5rem;
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
          width: 100%;
          height: 0%;
          background: #e0a077;
          border-radius: 2px;
          transition: height 0.05s linear;
        }

        .hero-seo {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 2;
          padding: 0.85rem 1rem;
          padding-bottom: calc(0.85rem + env(safe-area-inset-bottom));
          background: rgba(11, 11, 13, 0.45);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
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
           Very small phones
           ---------------------------------------------------------------- */
        @media (max-width: 380px) {
          .hero-scroll-space {
            --hero-scroll-length: 125vh;
          }
          .hero-caption-stack {
            padding: 0 0.75rem;
            bottom: 20%;
          }
          .hero-heading {
            font-size: clamp(1.5rem, 7vw, 1.9rem);
          }
          .hero-seo {
            padding: 0.65rem 0.75rem;
            padding-bottom: calc(0.65rem + env(safe-area-inset-bottom));
            gap: 0.3rem 0.6rem;
          }
          .hero-seo-dot {
            margin-inline-start: 0.6rem;
          }
        }

        /* ----------------------------------------------------------------
           Phones / small screens: shorter hero viewport + shorter runway
           ---------------------------------------------------------------- */
        @media (max-width: 768px) {
          .hero-scroll-space {
            --hero-scroll-length: 135vh;
          }
          .hero-sticky {
            height: 78dvh;
            border-radius: 0 0 1.5rem 1.5rem;
          }
          .hero-progress {
            top: 6rem;
            max-height: 160px;
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
          .hero-progress {
            right: 0;
            top: 0;
            width: 3px;
            height: 100%;
            max-height: none;
            border-radius: 0;
            background: rgba(255, 255, 255, 0.15);
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

        @media (max-height: 560px) {
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