/**
 * components/services/ServicesCategoryNav.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Sticky category nav for /services. Client component so it can track
 * scroll position: watches each category <section id="..."> with an
 * IntersectionObserver and slides a gold underline to the active link,
 * the way a tab bar would. Falls back gracefully — if JS hasn't hydrated
 * yet, or a section id is missing, the links are still plain working
 * anchors to their section.
 * -------------------------------------------------------------------------
 */

"use client";

import { useEffect, useRef, useState } from "react";

export type NavCategory = {
  slug: string;
  eyebrow: string;
  title: string;
  count: number;
};

export default function ServicesCategoryNav({
  categories,
}: {
  categories: NavCategory[];
}) {
  const [active, setActive] = useState<string>(categories[0]?.slug ?? "");
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const rowRef = useRef<HTMLDivElement | null>(null);

  // Track which category section is currently in view.
  useEffect(() => {
    const sections = categories
      .map((category) => document.getElementById(category.slug))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setActive(visible[0].target.id);
        }
      },
      {
        // Bias the trigger line below the sticky nav so a section only
        // counts as "active" once it's actually visible beneath it.
        rootMargin: "-96px 0px -55% 0px",
        threshold: [0, 1],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [categories]);

  // Slide the underline to whichever link is active.
  useEffect(() => {
    const el = linkRefs.current[active];
    const row = rowRef.current;
    if (el && row) {
      setIndicator({
        left: el.offsetLeft,
        width: el.offsetWidth,
      });
    }
  }, [active]);

  return (
    <div
      ref={rowRef}
      className="
        relative
        mx-auto
        flex
        max-w-[1180px]
        overflow-x-auto
        px-5
        sm:px-8
        lg:px-10
      "
    >
      {categories.map((category) => {
        const isActive = active === category.slug;

        return (
          <a
            key={category.slug}
            ref={(el) => {
              linkRefs.current[category.slug] = el;
            }}
            href={`#${category.slug}`}
            aria-current={isActive ? "true" : undefined}
            className={`
              bsl-focus
              bsl-mono
              group
              flex
              shrink-0
              items-baseline
              gap-2
              border-r
              border-[#1C1712]/10
              px-6
              py-4
              text-[0.72rem]
              font-medium
              uppercase
              tracking-[0.12em]
              transition-colors
              duration-200
              first:border-l
              ${isActive ? "text-[#A26028]" : "text-[#6E6259] hover:text-[#8A5121]"}
            `}
          >
            <span className={isActive ? "text-[#A26028]/70" : "text-[#6E6259]/45"}>
              {category.eyebrow}
            </span>

            {category.title}

            <span className={isActive ? "text-[#A26028]/60" : "text-[#6E6259]/40"}>
              ({String(category.count).padStart(2, "0")})
            </span>
          </a>
        );
      })}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-0
          h-[2px]
          bg-[#A26028]
          transition-all
          duration-300
          ease-out
        "
        style={{ left: indicator.left, width: indicator.width }}
      />
    </div>
  );
}