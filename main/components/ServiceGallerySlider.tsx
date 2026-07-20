"use client";

/**
 * components/ServiceGallerySlider.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Coverflow-style project gallery, matching the reference: a centered,
 * enlarged "active" card with neighbouring cards receding, scaled down,
 * and tilted away in 3D on either side. Two circular arrow buttons
 * beneath the stage drive navigation; clicking a side card brings it to
 * the centre; clicking the centre card opens a fullscreen lightbox.
 *
 * Implementation notes:
 * - Pure CSS transforms driven from inline styles (percentage-based
 *   translateX + rotateY + scale), so no carousel library is needed.
 * - Circular distance from the active index means the stack still reads
 *   correctly if you jump several slides at once (e.g. via keyboard).
 * - Swipe support on touch, arrow-key + Escape support in the lightbox.
 * - Respects prefers-reduced-motion by disabling the transform transition.
 * -------------------------------------------------------------------------
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

type GalleryImage = {
  url: string;
  alt: string;
};

type ServiceGallerySliderProps = {
  images: GalleryImage[];
  title: string;
};

// Visual "stops" for how far a card sits from the active centre slot.
// Anything beyond ±2 is hidden entirely.
const STOPS: Record<number, { x: number; scale: number; rotate: number; z: number; opacity: number }> = {
  0: { x: 0, scale: 1, rotate: 0, z: 40, opacity: 1 },
  1: { x: 62, scale: 0.82, rotate: -20, z: 30, opacity: 0.9 },
  [-1]: { x: -62, scale: 0.82, rotate: 20, z: 30, opacity: 0.9 },
  2: { x: 108, scale: 0.64, rotate: -30, z: 20, opacity: 0.5 },
  [-2]: { x: -108, scale: 0.64, rotate: 30, z: 20, opacity: 0.5 },
};

function circularOffset(i: number, index: number, count: number) {
  let d = i - index;
  if (d > count / 2) d -= count;
  if (d < -count / 2) d += count;
  return d;
}

export default function ServiceGallerySlider({ images, title }: ServiceGallerySliderProps) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const count = images.length;
  const current = images[index];

  const goTo = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    stageRef.current?.focus();
  }, []);

  useEffect(() => {
    if (lightboxOpen) closeButtonRef.current?.focus();
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, closeLightbox, goNext, goPrev]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) (delta < 0 ? goNext() : goPrev());
    touchStartX.current = null;
  };

  const onStageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLightbox();
    }
  };

  if (count === 0) return null;

  return (
    <div>
      {/* ---- Coverflow stage ---- */}
      <div
        ref={stageRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${title} gallery`}
        tabIndex={0}
        onKeyDown={onStageKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="bsl-focus relative h-[240px] overflow-hidden sm:h-[320px] lg:h-[400px]"
        style={{ perspective: "1400px" }}
      >
        {images.map((img, i) => {
          const offset = circularOffset(i, index, count);
          const isCenter = offset === 0;
          const stop = STOPS[offset as keyof typeof STOPS];
          const hidden = !stop;

          return (
            <button
              key={img.url + i}
              type="button"
              aria-hidden={!isCenter}
              aria-label={isCenter ? `Open full-size image ${i + 1} of ${count}` : `Show image ${i + 1} of ${count}`}
              tabIndex={-1}
              onClick={() => (isCenter ? openLightbox() : goTo(i))}
              className="bsl-cover-card absolute left-1/2 top-1/2 w-[62%] cursor-pointer overflow-hidden rounded-[1.5rem] shadow-[0_24px_48px_-16px_rgba(28,23,18,0.35)] ring-1 ring-[#1C1712]/[0.06] sm:w-[46%] lg:w-[34%]"
              style={{
                aspectRatio: "4 / 3",
                zIndex: hidden ? 0 : stop.z,
                opacity: hidden ? 0 : stop.opacity,
                pointerEvents: hidden ? "none" : "auto",
                transform: `translate(-50%, -50%) translateX(${hidden ? (offset > 0 ? 140 : -140) : stop.x}%) rotateY(${hidden ? 0 : stop.rotate}deg) scale(${hidden ? 0.5 : stop.scale})`,
              }}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 380px, 60vw"
                className="object-cover"
                priority={isCenter}
              />
              {!isCenter && (
                <span aria-hidden="true" className="absolute inset-0 bg-[#1C1712]/15" />
              )}
              {isCenter && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#1C1712]/70 text-[#E8C599] backdrop-blur-sm transition-colors duration-200"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ---- Arrow controls ---- */}
      {count > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="bsl-focus flex h-11 w-11 items-center justify-center rounded-full bg-[#1C1712] text-[#E8C599] transition-colors duration-200 ease-out hover:bg-[#A26028]"
          >
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M12 1L5 7L12 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="bsl-serif px-1 text-[0.9rem] font-semibold text-[#1C1712]">
            {String(index + 1).padStart(2, "0")}
            <span className="text-[#A9A093]"> / {String(count).padStart(2, "0")}</span>
          </span>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="bsl-focus flex h-11 w-11 items-center justify-center rounded-full bg-[#1C1712] text-[#E8C599] transition-colors duration-200 ease-out hover:bg-[#A26028]"
          >
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 1L9 7L2 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      <style>{`
        .bsl-cover-card {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease-out;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
        @media (prefers-reduced-motion: reduce) {
          .bsl-cover-card { transition: opacity 0.3s ease-out; }
        }
      `}</style>

      {/* ---- Fullscreen lightbox ---- */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} gallery, full screen`}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1C1712]/96 px-4 py-8 backdrop-blur-md sm:px-10"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeLightbox}
            aria-label="Close gallery"
            className="bsl-focus absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-[#A26028] sm:right-8 sm:top-8"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          <div className="relative flex w-full max-w-4xl flex-1 items-center justify-center">
            <div className="relative aspect-[4/3] max-h-[70vh] w-full overflow-hidden rounded-[1.25rem] sm:aspect-[16/10]">
              {images.map((img, i) => (
                <div
                  key={img.url + i}
                  aria-hidden={i !== index}
                  className="absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none"
                  style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 1024px) 900px, 100vw"
                    className="object-contain"
                  />
                </div>
              ))}
            </div>

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous image"
                  className="bsl-focus absolute left-0 top-1/2 flex h-11 w-11 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-[#A26028] sm:-translate-x-14"
                >
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M12 1L5 7L12 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next image"
                  className="bsl-focus absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 translate-x-4 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-[#A26028] sm:translate-x-14"
                >
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 1L9 7L2 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
          </div>

          <div className="mt-5 flex flex-col items-center gap-3">
            <p className="bsl-serif text-[0.95rem] font-semibold text-white">
              {String(index + 1).padStart(2, "0")}
              <span className="text-white/45"> — {String(count).padStart(2, "0")}</span>
              <span className="ml-3 font-normal text-white/55">{current.alt}</span>
            </p>
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.url + i}
                  type="button"
                  aria-label={`Show image ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-200 ease-out ${
                    i === index ? "w-6 bg-[#E8C599]" : "w-1.5 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            Showing image {index + 1} of {count}: {current.alt}
          </p>
        </div>
      )}
    </div>
  );
}