/**
 * app/services/page.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * SERVICES OVERVIEW
 *
 * Main categories:
 *
 * 01. Construction
 * 02. Mechanical & Electrical
 * 03. Commercial
 *
 * Individual services are fetched dynamically from getAllServices().
 *
 * FIX: `Service.category` is a human label (e.g. "Mechanical & Electrical"),
 * while grouping/filtering by category needs the URL-safe key
 * (e.g. "mechanical-electrical"). Added `categorySlug` to the local type
 * and switched the grouping filter to use it — this is what was causing
 * every category section to render empty.
 *
 * FIX 2: getAllServices() from lib/services.ts is now async, and it returns
 * the nested API/DB shape (categoryName, hero.image, hero.description) —
 * not the flattened shape (category, image, shortDescription) this page's
 * card/hero components are built around. The previous `as Service[]` cast
 * hid that mismatch rather than fixing it. This page is now async and maps
 * each fetched service into the local display `Service` shape below.
 * -------------------------------------------------------------------------
 */

import Image from "next/image";
import Link from "next/link";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";

import { getAllServices, type Service as ApiService } from "@/lib/services";
import HeroScene from "@/components/HeroScene";
import ServicesCategoryNav, {
  type NavCategory,
} from "@/components/ServicesCategoryNav";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-archivo",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

/* =========================================================================
   TYPES
   ========================================================================= */

type Service = {
  slug: string;
  title: string;
  /** Human-readable category label, e.g. "Mechanical & Electrical" — for display. */
  category: string;
  /** URL-safe category key, e.g. "mechanical-electrical" — for grouping/filtering. */
  categorySlug: string;
  shortDescription?: string;

  image?: {
    url: string;
    alt?: string;
  };
};

type ServiceCategory = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
};

/* =========================================================================
   HELPERS
   ========================================================================= */

function formatCategory(category: string) {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/*
  Maps the nested Service shape returned by lib/services.ts (hero.image,
  hero.description, categoryName) into the flattened display shape this
  page's ServiceCard/HeroScene were built around (image, shortDescription,
  category). Keeping the mapping in one place means the rest of this file
  doesn't need to change if the API shape or the card's display shape
  changes independently later.
*/
function toDisplayService(service: ApiService): Service {
  return {
    slug: service.slug,
    title: service.title,
    category: service.categoryName,
    categorySlug: service.categorySlug,
    shortDescription: service.hero?.description
      ? service.hero.description.replace(/<[^>]*>/g, "")
      : undefined,
    image: service.hero?.image?.url
      ? {
          url: service.hero.image.url,
          alt: service.hero.image.alt,
        }
      : undefined,
  };
}

/* =========================================================================
   STATIC MAIN CATEGORIES
   ========================================================================= */

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    slug: "construction",
    eyebrow: "01",
    title: "Construction",
    description:
      "From new builds and extensions to conversions, refurbishments, kitchens, bathrooms and roofing.",
    cta: "Explore Construction",
  },

  {
    slug: "mechanical-electrical",
    eyebrow: "02",
    title: "Mechanical & Electrical",
    description:
      "Complete mechanical and electrical services covering plumbing, heating, gas, air conditioning and electrical systems.",
    cta: "Explore Mechanical & Electrical",
  },

  {
    slug: "commercial",
    eyebrow: "03",
    title: "Commercial",
    description:
      "Reliable maintenance and facilities support for hotels, commercial properties and managed buildings.",
    cta: "Explore Commercial",
  },
];

/* =========================================================================
   SERVICE CARD
   ========================================================================= */

