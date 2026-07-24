"use client";

/**
 * Navbar.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Transparent while the Hero's scroll-scrub video is still pinned/progressing.
 * Switches to a solid white background only once the hero's scroll runway
 * has been fully consumed (progress bar finished) and the page starts
 * actually scrolling past the hero.
 *
 * The "Services" nav item is a mega-menu dropdown (desktop: hover/focus,
 * mobile: accordion) populated from GET /api/services and grouped into
 * the 3 fixed service categories.
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const NAV_LINKS = ["Home", "About", "Services", "Projects", "Contact Us"];

const MOBILE_BREAKPOINT = 768;

// Small buffer so the switch feels intentional rather than firing at the
// exact last pixel of the hero runway.
const SCROLL_TRIGGER_BUFFER = 0;

function navHref(label: string) {
  return label === "Home" ? "/" : `/${label.toLowerCase().replace(" ", "-")}`;
}

/* ----------------------------------------------------------------------- */
/* Services data                                                           */
/* ----------------------------------------------------------------------- */

interface NavService {
  slug: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  displayOrder: number;
}

interface RawNavService {
  slug?: string;
  title?: string;
  categorySlug?: string;
  categoryName?: string;
  status?: string;
  displayOrder?: number;
}

interface ServicesListResponse {
  success: boolean;
  services?: RawNavService[];
}

interface ServiceCategoryGroup {
  slug: string;
  name: string;
  services: NavService[];
}

// Fixed category order — mirrors the service editor's CATEGORIES list, so
// the dropdown always presents categories in the same order regardless of
// which ones currently have services.
const CATEGORY_ORDER: { slug: string; name: string }[] = [
  { slug: "construction", name: "Construction" },
  { slug: "mechanical-electrical", name: "Mechanical & Electrical" },
  { slug: "commercial", name: "Commercial" },
];

function groupServicesByCategory(services: NavService[]): ServiceCategoryGroup[] {
  const knownSlugs = new Set(CATEGORY_ORDER.map((category) => category.slug));

  const groups = CATEGORY_ORDER.map((category) => ({
    ...category,
    services: services.filter(
      (service) => service.categorySlug === category.slug,
    ),
  })).filter((group) => group.services.length > 0);

  // Anything with a category slug that doesn't match one of the 3 known
  // categories still gets shown, rather than silently disappearing.
  const orphaned = services.filter(
    (service) => !knownSlugs.has(service.categorySlug),
  );

  if (orphaned.length > 0) {
    groups.push({
      slug: "other",
      name: orphaned[0]?.categoryName || "Other",
      services: orphaned,
    });
  }

  return groups;
}

function serviceHref(service: NavService) {
  return `/services/${service.slug}`;
}

