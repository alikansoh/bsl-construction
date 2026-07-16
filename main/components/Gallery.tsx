/**
 * Gallery.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Plain flush-image gallery strip — brand accent #A26028.
 *
 * v3 — matched to the reference: a row of square-cornered photos sitting
 * edge-to-edge, with a soft cream panel offset behind/above them for
 * depth. No captions, no arrows, no autoplay, no progress rail — just
 * the images, laid out cleanly, with a quiet scroll-in reveal and a
 * gentle zoom on hover.
 *
 * - Desktop/tablet: the row fills the full width, each photo sharing
 *   the space evenly (flex-1), flush against its neighbours.
 * - Mobile: the row becomes a horizontal scroll strip (photos keep a
 *   sensible minimum width instead of getting squeezed thin).
 * - The cream panel is decorative (aria-hidden) and hidden on mobile,
 *   where there isn't room for it to read as intentional.
 * - `prefers-reduced-motion: reduce` shows the final state immediately
 *   and disables the hover zoom's transition.
 *
 * Swap the `src` values in GALLERY_IMAGES for real project photography.
 * -------------------------------------------------------------------------
 */
"use client";
import { useEffect, useRef, useState } from "react";

const GALLERY_IMAGES: { src: string; alt: string }[] = [
  { src: "/gallery1.webp", alt: "Renovated entrance hallway, Ealing" },
  { src: "/gallery2.webp", alt: "Fitted kitchen with loft skylight, Fulham" },
  { src: "/gallery3.webp", alt: "En-suite bathroom renovation, Wembley" },
  { src: "/gallery4.webp", alt: "Loft bedroom conversion, Chiswick" },
  { src: "/gallery5.webp", alt: "Open-plan kitchen extension, Acton" },
  { src: "/gallery6.webp", alt: "Living space full renovation, Richmond" },
];

function usePrefersReducedMotion() {
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

function useIntersection<T extends Element>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible] as const;
}

export default function Gallery() {
  const reducedMotion = usePrefersReducedMotion();
  const [sectionRef, visible] = useIntersection<HTMLDivElement>(0.15);

  return (
    <section className="relative overflow-hidden bg-[#FAFAF9] py-16 md:py-24">
      <style>{`
        .bsl-gallery-row { scrollbar-width: none; -ms-overflow-style: none; }
        .bsl-gallery-row::-webkit-scrollbar { display: none; }
      `}</style>

      <div ref={sectionRef} className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        {/* decorative cream panel, offset behind/above the row */}
        <div
          aria-hidden="true"
          className="absolute right-5 top-0 hidden h-[230px] w-[64%] bg-[#F1E7D6] transition-opacity duration-700 ease-out sm:right-8 sm:block md:h-[260px]"
          style={{ opacity: visible || reducedMotion ? 1 : 0 }}
        />

        <div
          className="bsl-gallery-row relative z-10 mt-6 flex gap-0 overflow-x-auto sm:mt-8 sm:overflow-visible md:mt-10"
        >
          {GALLERY_IMAGES.map((item, index) => (
            <div
              key={item.src}
              className="h-56 flex-[0_0_200px] sm:h-72 sm:flex-1 md:h-80"
              style={{
                opacity: visible || reducedMotion ? 1 : 0,
                transform: `translateY(${visible || reducedMotion ? 0 : "20px"})`,
                transition: reducedMotion
                  ? "none"
                  : `opacity 0.7s ease ${index * 90}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${index * 90}ms`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.05] motion-reduce:hover:scale-100"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}