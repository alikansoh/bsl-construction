"use client";

/**
 * Nav.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Standalone transparent nav bar. Renders once near the root of your layout,
 * above <Hero />. See the data-hero-root observer notes throughout.
 *
 * Mobile fixes in this pass:
 * - Logo is much bigger on every breakpoint. Sized with a width-based clamp
 *   (not the old flat height clamp) so it scales smoothly and predictably,
 *   and was checked to still fit next to the hamburger button down to a
 *   320px-wide screen without overflowing.
 * - Mobile menu's top padding now scales with the taller nav bar instead of
 *   a fixed 7rem, so links never sit under/behind the (now bigger) nav.
 * - Fixed an invalid `borderRadius` declaration inside the plain-CSS
 *   styled-jsx block (had to be `border-radius`) — it was silently being
 *   dropped, so the hamburger bars never actually got rounded corners.
 * -------------------------------------------------------------------------
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = ["Home", "About", "Services", "Contact Us"];

const HERO_SELECTOR = "[data-hero-root]";
const FALLBACK_SCROLL_TRIGGER = 24;
const MOBILE_BREAKPOINT = 768;

function navHref(label: string) {
  return label === "Home" ? "/" : `/${label.toLowerCase().replace(" ", "-")}`;
}

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Observe hero bottom edge to decide when to apply the nav background.
  useEffect(() => {
    let ticking = false;

    const update = () => {
      const heroEl = document.querySelector<HTMLElement>(HERO_SELECTOR);
      if (heroEl) {
        const heroBottom = heroEl.getBoundingClientRect().bottom;
        setIsScrolled(heroBottom <= 0);
      } else {
        setIsScrolled(window.scrollY > FALLBACK_SCROLL_TRIGGER);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Lock background scroll while mobile menu is open.
  // Auto-close menu when returning to desktop width.
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
          background: showBackground
            ? "rgba(11,11,13,0.88)"
            : "transparent",
          backdropFilter: showBackground ? "blur(12px)" : "none",
          WebkitBackdropFilter: showBackground ? "blur(12px)" : "none",
          borderBottom: showBackground
            ? "1px solid rgba(255,255,255,0.10)"
            : "1px solid transparent",
          transition:
            "background .35s ease, backdrop-filter .35s ease, border-color .35s ease",
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
            zIndex: 52, // sits above the mobile panel if needed
          }}
        >
          <Image
            src="/logo.png"
            alt="BSL Construction"
            width={100}
            height={50}
            priority
            className="site-nav-logo"
            style={{
              filter: "drop-shadow(0 2px 12px rgba(0,0,0,.55))",
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
                color: "#fff",
                textDecoration: "none",
                textShadow: "0 2px 10px rgba(0,0,0,.45)",
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Hamburger toggle */}
        <button
          type="button"
          className="site-nav-toggle"
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
            background: isMenuOpen
              ? "rgba(255,255,255,0.12)"
              : "rgba(255,255,255,0.06)",
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
            transition: "opacity .35s ease .25s, transform .35s ease .25s, background .25s ease",
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

        {/* Optional mobile CTA */}
        <a
          href="tel:+1234567890"
          onClick={() => setIsMenuOpen(false)}
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
          Call Us Now
        </a>
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
          background: #fff;
          transition: width 0.25s ease;
        }
        .site-nav-link:hover::after {
          width: 100%;
        }

        /* Logo: width-driven clamp (height follows automatically via the
           image's intrinsic aspect ratio) so it scales predictably instead
           of being squeezed down to a flat minimum on most phone widths
           like the old height-based clamp was. Bounds were checked against
           a 320px-wide viewport so it never collides with the hamburger
           button. */
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
          transition: transform 0.3s ease, opacity 0.3s ease, top 0.3s ease;
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

        .mobile-nav-close:hover {
          background: rgba(255,255,255,0.16) !important;
        }
      `}</style>
    </>
  );
}