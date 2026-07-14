"use client";

/**
 * Nav.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Transparent while the Hero's scroll-scrub video is still pinned/progressing.
 * Switches to a solid white background only once the hero's scroll runway
 * has been fully consumed (progress bar finished) and the page starts
 * actually scrolling past the hero.
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = ["Home", "About", "Services", "Projects", "Contact Us"];

const MOBILE_BREAKPOINT = 768;

// Small buffer so the switch feels intentional rather than firing at the
// exact last pixel of the hero runway.
const SCROLL_TRIGGER_BUFFER = 0;

function navHref(label: string) {
  return label === "Home" ? "/" : `/${label.toLowerCase().replace(" ", "-")}`;
}

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Switch nav background once the hero's scroll-scrub runway has been
  // fully consumed — i.e. once the progress bar finishes and the sticky
  // video releases and the page actually starts moving. Falls back to
  // "any scroll" behavior if no [data-hero-root] element is found on the
  // page, so this component still works on pages without the Hero.
  useEffect(() => {
    let ticking = false;
    let threshold = 0;

    const computeThreshold = () => {
      const heroRoot = document.querySelector<HTMLElement>("[data-hero-root]");
      if (heroRoot) {
        // The sticky hero stays pinned for (scrollSpaceHeight - viewportHeight)
        // of scroll distance. Once scrollY passes that, the hero has been
        // fully scrubbed and the page is genuinely scrolling past it.
        const runway = heroRoot.offsetHeight - window.innerHeight;
        threshold = Math.max(runway, 0) + SCROLL_TRIGGER_BUFFER;
      } else {
        // No hero on this page — treat any scroll as "scrolled".
        threshold = 0;
      }
    };

    const update = () => {
      setIsScrolled(window.scrollY > threshold);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    const onResize = () => {
      computeThreshold();
      onScroll();
    };

    computeThreshold();
    update(); // check on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Lock body scroll while mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    const handleResize = () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Close mobile menu on Escape.
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isMenuOpen]);

  const showBackground = isScrolled || isMenuOpen;

  return (
    <>
      <nav
        className="site-nav"
        style={{
          position: "fixed",
          top: 0,
          insetInline: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "clamp(1rem, 2.5vw, 1.75rem) clamp(1.25rem, 5vw, 3rem)",
          background: showBackground ? "#ffffff" : "transparent",
          backdropFilter: showBackground ? "blur(12px)" : "none",
          WebkitBackdropFilter: showBackground ? "blur(12px)" : "none",
          borderBottom: showBackground
            ? "1px solid rgba(0,0,0,0.08)"
            : "1px solid transparent",
          boxShadow: showBackground ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
          transition:
            "background .35s ease, backdrop-filter .35s ease, border-color .35s ease, box-shadow .35s ease",
        }}
      >
        <Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            lineHeight: 0,
            flexShrink: 0,
            zIndex: 52,
          }}
        >
          <Image
            src="/logo.png"
            alt="BSL Construction"
            width={200}
            height={100}
            priority
            className="site-nav-logo"
            style={{
              filter: showBackground
                ? "drop-shadow(0 1px 4px rgba(0,0,0,0.1))"
                : "drop-shadow(0 2px 12px rgba(0,0,0,.55))",
            }}
          />
        </Link>

        {/* Desktop links */}
        <div
          className="site-nav-links"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(1.25rem, 3vw, 2.5rem)",
          }}
        >
          {NAV_LINKS.map((label) => (
            <Link
              key={label}
              href={navHref(label)}
              className="site-nav-link"
              style={{
                fontSize: "0.92rem",
                fontWeight: 600,
                color: showBackground ? "#0b0b0d" : "#fff",
                textDecoration: "none",
                textShadow: showBackground
                  ? "none"
                  : "0 2px 10px rgba(0,0,0,.45)",
                transition: "color .35s ease, text-shadow .35s ease",
              }}
            >
              {label}
            </Link>
          ))}

          <Link
            href="/contact#quote"
            className="site-nav-cta"
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#fff",
              textDecoration: "none",
              background: "#0b0b0d",
              padding: "0.55rem 1.25rem",
              borderRadius: 9999,
              transition: "background .25s ease, transform .25s ease",
            }}
          >
            Get Free Quote
          </Link>
        </div>

        {/* Hamburger toggle */}
        <button
          type="button"
          className={`site-nav-toggle${showBackground ? " scrolled" : ""}`}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="site-nav-mobile-panel"
          onClick={() => setIsMenuOpen((open) => !open)}
          style={{
            display: "none",
            width: 44,
            height: 44,
            padding: 0,
            border: "none",
            borderRadius: 10,
            background: showBackground
              ? "rgba(0,0,0,0.06)"
              : "rgba(255,255,255,0.12)",
            cursor: "pointer",
            position: "relative",
            flexShrink: 0,
            zIndex: 52,
            transition: "background .25s ease",
          }}
        >
          <span className={`site-nav-bar bar-1${isMenuOpen ? " open" : ""}`} />
          <span className={`site-nav-bar bar-2${isMenuOpen ? " open" : ""}`} />
          <span className={`site-nav-bar bar-3${isMenuOpen ? " open" : ""}`} />
        </button>
      </nav>

      {/* Mobile full-screen slide-down panel */}
      <div
        id="site-nav-mobile-panel"
        role="dialog"
        aria-modal="true"
        className="site-nav-mobile-panel"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 51,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2rem",
          padding: "clamp(6.5rem, 26vw, 9.5rem) 1.5rem 2.5rem",
          background:
            "linear-gradient(180deg, rgba(11,11,13,0.98) 0%, rgba(18,18,22,0.98) 100%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          transform: isMenuOpen ? "translateY(0)" : "translateY(-100%)",
          opacity: isMenuOpen ? 1 : 0,
          visibility: isMenuOpen ? "visible" : "hidden",
          transition:
            "transform .4s cubic-bezier(0.22, 1, 0.36, 1), opacity .35s ease, visibility .4s",
        }}
      >
        {/* Close X */}
        <button
          type="button"
          className="mobile-nav-close"
          aria-label="Close menu"
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: "absolute",
            top: "clamp(1.2rem, 3vw, 2rem)",
            right: "clamp(1.25rem, 5vw, 3rem)",
            width: 44,
            height: 44,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            borderRadius: 10,
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: "1.6rem",
            fontWeight: 300,
            lineHeight: 1,
            cursor: "pointer",
            zIndex: 53,
            opacity: isMenuOpen ? 1 : 0,
            transform: isMenuOpen ? "scale(1)" : "scale(0.85)",
            transition:
              "opacity .35s ease .25s, transform .35s ease .25s, background .25s ease",
          }}
        >
          ×
        </button>

        {NAV_LINKS.map((label, i) => (
          <Link
            key={label}
            href={navHref(label)}
            onClick={() => setIsMenuOpen(false)}
            className="mobile-nav-link"
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#fff",
              textDecoration: "none",
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
              opacity: isMenuOpen ? 1 : 0,
              transform: isMenuOpen ? "translateY(0)" : "translateY(12px)",
              transition: `opacity .35s ease ${0.1 + i * 0.06}s, transform .35s ease ${
                0.1 + i * 0.06
              }s`,
            }}
          >
            {label}
          </Link>
        ))}

        {/* Mobile CTA */}
        <Link
          href="/contact#quote"
          onClick={() => setIsMenuOpen(false)}
          className="mobile-nav-cta"
          style={{
            marginTop: "1rem",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "#0b0b0d",
            background: "#fff",
            padding: "0.85rem 1.75rem",
            borderRadius: 999,
            textDecoration: "none",
            opacity: isMenuOpen ? 1 : 0,
            transform: isMenuOpen ? "translateY(0)" : "translateY(12px)",
            transition:
              "opacity .35s ease .45s, transform .35s ease .45s, background .25s ease",
          }}
        >
          Get Free Quote
        </Link>
      </div>

      <style jsx>{`
        .site-nav-link {
          position: relative;
        }
        .site-nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 0%;
          height: 2px;
          background: currentColor;
          transition: width 0.25s ease;
        }
        .site-nav-link:hover::after {
          width: 100%;
        }

        .site-nav-cta:hover {
          background: #2a2a2e !important;
          transform: translateY(-1px);
        }

        .site-nav-logo {
          width: clamp(200px, 66vw, 300px);
          height: auto;
        }

        @media (min-width: ${MOBILE_BREAKPOINT + 1}px) {
          .site-nav-logo {
            width: clamp(240px, 20vw, 460px);
          }
        }

        @media (max-width: ${MOBILE_BREAKPOINT}px) {
          .site-nav-links {
            display: none !important;
          }
          .site-nav-toggle {
            display: inline-flex !important;
          }
        }

        .site-nav-bar {
          position: absolute;
          left: 11px;
          right: 11px;
          height: 2.5px;
          background: #fff;
          border-radius: 2px;
          transition: transform 0.3s ease, opacity 0.3s ease, top 0.3s ease,
            background 0.35s ease;
        }
        .site-nav-toggle.scrolled .site-nav-bar {
          background: #0b0b0d;
        }
        .bar-1 {
          top: 13px;
        }
        .bar-2 {
          top: 20.5px;
        }
        .bar-3 {
          top: 28px;
        }
        .site-nav-bar.bar-1.open {
          top: 20.5px;
          transform: rotate(45deg);
        }
        .site-nav-bar.bar-2.open {
          opacity: 0;
        }
        .site-nav-bar.bar-3.open {
          top: 20.5px;
          transform: rotate(-45deg);
        }

        .mobile-nav-link:hover {
          opacity: 0.75 !important;
        }

        .mobile-nav-cta:hover {
          background: #e8e8e8 !important;
        }

        .mobile-nav-close:hover {
          background: rgba(255, 255, 255, 0.16) !important;
        }
      `}</style>
    </>
  );
}