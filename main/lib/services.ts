// lib/services.ts

import servicesData from "@/data/services.json";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ServiceImage = {
  url: string;
  alt: string;
};

export type ServiceCtaLink = {
  label: string;
  href: string;
};

export type ServiceSection = {
  id: string;
  heading: string;
  body: string;
  image?: ServiceImage;

  /** "image-left" | "image-right" */
  layout?: string;

  /** Per-section CTA */
  cta?: ServiceCtaLink;
};

export type ServiceFaq = {
  question: string;
  answer: string;
};

export type ServiceProcessStep = {
  step: number;
  title: string;
  description: string;
};

export type ServiceCta = {
  title: string;
  content: string;
  buttonLabel: string;
  buttonHref: string;
};

export type WhatsIncluded = {
  title: string;
  intro?: string;
  items: string[];
};

export type AreasCovered = {
  title: string;
  description: string;
  areas: string[];
};

export type TrustBarItem = {
  id: string;
  label: string;
};

/* -------------------------------------------------------------------------- */
/* Service Type                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Internal service types used by the service detail page.
 *
 * These are NOT stored separately in services.json.
 * They are automatically calculated from category/categorySlug.
 */
export type ServiceType =
  | "construction"
  | "trade"
  | "property";

/* -------------------------------------------------------------------------- */
/* Service                                                                    */
/* -------------------------------------------------------------------------- */

export type Service = {
  id: string;
  slug: string;
  title: string;

  /**
   * Human-readable category.
   *
   * Example:
   * "Design & Build"
   * "Mechanical & Electrical"
   * "Property Maintenance"
   */
  category: string;

  /**
   * URL-safe category key.
   *
   * Example:
   * "design-build"
   * "mechanical-electrical"
   * "property-maintenance"
   */
  categorySlug: string;

  /**
   * Automatically derived from category/categorySlug.
   *
   * This is NOT required in services.json.
   */
  serviceType: ServiceType;

  shortDescription: string;

  image: ServiceImage;

  primaryCta?: ServiceCtaLink;

  secondaryCta?: ServiceCtaLink;

  sections: ServiceSection[];

  whatsIncluded?: WhatsIncluded;

  areasCovered?: AreasCovered;

  gallery: ServiceImage[];

  process: ServiceProcessStep[];

  processTitle?: string;

  processDescription?: string;

  faqs: ServiceFaq[];

  cta?: ServiceCta;

  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
};

/* -------------------------------------------------------------------------- */
/* Raw JSON Type                                                              */
/* -------------------------------------------------------------------------- */

type RawService = (typeof servicesData.services)[number];

/* -------------------------------------------------------------------------- */
/* Service Type Resolver                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Automatically determines the service type from category/categorySlug.
 *
 * You do NOT need to add:
 *
 * serviceType: "construction"
 *
 * to services.json.
 *
 * The logic is:
 *
 * Design & Build
 * New Builds
 * Extensions
 * Refurbishments
 * Renovations
 * Loft Conversions
 * etc.
 *              -> construction
 *
 * Mechanical & Electrical
 * Plumbing
 * Electrical
 * Heating
 * etc.
 *              -> trade
 *
 * Property Maintenance
 * Property Management
 * Landlord Services
 * etc.
 *              -> property
 *
 * Anything not explicitly matched defaults to "trade".
 */
function getServiceType(
  category: string,
  categorySlug: string
): ServiceType {
  const categoryText =
    `${category} ${categorySlug}`.toLowerCase();

  /* ------------------------------------------------------------------------ */
  /* Construction                                                             */
  /* ------------------------------------------------------------------------ */

  const constructionKeywords = [
    "construction",
    "design-build",
    "design build",
    "new-build",
    "new build",
    "extension",
    "extensions",
    "refurbishment",
    "refurbishments",
    "renovation",
    "renovations",
    "loft-conversion",
    "loft conversions",
    "loft conversion",
    "basement",
    "groundwork",
    "structural",
    "development",
    "developments",
  ];

  if (
    constructionKeywords.some((keyword) =>
      categoryText.includes(keyword)
    )
  ) {
    return "construction";
  }

  /* ------------------------------------------------------------------------ */
  /* Property                                                                 */
  /* ------------------------------------------------------------------------ */

  const propertyKeywords = [
    "property",
    "property-maintenance",
    "property maintenance",
    "property-management",
    "property management",
    "landlord",
    "landlords",
    "letting",
    "lettings",
    "facilities",
    "facility",
    "estate-management",
    "estate management",
  ];

  if (
    propertyKeywords.some((keyword) =>
      categoryText.includes(keyword)
    )
  ) {
    return "property";
  }

  /* ------------------------------------------------------------------------ */
  /* Trade                                                                    */
  /* ------------------------------------------------------------------------ */

  const tradeKeywords = [
    "trade",
    "mechanical",
    "electrical",
    "mechanical-electrical",
    "mechanical & electrical",
    "plumbing",
    "electrical",
    "heating",
    "hvac",
    "roofing",
    "carpentry",
    "joinery",
    "painting",
    "decorating",
    "brickwork",
    "plastering",
    "tiling",
    "flooring",
    "kitchen",
    "bathroom",
  ];

  if (
    tradeKeywords.some((keyword) =>
      categoryText.includes(keyword)
    )
  ) {
    return "trade";
  }

  /* ------------------------------------------------------------------------ */
  /* Default                                                                  */
  /* ------------------------------------------------------------------------ */

  return "trade";
}

