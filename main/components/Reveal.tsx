"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger delay in ms, applied only once the element is visible. */
  delay?: number;
  className?: string;
  id?: string;
  /** Element type to render — use "li" inside <ol>/<ul> so list semantics stay valid. */
  as?: "div" | "li";
};

/**
 * Reveal — fades and lifts content into place the first time it enters
 * the viewport, then leaves it alone (no re-triggering on scroll back up,
 * which reads as jittery rather than premium).
 *
 * Progressive enhancement: if JavaScript never runs, the global
 * `.bsl-reveal` rule still defaults to visible (see the <noscript> override
 * in page.tsx), so content is never permanently hidden.
 */
export default function Reveal({ children, delay = 0, className = "", id, as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Comp: ElementType = as;

  return (
    <Comp
      ref={ref}
      id={id}
      className={`bsl-reveal ${visible ? "bsl-reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Comp>
  );
}