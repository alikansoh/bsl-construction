"use client";

/**
 * Hero.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Scroll-scrubbed video (playback position follows scroll progress) with a
 * single large description that cross-fades to a new line of copy as you
 * scroll through each build stage.
 *
 * Nav has been split out into its own component — see Nav.tsx. Render them
 * together, Nav first, so it sits fixed above this section:
 *
 *   <Nav />
 *   <Hero />
 *
 * Smoothness (improved from the previous version):
 * - One continuous requestAnimationFrame loop (not scroll-event driven)
 * - The scroll → video-time lerp is now frame-rate independent: the catch-up
 *   speed is derived from real elapsed time (dt), not just "per frame", so
 *   scrubbing feels identical on a 60Hz and 120Hz display and doesn't lag
 *   or overshoot after a dropped frame / tab switch.
 * - Uses video.fastSeek() when the browser supports it, which is built for
 *   exactly this kind of rapid scrub-seeking and avoids the small stutter
 *   currentTime can cause when called dozens of times a second.
 * - The rAF loop pauses itself via IntersectionObserver once the hero is
 *   well outside the viewport, and resumes when it's back in range — no
 *   wasted seeks/paint work while you're reading further down the page.
 * - Caption swap is a real two-layer crossfade (both layers animate at once)
 *   instead of fade-out → setTimeout → fade-in, so there's no blank gap.
 * - Progress-bar/caption updates mutate the DOM directly (refs), not state,
 *   so there's no 60x/sec React re-render.
 *
 * Setup in your Next.js project:
 * 1) Put the video file at: public/video.mp4
 * 2) Import the component:  import Hero from "@/components/Hero";
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/video1.mp4";

// Fixed start point in seconds — playback always begins here (wood-frame stage)
const START_TIME_SECONDS = 14;

// Height (in vh) of the scroll-driven space. Must be > 100 (the viewport
// height) or there's no scroll distance left to track — the animation
// would just freeze at 0%. Lower = faster scroll, but keep it above ~110.
const SCROLL_LENGTH_VH = 130;

// Minimum time difference (seconds) before we bother issuing a new seek
const SEEK_THRESHOLD = 0.015;

// How quickly the video "catches up" to the scroll position, expressed as
// the fraction of the remaining distance closed per 1/60s tick. Frame-rate
// independent — see frameFactor() below. Lower = smoother/floatier,
// higher = snappier/more literal to scroll speed.
const SMOOTHING = 0.28;

// Longest dt (seconds) we'll honor in one tick — caps the catch-up jump
// after a dropped frame, background tab, or slow device hiccup.
const MAX_DT = 1 / 24;

// Rough distance (px) beyond the viewport at which we stop bothering to
// keep the video synced — saves work while the hero is far off-screen.
const OBSERVER_MARGIN = "200px 0px 200px 0px";

// Bottom SEO strip — short and broad on purpose, not a long crowded list
const SEO_PHRASES = ["New Builds", "Renovations", "Home Maintenance", "General Contracting"];

// The one big description — BSL's services, replacing itself as you scroll
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

// Frame-rate independent smoothing factor: turns the "per frame" SMOOTHING
// constant into a proper exponential decay based on elapsed time, so a
// 120Hz display (dt ≈ 8ms) and a 60Hz display (dt ≈ 16ms) converge on the
// target at the same real-world speed instead of the 120Hz one taking twice
// as many small steps and feeling slower.
function frameFactor(smoothing: number, dt: number) {
  return 1 - Math.pow(1 - smoothing, dt * 60);
}

export default function Hero() {
  const scrollSpaceRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);

  // Two stacked caption layers for a true crossfade (both animate together,
  // no gap between "old text gone" and "new text visible"). Kept as two
  // explicitly named refs — not an array rendered via .map() — since
  // mapping refs directly into JSX trips React's render-time ref check.
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

  useEffect(() => {
    const video = videoRef.current;
    const scrollSpace = scrollSpaceRef.current;
    if (!video || !scrollSpace) return;

    let fullDuration = 0;
    let playableDuration = 0;

    const handleLoadedMetadata = () => {
      fullDuration = video.duration || 0;
      playableDuration = Math.max(fullDuration - START_TIME_SECONDS, 0);
      video.currentTime = START_TIME_SECONDS;
      displayedTimeRef.current = START_TIME_SECONDS;
      video.pause();
      setIsReady(true);
    };

    const handleSeeking = () => {
      isSeekingRef.current = true;
    };
    const handleSeeked = () => {
      isSeekingRef.current = false;
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("seeked", handleSeeked);
    if (video.readyState >= 1) handleLoadedMetadata();

    const textLayers = [textLayerARef, textLayerBRef];

    const swapText = (nextText: string) => {
      const activeIndex = activeLayerRef.current;
      const nextIndex = activeIndex === 0 ? 1 : 0;
      const activeEl = textLayers[activeIndex].current;
      const nextEl = textLayers[nextIndex].current;
      if (!activeEl || !nextEl) return;

      nextEl.textContent = nextText;
      // Both layers transition simultaneously — true crossfade, no gap.
      nextEl.style.opacity = "1";
      nextEl.style.transform = "translateY(0)";
      activeEl.style.opacity = "0";
      activeEl.style.transform = "translateY(-10px)";

      activeLayerRef.current = nextIndex;
    };

    const canFastSeek = typeof (video as unknown as { fastSeek?: unknown }).fastSeek === "function";

    const loop = (now: number) => {
      if (!inViewRef.current) {
        // Stop scheduling entirely while off-screen; the IntersectionObserver
        // below will kick the loop back on when the hero re-enters range.
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
        // Ease toward the target instead of snapping straight to it — this
        // is what smooths out choppy trackpad/wheel scroll input. The
        // factor is derived from dt so it behaves the same at any refresh rate.
        const factor = frameFactor(SMOOTHING, dt);
        displayedTimeRef.current += (targetTime - displayedTimeRef.current) * factor;

        if (
          !isSeekingRef.current &&
          Math.abs(video.currentTime - displayedTimeRef.current) > SEEK_THRESHOLD
        ) {
          if (canFastSeek) {
            (video as unknown as { fastSeek: (t: number) => void }).fastSeek(displayedTimeRef.current);
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
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("seeked", handleSeeked);
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={scrollSpaceRef}
      data-hero-root
      style={{ height: `${SCROLL_LENGTH_VH}vh`, position: "relative" }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: isReady ? 1 : 0,
            transition: "opacity .5s ease",
          }}
        />

        {/* A little darkness so the text stays legible, without hiding the video */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(0deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.15) 35%, rgba(0,0,0,.1) 60%, rgba(0,0,0,.35) 100%)",
            zIndex: 1,
          }}
        />

        {/* The one description — bottom-center, bigger, no blur panel behind it.
            Two stacked layers crossfade between stage captions. */}
        <div
          style={{
            position: "absolute",
            bottom: "16%",
            insetInline: 0,
            zIndex: 2,
            maxWidth: "min(85vw, 640px)",
            margin: "0 auto",
          }}
        >
          <h1
            ref={textLayerARef}
            style={{
              position: "relative",
              fontSize: "clamp(1.5rem, 3.6vw, 2.5rem)",
              fontWeight: 700,
              lineHeight: 1.3,
              color: "#fff",
              textAlign: "center",
              textShadow: "0 2px 16px rgba(0,0,0,.55)",
              opacity: 1,
              transform: "translateY(0)",
              transition: "opacity .4s ease, transform .4s ease",
              margin: 0,
            }}
          >
            {STAGES[0].text}
          </h1>
          <h1
            ref={textLayerBRef}
            style={{
              position: "absolute",
              inset: 0,
              fontSize: "clamp(1.5rem, 3.6vw, 2.5rem)",
              fontWeight: 700,
              lineHeight: 1.3,
              color: "#fff",
              textAlign: "center",
              textShadow: "0 2px 16px rgba(0,0,0,.55)",
              opacity: 0,
              transform: "translateY(-10px)",
              transition: "opacity .4s ease, transform .4s ease",
              margin: 0,
            }}
          >
            {""}
          </h1>
        </div>

        {/* Thin scroll-progress indicator */}
        <div
          style={{
            position: "absolute",
            insetInlineEnd: 0,
            top: 0,
            width: 3,
            height: "100%",
            background: "rgba(255,255,255,.15)",
            zIndex: 3,
          }}
        >
          <div
            ref={progressFillRef}
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: "0%",
              background: "#e0a077",
            }}
          />
        </div>

        {/* Minimal bottom SEO strip, not scroll-tied, kept short so it stays clean */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            insetInline: 0,
            zIndex: 2,
            padding: "0.75rem 1rem",
            background: "rgba(11,11,13,0.4)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.4rem 1rem",
          }}
        >
          {SEO_PHRASES.map((phrase, i) => (
            <span
              key={phrase}
              style={{
                fontSize: "clamp(0.65rem, 1.4vw, 0.75rem)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {phrase}
              {i < SEO_PHRASES.length - 1 && (
                <span style={{ marginInlineStart: "1rem", color: "rgba(255,255,255,0.25)" }}>
                  •
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}