function ServiceCard({
  service,
  index,
}: {
  service: Service;
  index: number;
}) {
  const serviceNumber = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/services/${service.slug}`}
      className="
        bsl-focus
        bsl-reveal
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[1.75rem]
        border
        border-[#1C1712]/[0.08]
        bg-white
        shadow-[0_8px_30px_rgba(28,23,18,0.04)]
        transition-all
        duration-500
        ease-out
        hover:-translate-y-2
        hover:border-[#A26028]/25
        hover:shadow-[0_30px_70px_-25px_rgba(28,23,18,0.24)]
      "
    >
      {/* ================================================================
          IMAGE
          ================================================================ */}

      <div className="relative aspect-[1.18/1] overflow-hidden bg-[#E9E1D7]">
        {service.image?.url ? (
          <Image
            src={service.image.url}
            alt={
              service.image.alt ||
              `${service.title} services by BSL Construction`
            }
            fill
            sizes="
              (min-width: 1024px) 33vw,
              (min-width: 640px) 50vw,
              100vw
            "
            priority={index < 3}
            className="
              object-cover
              transition-transform
              duration-1000
              ease-[cubic-bezier(0.2,0.65,0.3,0.9)]
              group-hover:scale-[1.07]
            "
          />
        ) : (
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-[#E9E1D7]
              via-[#DED3C6]
              to-[#CFC1B2]
            "
          />
        )}

        {/* Image shading */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-[#1C1712]/75
            via-[#1C1712]/5
            to-transparent
            opacity-90
          "
        />

        {/* Top technical label */}

        <div
          className="
            absolute
            left-5
            right-5
            top-5
            z-10
            flex
            items-center
            justify-between
          "
        >
          <span
            className="
              bsl-mono
              text-[0.58rem]
              font-medium
              uppercase
              tracking-[0.16em]
              text-white/75
              drop-shadow-sm
            "
          >
            {formatCategory(service.categorySlug)}
          </span>

          <span
            className="
              bsl-mono
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-white/25
              bg-black/20
              text-[0.62rem]
              font-medium
              text-white/90
              backdrop-blur-md
            "
          >
            {serviceNumber}
          </span>
        </div>

        {/* Bottom image label */}

        <div
          className="
            absolute
            bottom-5
            left-5
            right-5
            z-10
            flex
            items-end
            justify-between
            gap-4
          "
        >
          <span
            className="
              bsl-mono
              text-[0.58rem]
              uppercase
              tracking-[0.14em]
              text-white/55
            "
          >
            BSL Construction
          </span>

          <span
            className="
              bsl-mono
              text-[0.58rem]
              uppercase
              tracking-[0.14em]
              text-white/55
            "
          >
            0{index + 1}
          </span>
        </div>

        {/* Gold top accent */}

        <div
          aria-hidden="true"
          className="
            absolute
            inset-x-0
            top-0
            z-20
            h-[3px]
            origin-left
            scale-x-0
            bg-gradient-to-r
            from-[#A26028]
            via-[#E8C599]
            to-[#A26028]
            transition-transform
            duration-500
            ease-out
            group-hover:scale-x-100
          "
        />
      </div>

      {/* ================================================================
          CARD CONTENT
          ================================================================ */}

      <div
        className="
          relative
          flex
          flex-1
          flex-col
          px-6
          pb-6
          pt-7
          sm:px-7
          sm:pb-7
        "
      >
        {/* Small decorative rule */}

        <div
          aria-hidden="true"
          className="
            mb-5
            flex
            items-center
            gap-3
          "
        >
          <span
            className="
              h-px
              w-8
              bg-[#A26028]
              transition-all
              duration-500
              group-hover:w-14
            "
          />

          <span
            className="
              bsl-mono
              text-[0.56rem]
              uppercase
              tracking-[0.16em]
              text-[#3E4C51]/50
            "
          >
            Service
          </span>
        </div>

        {/* Title */}

        <h3
          className="
            bsl-serif
            max-w-[90%]
            text-[1.45rem]
            font-semibold
            leading-[1.12]
            tracking-[-0.02em]
            text-[#1C1712]
            transition-colors
            duration-300
            group-hover:text-[#8A5121]
            sm:text-[1.55rem]
          "
        >
          {service.title}
        </h3>

        {/* Description */}

        <p
          className="
            bsl-sans
            mt-4
            flex-1
            text-[0.91rem]
            leading-[1.75]
            text-[#6E6259]
          "
        >
          {service.shortDescription ||
            `Professional ${service.title.toLowerCase()} services delivered by BSL Construction.`}
        </p>

        {/* Bottom action */}

        <div
          className="
            mt-7
            flex
            items-center
            justify-between
            border-t
            border-[#1C1712]/[0.08]
            pt-5
          "
        >
          <span
            className="
              bsl-mono
              text-[0.62rem]
              font-medium
              uppercase
              tracking-[0.14em]
              text-[#3E4C51]/55
            "
          >
            View Service
          </span>

          <span
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-[#A26028]/25
              text-[#A26028]
              transition-all
              duration-300
              group-hover:border-[#A26028]
              group-hover:bg-[#A26028]
              group-hover:text-white
            "
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              className="
                transition-transform
                duration-300
                group-hover:translate-x-[2px]
              "
            >
              <path
                d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        {/* Corner architectural detail */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-0
            right-0
            h-14
            w-14
            overflow-hidden
          "
        >
          <div
            className="
              absolute
              bottom-0
              right-0
              h-px
              w-8
              bg-[#A26028]/25
            "
          />

          <div
            className="
              absolute
              bottom-0
              right-0
              h-8
              w-px
              bg-[#A26028]/25
            "
          />
        </div>
      </div>
    </Link>
  );
}

/* =========================================================================
   CATEGORY SECTION
   ========================================================================= */

function CategorySection({
  category,
  services,
}: {
  category: ServiceCategory;
  services: Service[];
}) {
  return (
    <section
      id={category.slug}
      aria-labelledby={`${category.slug}-heading`}
      className="
        scroll-mt-20
        border-t
        border-[#1C1712]/10
        py-16
        lg:py-24
      "
    >
      <div className="mx-auto max-w-[1180px]">
        {/* ==============================================================
            CATEGORY HEADER
            ============================================================== */}

        <div
          className="
            bsl-reveal
            mb-10
            grid
            gap-6
            lg:mb-14
            lg:grid-cols-[0.7fr_1.3fr]
            lg:items-end
          "
        >
          <div>
            <span
              className="
                bsl-mono
                mb-4
                inline-flex
                items-center
                gap-3
                text-[0.68rem]
                font-semibold
                uppercase
                tracking-[0.22em]
                text-[#A26028]
              "
            >
              <span className="text-[1rem] font-semibold">
                {category.eyebrow}
              </span>

              <span
                aria-hidden="true"
                className="h-px w-8 bg-[#A26028]/50"
              />

              Services
            </span>

            <h2
              id={`${category.slug}-heading`}
              className="
                bsl-serif
                max-w-xl
                text-[clamp(2rem,4vw,3rem)]
                font-semibold
                leading-[1.08]
                tracking-[-0.02em]
                text-[#1C1712]
              "
            >
              {category.title}
            </h2>
          </div>

          <div className="lg:justify-self-end lg:max-w-xl">
            <p
              className="
                bsl-sans
                text-[0.98rem]
                leading-[1.75]
                text-[#6E6259]
              "
            >
              {category.description}
            </p>
          </div>
        </div>

        {/* Category service count */}

        {services.length > 0 && (
          <div
            aria-hidden="true"
            className="mb-8 flex items-center gap-3"
          >
            <span className="h-2 w-px bg-[#3E4C51]/35" />

            <span className="h-px flex-1 bg-[#3E4C51]/15" />

            <span
              className="
                bsl-mono
                whitespace-nowrap
                text-[0.62rem]
                uppercase
                tracking-[0.16em]
                text-[#3E4C51]/60
              "
            >
              {services.length}{" "}
              {services.length === 1 ? "Service" : "Services"} Listed
            </span>
          </div>
        )}

        {/* ==============================================================
            DYNAMIC SERVICE CARDS
            ============================================================== */}

        {services.length > 0 ? (
          <div
            className="
              grid
              grid-cols-1
              gap-7
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            {services.map((service, index) => (
              <ServiceCard
                key={service.slug}
                service={service}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div
            className="
              rounded-[1.5rem]
              border
              border-dashed
              border-[#1C1712]/15
              bg-white/50
              px-6
              py-12
              text-center
            "
          >
            <p
              className="
                bsl-sans
                text-[0.9rem]
                text-[#6E6259]
              "
            >
              Services in this category will be available shortly.
            </p>
          </div>
        )}

        {/* ==============================================================
            CATEGORY CTA
            ============================================================== */}

        {services.length > 0 && (
          <div className="mt-10 flex justify-start lg:mt-12">
            <Link
              href={`/services/category/${category.slug}`}
              className="
                bsl-focus
                group
                inline-flex
                items-center
                gap-2
                text-[0.8rem]
                font-semibold
                uppercase
                tracking-[0.1em]
                text-[#A26028]
                transition-colors
                hover:text-[#8A5121]
              "
            >
              {category.cta}

              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-[4px]
                "
              >
                <path
                  d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================================
   MAIN PAGE
   ========================================================================= */

export default async function ServicesPage() {
  const apiServices = await getAllServices();
  const services: Service[] = apiServices.map(toDisplayService);

  /* =======================================================================
     GROUP SERVICES BY CATEGORY
     ======================================================================= */

  const servicesByCategory: Record<string, Service[]> =
    SERVICE_CATEGORIES.reduce(
      (acc, category) => {
        acc[category.slug] = services.filter(
          (service) => service.categorySlug === category.slug
        );

        return acc;
      },
      {} as Record<string, Service[]>
    );

  /* =======================================================================
     CATEGORY NAVIGATION DATA
     ======================================================================= */

  const navCategories: NavCategory[] = SERVICE_CATEGORIES.map(
    (category) => ({
      slug: category.slug,
      eyebrow: category.eyebrow,
      title: category.title,
      count: (servicesByCategory[category.slug] || []).length,
    })
  );

  return (
    <main
      className={`
        ${fraunces.variable}
        ${archivo.variable}
        ${plexMono.variable}
        bsl-sans
      `}
    >
      <style>{`
        .bsl-serif {
          font-family: var(--font-fraunces),
            'Iowan Old Style',
            'Palatino Linotype',
            Palatino,
            serif;
        }

        .bsl-sans {
          font-family: var(--font-archivo),
            Archivo,
            'Inter',
            system-ui,
            sans-serif;
        }

        .bsl-mono {
          font-family: var(--font-plex-mono),
            'IBM Plex Mono',
            ui-monospace,
            SFMono-Regular,
            monospace;
        }

        .bsl-gold-rule {
          background: linear-gradient(
            90deg,
            transparent,
            #E8C599 45%,
            #E8C599 55%,
            transparent
          );
        }

        .bsl-focus:focus-visible {
          outline: 2px solid #A26028;
          outline-offset: 3px;
          border-radius: 4px;
        }

        /*
         * Removed blueprint grid background from hero.
         * The hero now uses the photography + overlay only.
         */

        @media (prefers-reduced-motion: no-preference) {
          @supports (animation-timeline: view()) {
            .bsl-reveal {
              animation: bsl-rise linear both;
              animation-timeline: view();
              animation-range: entry 0% cover 30%;
            }
          }

          html {
            scroll-behavior: smooth;
          }
        }

        @keyframes bsl-rise {
          from {
            opacity: 0;
            transform: translateY(22px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* =================================================================
          HERO
          ================================================================= */}

      <header
        className="
          relative
          overflow-hidden
          px-5
          pb-16
          pt-32
          sm:px-8
          lg:px-10
          lg:pb-24
          lg:pt-40
        "
      >
        {/* Background image */}

        <Image
          src="/hero-services.avif"
          alt="Construction and property services by BSL Construction"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Overlay */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-b
            from-[#1C1712]/40
            via-[#1C1712]/20
            to-[#1C1712]/55
          "
        />

        {/* 3D Hero Scene */}

        <HeroScene
          services={services.map((service) => ({
            title: service.title,
            category: service.category,
          }))}
        />

        {/* Corner mark */}

        <svg
          aria-hidden="true"
          width="28"
          height="28"
          viewBox="0 0 22 22"
          fill="none"
          className="
            pointer-events-none
            absolute
            left-5
            top-24
            text-[#9DB4BA]/50
            sm:left-8
            lg:left-10
          "
        >
          <path
            d="M1 9V1H9"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>

        {/* Hero content */}

        <div className="relative mx-auto max-w-[1180px]">
          <span
            className="
              bsl-mono
              mb-4
              inline-flex
              items-center
              gap-2
              text-[0.72rem]
              font-medium
              uppercase
              tracking-[0.24em]
              text-[#E8C599]
            "
          >
            <span
              aria-hidden="true"
              className="h-px w-6 bg-[#E8C599]"
            />

            Our Services
          </span>

          <h1
            className="
              bsl-serif
              mb-6
              max-w-3xl
              text-[clamp(2.2rem,4.8vw,3.6rem)]
              font-semibold
              leading-[1.08]
              tracking-[-0.02em]
              text-white
            "
          >
            Construction, mechanical &amp; electrical, and commercial
            services —{" "}
            <span className="italic text-[#E8C599]">
              all under one roof.
            </span>
          </h1>

          {/* Dimension line */}

          <div
            aria-hidden="true"
            className="mb-8 flex items-center gap-2.5"
          >
            <span className="h-2 w-px bg-[#E8C599]/70" />

            <span className="bsl-gold-rule h-px w-20" />

            <span className="h-2 w-px bg-[#E8C599]/70" />

            <span
              className="
                bsl-mono
                whitespace-nowrap
                text-[0.62rem]
                uppercase
                tracking-[0.18em]
                text-[#E8C599]/70
              "
            >
              {services.length} Services · 3 Disciplines
            </span>
          </div>

          <p
            className="
              bsl-sans
              max-w-2xl
              text-[clamp(0.98rem,1.4vw,1.1rem)]
              leading-[1.75]
              text-white/75
            "
          >
            From new builds and extensions to mechanical and electrical
            services and ongoing commercial maintenance, BSL Construction
            provides professionally managed services delivered by one
            experienced team.
          </p>

          {/* ==============================================================
              TITLE BLOCK
              ============================================================== */}

          <div
            className="
              mt-10
              inline-block
              max-w-full
              overflow-hidden
              rounded-[6px]
              border
              border-white/15
              bg-[#1C1712]/50
              backdrop-blur-md
            "
          >
            <dl className="grid grid-cols-3 divide-x divide-white/10">
              <div className="px-3 py-4 sm:px-7 sm:py-5">
                <dt
                  className="
                    bsl-mono
                    text-[0.58rem]
                    font-medium
                    uppercase
                    tracking-[0.14em]
                    text-[#E8C599]/70
                  "
                >
                  Categories
                </dt>

                <dd
                  className="
                    bsl-serif
                    mt-1.5
                    text-[1.3rem]
                    font-semibold
                    text-white
                    sm:text-[1.5rem]
                  "
                >
                  03
                </dd>
              </div>

              <div className="px-3 py-4 sm:px-7 sm:py-5">
                <dt
                  className="
                    bsl-mono
                    text-[0.58rem]
                    font-medium
                    uppercase
                    tracking-[0.14em]
                    text-[#E8C599]/70
                  "
                >
                  Services
                </dt>

                <dd
                  className="
                    bsl-serif
                    mt-1.5
                    text-[1.3rem]
                    font-semibold
                    text-white
                    sm:text-[1.5rem]
                  "
                >
                  {services.length}
                </dd>
              </div>

              <div className="px-3 py-4 sm:px-7 sm:py-5">
                <dt
                  className="
                    bsl-mono
                    text-[0.58rem]
                    font-medium
                    uppercase
                    tracking-[0.14em]
                    text-[#E8C599]/70
                  "
                >
                  Delivery
                </dt>

                <dd
                  className="
                    bsl-serif
                    mt-1.5
                    text-[1.3rem]
                    font-semibold
                    text-white
                    sm:text-[1.5rem]
                  "
                >
                  One Team
                </dd>
              </div>
            </dl>

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                border-t
                border-white/10
                bg-white/[0.04]
                px-3
                py-2.5
                sm:px-7
              "
            >
              <span
                className="
                  bsl-mono
                  truncate
                  text-[0.56rem]
                  uppercase
                  tracking-[0.14em]
                  text-white/40
                "
              >
                BSL Construction
              </span>

              <span
                className="
                  bsl-mono
                  whitespace-nowrap
                  text-[0.56rem]
                  uppercase
                  tracking-[0.14em]
                  text-white/40
                "
              >
                Services Overview
              </span>
            </div>
          </div>
        </div>

        {/* Bottom corner */}

        <svg
          aria-hidden="true"
          width="28"
          height="28"
          viewBox="0 0 22 22"
          fill="none"
          className="
            pointer-events-none
            absolute
            bottom-8
            right-5
            text-[#9DB4BA]/50
            sm:right-8
            lg:right-10
          "
        >
          <path
            d="M21 13V21H13"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </header>

      {/* =================================================================
          CATEGORY NAVIGATION
          ================================================================= */}

      <nav
        aria-label="Service categories"
        className="
          sticky
          top-0
          z-30
          border-b
          border-[#1C1712]/10
          bg-[#FAF7F2]/95
          backdrop-blur-md
        "
      >
        <ServicesCategoryNav categories={navCategories} />
      </nav>

      {/* =================================================================
          SERVICES BY CATEGORY
          ================================================================= */}

      <div
        className="
          bg-[#FAF7F2]
          px-5
          sm:px-8
          lg:px-10
        "
      >
        {SERVICE_CATEGORIES.map((category) => (
          <CategorySection
            key={category.slug}
            category={category}
            services={servicesByCategory[category.slug] || []}
          />
        ))}
      </div>

      {/* =================================================================
          CLOSING CTA
          ================================================================= */}

      <section
        className="
          bg-white
          px-5
          py-14
          sm:px-8
          lg:px-10
          lg:py-16
        "
      >
        <div
          className="
            relative
            mx-auto
            flex
            max-w-[1180px]
            flex-col
            items-start
            gap-7
            overflow-hidden
            rounded-[28px]
            bg-[#1C1712]
            px-7
            py-10
            sm:px-10
            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:px-14
            lg:py-14
          "
        >
          {/* Corner marks */}

          <svg
            aria-hidden="true"
            width="26"
            height="26"
            viewBox="0 0 22 22"
            fill="none"
            className="
              absolute
              left-6
              top-6
              text-[#9DB4BA]/50
            "
          >
            <path
              d="M1 9V1H9"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>

          <svg
            aria-hidden="true"
            width="26"
            height="26"
            viewBox="0 0 22 22"
            fill="none"
            className="
              absolute
              bottom-6
              right-6
              text-[#9DB4BA]/50
            "
          >
            <path
              d="M21 13V21H13"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>

          <div className="max-w-xl">
            <span
              className="
                bsl-mono
                mb-3
                inline-flex
                items-center
                gap-2
                text-[0.68rem]
                font-medium
                uppercase
                tracking-[0.24em]
                text-[#E8C599]
              "
            >
              Need help choosing?
            </span>

            <h2
              className="
                bsl-serif
                mb-3
                text-[clamp(1.5rem,2.8vw,2.1rem)]
                font-semibold
                leading-tight
                text-white
              "
            >
              Not sure which service your project needs?
            </h2>

            <p
              className="
                bsl-sans
                text-[0.95rem]
                leading-[1.65]
                text-white/65
              "
            >
              Tell us what you&apos;re planning and our team can help you
              understand the right approach, the services involved and the
              best way to move your project forward.
            </p>
          </div>

          <Link
            href="/contact#quote"
            className="
              bsl-focus
              group
              inline-flex
              shrink-0
              items-center
              gap-2
              rounded-full
              bg-[#A26028]
              px-7
              py-3.5
              text-[0.88rem]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-white
              transition-all
              duration-200
              ease-out
              hover:-translate-y-0.5
              hover:bg-[#8A5121]
            "
          >
            Talk to the Team

            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              className="
                transition-transform
                duration-200
                ease-out
                group-hover:translate-x-[3px]
              "
            >
              <path
                d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}