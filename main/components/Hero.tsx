"use client";

/**
 * Hero.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Scroll-scrubbed video hero with a responsive, mobile-first layout.
 * - Mobile-safe video priming (play -> pause -> seek) so iOS/Android render frames.
 * - Poster + static fallback image for Low Power Mode / data saver.
 * - Larger, optically centered captions on small screens.
 * - Edge-safe progress bar (inset from screen edges).
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/video1.mp4";
const POSTER_SRC = "/hero-poster.jpg"; // Fallback image shown while video loads

const START_TIME_SECONDS = 14;
const SCROLL_LENGTH_VH = 130;
const SEEK_THRESHOLD = 0.015;
const SMOOTHING = 0.28;
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

  useEffect(() => {
    const video = videoRef.current;
    const scrollSpace = scrollSpaceRef.current;
    if (!video || !scrollSpace) return;

    let fullDuration = 0;
    let playableDuration = 0;
    let primed = false;

    // Mobile fix: iOS/Android often will not decode/draw a frame until the
    // video has actually played once. We briefly play(), then immediately
    // pause(), then start our normal scroll-seeking. Autoplay policies may
    // still block this (Low Power Mode / Data Saver), in which case we show
    // the static fallback poster.
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
        // Autoplay blocked or video failed to start decoding
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
      if (!isReady && !useFallback) primeVideo();
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

    const canFastSeek =
      typeof (video as unknown as { fastSeek?: unknown }).fastSeek === "function";

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
        const factor = frameFactor(SMOOTHING, dt);
        displayedTimeRef.current += (targetTime - displayedTimeRef.current) * factor;

        if (
          !isSeekingRef.current &&
          Math.abs(video.currentTime - displayedTimeRef.current) > SEEK_THRESHOLD
        ) {
          if (canFastSeek) {
            (video as unknown as { fastSeek: (t: number) => void }).fastSeek(
              displayedTimeRef.current
            );
          } else {
            video.currentTime = displayedTimeRef.current;
          }
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
  }, [isReady, useFallback]);

  return (
    <div
      ref={scrollSpaceRef}
      data-hero-root
      className="hero-scroll-space"
      style={{ height: `${SCROLL_LENGTH_VH}vh`, position: "relative" }}
    >
      <div className="hero-sticky">
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          muted
          autoPlay
          playsInline
          webkit-playsinline="true"
          preload="metadata"
          disablePictureInPicture
          className={`hero-video ${isReady ? "hero-video-ready" : ""}`}
        />

        {/* Static fallback shown when autoplay is blocked or video fails */}
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
              {i < SEO_PHRASES.length - 1 && <span className="hero-seo-dot">•</span>}
            </span>
          ))}
        </div>

        <div className="hero-scroll-hint" aria-hidden="true">
          <span className="hero-scroll-line" />
        </div>
      </div>

      <style jsx>{`
        .hero-scroll-space {
          min-height: 160vh;
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
          transition: opacity 0.45s ease, transform 0.45s ease;
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
        }

        .hero-seo {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 2;
          padding: 0.85rem 1rem;
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

        @media (max-height: 560px) {
          .hero-caption-stack {
            bottom: 20%;
          }
          .hero-scroll-hint {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}