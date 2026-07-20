"use client";

import { useEffect, useState } from "react";

type NavItem = { href: string; label: string };

type Props = {
  items: NavItem[];
};

/**
 * ServiceSectionNav — the in-page jump nav for a service detail page.
 * Adds two small, functional refinements over a plain link row:
 *  1. A hairline progress rail across the top that fills with scroll —
 *     useful orientation on a long page, not just decoration.
 *  2. Scroll-spy: the current section stays underlined, like a bookmark
 *     ribbon, instead of only reacting to hover.
 */
export default function ServiceSectionNav({ items }: Props) {
  const [activeHref, setActiveHref] = useState(items[0]?.href ?? "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const targets = items
      .map((item) => document.getElementById(item.href.replace("#", "")))
      .filter((el): el is HTMLElement => Boolean(el));

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveHref(`#${visible[0].target.id}`);
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 1] }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setProgress(pct);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="sticky top-0 z-20 border-b border-[#1C1712]/8 bg-[#FAF7F2]/90 backdrop-blur-md">
      <div aria-hidden="true" className="h-[2px] w-full bg-[#1C1712]/[0.06]">
        <div
          className="h-full bg-[#A26028] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <nav
        aria-label="Section navigation"
        className="mx-auto flex max-w-[820px] gap-6 overflow-x-auto px-5 py-3.5 sm:px-8"
      >
        {items.map((item) => {
          const isActive = activeHref === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={isActive ? "true" : undefined}
              className={`bsl-focus bsl-mono group relative shrink-0 py-1 text-[0.72rem] font-medium uppercase tracking-[0.09em] transition-colors ${
                isActive ? "text-[#A26028]" : "text-[#6E6259] hover:text-[#A26028]"
              }`}
            >
              {item.label}
              <span
                aria-hidden="true"
                className={`absolute -bottom-0.5 left-0 h-px bg-[#A26028] transition-all duration-200 ease-out ${
                  isActive ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </a>
          );
        })}
      </nav>
    </div>
  );
}