/* -------------------------------------------------------------------------- */
/* Normalize Service                                                          */
/* -------------------------------------------------------------------------- */

function normalizeService(
  raw: RawService
): Service {
  /* ------------------------------------------------------------------------ */
  /* Sections                                                                 */
  /* ------------------------------------------------------------------------ */

  const sections: ServiceSection[] = (
    raw.sections ?? []
  ).map((sec) => ({
    id: sec.id,
    heading: sec.title,
    body: sec.content,
    image: sec.image,
    layout: sec.layout,
    cta: sec.cta,
  }));

  /* ------------------------------------------------------------------------ */
  /* Category                                                                 */
  /* ------------------------------------------------------------------------ */

  const category = raw.categoryName;

  const categorySlug = raw.categorySlug;

  /* ------------------------------------------------------------------------ */
  /* Automatically calculate service type                                     */
  /* ------------------------------------------------------------------------ */

  const serviceType = getServiceType(
    category,
    categorySlug
  );

  /* ------------------------------------------------------------------------ */
  /* Return normalized service                                                */
  /* ------------------------------------------------------------------------ */

  return {
    id: raw.id,

    slug: raw.slug,

    title: raw.title,

    category,

    categorySlug,

    serviceType,

    shortDescription:
      raw.hero.description ||
      raw.hero.subtitle,

    image: raw.hero.image,

    primaryCta:
      raw.hero.primaryCta,

    secondaryCta:
      raw.hero.secondaryCta,

    sections,

    whatsIncluded:
      raw.whatsIncluded,

    areasCovered:
      raw.areasCovered,

    gallery:
      raw.gallery ?? [],

    process:
      (raw.process?.steps ?? []).map(
        (step) => ({
          step: step.step,
          title: step.title,
          description: step.content,
        })
      ),

    processTitle:
      raw.process?.title,

    processDescription:
      raw.process?.description,

    faqs:
      raw.faqs ?? [],

    cta:
      raw.cta,

    seo:
      raw.seo,
  };
}

/* -------------------------------------------------------------------------- */
/* Get All Services                                                           */
/* -------------------------------------------------------------------------- */

export function getAllServices(): Service[] {
  return servicesData.services
    .filter(
      (service) =>
        service.status === "published"
    )
    .sort(
      (a, b) =>
        a.displayOrder -
        b.displayOrder
    )
    .map(normalizeService);
}

/* -------------------------------------------------------------------------- */
/* Get Service By Slug                                                        */
/* -------------------------------------------------------------------------- */

export function getServiceBySlug(
  slug: string
): Service | undefined {
  const raw =
    servicesData.services.find(
      (service) =>
        service.slug === slug &&
        service.status === "published"
    );

  return raw
    ? normalizeService(raw)
    : undefined;
}

/* -------------------------------------------------------------------------- */
/* Get Services By Category                                                   */
/* -------------------------------------------------------------------------- */

export function getServicesByCategorySlug(
  categorySlug: string
): Service[] {
  return getAllServices().filter(
    (service) =>
      service.categorySlug ===
      categorySlug
  );
}

/* -------------------------------------------------------------------------- */
/* Get Services By Type                                                       */
/* -------------------------------------------------------------------------- */

export function getServicesByType(
  serviceType: ServiceType
): Service[] {
  return getAllServices().filter(
    (service) =>
      service.serviceType ===
      serviceType
  );
}

/* -------------------------------------------------------------------------- */
/* Get Trust Bar                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Site-wide trust bar.
 *
 * Example:
 * Professional Team
 * Fully Insured
 * Clear Pricing
 */
export function getTrustBar(): TrustBarItem[] {
  return servicesData.trustBar ?? [];
}