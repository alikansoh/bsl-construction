// lib/services.ts
// -----------------------------------------------------------------------
// Single source of truth for service content. Both /services and
// /services/[slug] read from data/services.json through this file —
// add or edit a service by editing the JSON, not the page components.
//
// CHANGED: added `faqs` to the Service type. Every service in
// data/services.json now carries its own FAQ set, rendered by
// <ServiceFaqAccordion /> on the detail page — add a 14th service with a
// `faqs` array and its FAQ section (and FAQPage schema) work automatically.
// -----------------------------------------------------------------------

import servicesData from "@/data/services.json";

export type ServiceFaq = {
  question: string;
  answer: string;
};

export type Service = {
  slug: string;
  featured: boolean;
  title: string;
  category: string;
  shortDescription: string;
  description: string[];
  image: string;
  imageAlt: string;
  highlights: string[];
  faqs: ServiceFaq[];
};

const services = servicesData.services as Service[];

/** The single pinned/featured service shown at the top of /services. */
export function getFeaturedService(): Service {
  const featured = services.find((s) => s.featured);
  if (!featured) {
    throw new Error(
      "No service in data/services.json has \"featured\": true — exactly one is required."
    );
  }
  return featured;
}

/** Every other service, in JSON order, for the dynamic grid below the featured one. */
export function getOtherServices(): Service[] {
  return services.filter((s) => !s.featured);
}

/** All services, featured included — used for generateStaticParams. */
export function getAllServices(): Service[] {
  return services;
}

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}