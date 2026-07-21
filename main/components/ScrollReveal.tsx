"use client";

/**
 * ScrollReveal — BSL Construction
 * -------------------------------------------------------------------------
 * Drop this once inside any (server) page's <main>. It renders nothing
 * itself — on mount it finds every [data-reveal] element already in the
 * DOM (server-rendered content included, since this runs after hydration)
 * and wires up a GSAP + ScrollTrigger fade/rise-in.
 *
 * Usage:
 *   <main>
 *     <ScrollReveal />
 *     <section data-reveal>...</section>
 *     <div data-reveal data-reveal-group="cards">card 1</div>
 *     <div data-reveal data-reveal-group="cards">card 2</div>
 *   </main>
 *
 * - Elements sharing the same data-reveal-group value are staggered
 *   together as a batch (e.g. a row of service cards).
 * - Elements with no group animate independently.
 * - Respects prefers-reduced-motion by skipping the animation entirely.
 */

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ScrollReveal() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set("[data-reveal]", { autoAlpha: 1, y: 0 });
        return;
      }

      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>("[data-reveal]")
      );

      const groups = new Map<string, HTMLElement[]>();
      const solo: HTMLElement[] = [];

      nodes.forEach((node) => {
        const group = node.dataset.revealGroup;
        if (group) {
          const list = groups.get(group) ?? [];
          list.push(node);
          groups.set(group, list);
        } else {
          solo.push(node);
        }
      });

      solo.forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      groups.forEach((els) => {
        gsap.fromTo(
          els,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: els[0],
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    });

    // Recalculate trigger positions once images/layout settle.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  return null;
}