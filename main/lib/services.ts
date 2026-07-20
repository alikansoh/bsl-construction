// lib/services.ts
// -----------------------------------------------------------------------
// Single source of truth for service content. Both /services and
// /services/[slug] read from data/services.json through this file —
// add or edit a service by editing the JSON, not the page components.
//
// CHANGED: added an optional `gallery: ServiceImage[]` field, mirroring
// the admin panel's "Gallery" tab — a service can carry an ordered list
// of extra photos shown in a slider on the detail page. `gallery` is
// optional in the JSON; services that omit it simply don't render a
// gallery section (see `hasGallery` in the page component). Normalization
// happens once here, in `publishedServices()`, so every consumer of this
// module always gets a real array back, never `undefined`.
// -----------------------------------------------------------------------

import servicesData from "@/data/services.json";

export type ServiceFaq = {
  question: string;
  answer: string;
};

export type ServiceImage = {
  url: string;
  alt: string;
};

export type ServiceSection = {
  id: string;
  heading: string;
  body: string;
  image: ServiceImage | null;
};

export type ServiceProcessStep = {
  step: number;
  title: string;
  description: string;
};

export type ServiceSeo = {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
};

export type Service = {
  slug: string;
  title: string;
  category: string;
  shortDescription: string;

  status: "published" | "draft";
  featured: boolean;
  displayOrder: number;

  image: ServiceImage;
  gallery: ServiceImage[];
  sections: ServiceSection[];
  highlights: string[];
  process: ServiceProcessStep[];
  faqs: ServiceFaq[];
  areas: string[];
  seo: ServiceSeo;
};

// The shape actually on disk — `gallery` (and a few list fields) may be
// omitted for services that don't use them, so we type the raw JSON as
// partial on those fields and fill in defaults in `publishedServices()`.
type RawService = Omit<Service, "gallery" | "highlights" | "process" | "faqs" | "areas"> & {
  gallery?: ServiceImage[];
  highlights?: string[];
  process?: ServiceProcessStep[];
  faqs?: ServiceFaq[];
  areas?: string[];
};

const rawServices = servicesData.services as unknown as RawService[];

/** Published services only, normalized and sorted for display. */
function publishedServices(): Service[] {
  return rawServices
    .filter((s) => s.status === "published")
    .map((s) => ({
      ...s,
      gallery: s.gallery ?? [],
      highlights: s.highlights ?? [],
      process: s.process ?? [],
      faqs: s.faqs ?? [],
      areas: s.areas ?? [],
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/** The single pinned/featured service shown at the top of /services. */
export function getFeaturedService(): Service {
  const featured = publishedServices().find((s) => s.featured);
  if (!featured) {
    throw new Error(
      "No published service in data/services.json has \"featured\": true — exactly one is required."
    );
  }
  return featured;
}

/** Every other service, in displayOrder, for the dynamic grid below the featured one. */
export function getOtherServices(): Service[] {
  return publishedServices().filter((s) => !s.featured);
}

/** All published services, featured included — used for generateStaticParams. */
export function getAllServices(): Service[] {
  return publishedServices();
}

export function getServiceBySlug(slug: string): Service | undefined {
  return publishedServices().find((s) => s.slug === slug);
}