/* ----------------------------------------------------------------------- */
/* Nav                                                                      */
/* ----------------------------------------------------------------------- */

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [openMobileCategories, setOpenMobileCategories] = useState<
    Record<string, boolean>
  >({});
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [services, setServices] = useState<NavService[]>([]);
  const servicesCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const serviceGroups = useMemo(
    () => groupServicesByCategory(services),
    [services],
  );

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setIsMobileServicesOpen(false);
    setOpenMobileCategories({});
  };

  const toggleMobileMenu = () => {
    if (isMenuOpen) {
      closeMobileMenu();
    } else {
      setIsMenuOpen(true);
    }
  };

  const toggleMobileCategory = (slug: string) => {
    setOpenMobileCategories((current) => ({
      ...current,
      [slug]: !current[slug],
    }));
  };

  // Fetch the published services list once on mount for the dropdown.
  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      try {
        const response = await fetch("/api/services", {
          method: "GET",
          cache: "no-store",
        });

        const data: ServicesListResponse = await response.json();

        if (!response.ok || !data.success || !Array.isArray(data.services)) {
          return;
        }

        const published = data.services
          .filter((service) => service.status === "published" && service.slug)
          .map((service) => ({
            slug: service.slug as string,
            title: service.title ?? "",
            categorySlug: service.categorySlug ?? "",
            categoryName: service.categoryName ?? "",
            displayOrder: Number(service.displayOrder) || 0,
          }))
          .sort((a, b) => a.displayOrder - b.displayOrder);

        if (!cancelled) {
          setServices(published);
        }
      } catch {
        // Silently ignore — the nav falls back to a plain "Services" link.
      }
    }

    loadServices();

    return () => {
      cancelled = true;
    };
  }, []);

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
      if (window.innerWidth > MOBILE_BREAKPOINT) closeMobileMenu();
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
      if (e.key === "Escape") {
        closeMobileMenu();
        setIsServicesOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isMenuOpen]);

  // Clear any pending close timer on unmount.
  useEffect(() => {
    return () => {
      if (servicesCloseTimer.current) {
        clearTimeout(servicesCloseTimer.current);
      }
    };
  }, []);

  const openServicesMenu = () => {
    if (servicesCloseTimer.current) {
      clearTimeout(servicesCloseTimer.current);
      servicesCloseTimer.current = null;
    }
    setIsServicesOpen(true);
  };

  const scheduleCloseServicesMenu = () => {
    servicesCloseTimer.current = setTimeout(() => {
      setIsServicesOpen(false);
    }, 120);
  };

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
          onClick={closeMobileMenu}
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
          {NAV_LINKS.map((label) => {
            if (label === "Services") {
              return (
                <div
                  key={label}
                  className="site-nav-services"
                  onMouseEnter={openServicesMenu}
                  onMouseLeave={scheduleCloseServicesMenu}
                  onFocus={openServicesMenu}
                  onBlur={scheduleCloseServicesMenu}
                  style={{ position: "relative" }}
                >
                  <Link
                    href={navHref(label)}
                    className="site-nav-link"
                    aria-haspopup="true"
                    aria-expanded={isServicesOpen}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
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
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      aria-hidden="true"
                      style={{
                        transform: isServicesOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform .2s ease",
                      }}
                    >
                      <path
                        d="M1.5 3.5L5 7L8.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>

                  {serviceGroups.length > 0 && (
                    <div
                      className="site-nav-services-panel"
                      style={{
                        position: "absolute",
                        top: "calc(100% + 0.75rem)",
                        left: "50%",
                        transform: `translateX(-50%) translateY(${
                          isServicesOpen ? "0" : "6px"
                        })`,
                        display: "flex",
                        alignItems: "flex-start",
                        maxWidth: "calc(100vw - 2.5rem)",
                        background: "#ffffff",
                        borderRadius: 14,
                        boxShadow: "0 16px 40px rgba(0,0,0,0.16)",
                        padding: "1.5rem",
                        opacity: isServicesOpen ? 1 : 0,
                        visibility: isServicesOpen ? "visible" : "hidden",
                        pointerEvents: isServicesOpen ? "auto" : "none",
                        transition:
                          "opacity .18s ease, transform .18s ease, visibility .18s",
                      }}
                    >
                      {serviceGroups.map((group, index) => (
                        <div
                          key={group.slug}
                          className="site-nav-services-column"
                          style={{
                            minWidth: 210,
                            padding: index === 0 ? "0 1.5rem 0 0" : "0 1.5rem",
                            borderLeft:
                              index === 0
                                ? "none"
                                : "1px solid rgba(11,11,13,0.08)",
                          }}
                        >
                          <p
                            style={{
                              margin: "0 0 0.75rem",
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: "#D98E1F",
                            }}
                          >
                            {group.name}
                          </p>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.15rem",
                            }}
                          >
                            {group.services.map((service) => (
                              <Link
                                key={service.slug}
                                href={serviceHref(service)}
                                onClick={() => setIsServicesOpen(false)}
                                className="site-nav-services-item"
                                style={{
                                  display: "block",
                                  padding: "0.5rem 0.6rem",
                                  borderRadius: 8,
                                  fontSize: "0.88rem",
                                  fontWeight: 500,
                                  color: "#1c2024",
                                  textDecoration: "none",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {service.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
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
            );
          })}

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
          onClick={toggleMobileMenu}
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
          overflowY: "auto",
        }}
      >
        {/* Close X */}
        <button
          type="button"
          className="mobile-nav-close"
          aria-label="Close menu"
          onClick={closeMobileMenu}
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

        {NAV_LINKS.map((label, i) => {
          if (label === "Services") {
            return (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.9rem",
                  width: "100%",
                  opacity: isMenuOpen ? 1 : 0,
                  transform: isMenuOpen ? "translateY(0)" : "translateY(12px)",
                  transition: `opacity .35s ease ${0.1 + i * 0.06}s, transform .35s ease ${
                    0.1 + i * 0.06
                  }s`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsMobileServicesOpen((open) => !open)}
                  className="mobile-nav-link"
                  aria-expanded={isMobileServicesOpen}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "-0.01em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  {label}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 10 10"
                    aria-hidden="true"
                    style={{
                      transform: isMobileServicesOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform .2s ease",
                    }}
                  >
                    <path
                      d="M1.5 3.5L5 7L8.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isMobileServicesOpen && serviceGroups.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.5rem",
                      width: "100%",
                      maxWidth: 320,
                    }}
                  >
                    {serviceGroups.map((group) => {
                      const isCategoryOpen =
                        openMobileCategories[group.slug] ?? true;

                      return (
                        <div
                          key={group.slug}
                          style={{
                            width: "100%",
                            borderTop: "1px solid rgba(255,255,255,0.1)",
                            paddingTop: "0.6rem",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => toggleMobileCategory(group.slug)}
                            aria-expanded={isCategoryOpen}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.4rem",
                              width: "100%",
                              background: "none",
                              border: "none",
                              padding: "0.2rem 0",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: "#D98E1F",
                              cursor: "pointer",
                            }}
                          >
                            {group.name}
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 10 10"
                              aria-hidden="true"
                              style={{
                                transform: isCategoryOpen
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                                transition: "transform .2s ease",
                              }}
                            >
                              <path
                                d="M1.5 3.5L5 7L8.5 3.5"
                                stroke="currentColor"
                                strokeWidth="1.4"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          {isCategoryOpen && (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "0.55rem",
                                padding: "0.6rem 0 0.4rem",
                              }}
                            >
                              {group.services.map((service) => (
                                <Link
                                  key={service.slug}
                                  href={serviceHref(service)}
                                  onClick={closeMobileMenu}
                                  style={{
                                    fontSize: "1rem",
                                    fontWeight: 500,
                                    color: "rgba(255,255,255,0.8)",
                                    textDecoration: "none",
                                  }}
                                >
                                  {service.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={label}
              href={navHref(label)}
              onClick={closeMobileMenu}
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
          );
        })}

        {/* Mobile CTA */}
        <Link
          href="/contact#quote"
          onClick={closeMobileMenu}
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

        .site-nav-services-item:hover {
          background: rgba(11, 11, 13, 0.06);
        }

        .site-nav-services-column:first-child {
          padding-left: 0;
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