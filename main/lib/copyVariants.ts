// lib/copyVariants.ts
/**
 * Deterministic copy variation so that no two service × borough pages
 * render identical template sentences. Same input always produces the
 * same output (safe for SSG/ISR caching) but varies across pages.
 */

function seededPick<T>(seed: string, items: T[]): T {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return items[hash % items.length];
  }
  
  const AREAS_DESCRIPTION_TEMPLATES: Array<
    (service: string, location: string, propertyProfile: string) => string
  > = [
    (s, l, p) =>
      `BSL Construction carries out ${s} across ${l}, with particular experience on the borough's ${p}.`,
    (s, l, p) =>
      `Local homeowners and landlords in ${l} — much of it ${p} — regularly call on us for ${s}.`,
    (s, l, p) =>
      `Across ${l}'s ${p}, our team handles ${s} for both private clients and managing agents.`,
    (s, l, p) =>
      `We're a familiar name for ${s} in ${l}, where ${p} make up a large share of the properties we work on.`,
  ];
  
  const OVERVIEW_TEMPLATES: Array<
    (service: string, location: string, landmark: string) => string
  > = [
    (s, l, m) => `Professional ${s}, carried out properly — right across ${l}, from ${m} outward.`,
    (s, l, m) => `Properly managed ${s} for ${l}, covering everything from ${m} to the surrounding streets.`,
    (s, l, m) => `${l} residents near ${m} trust us for ${s} that's planned, priced and delivered properly.`,
  ];
  
  export function getAreasDescription(
    serviceSlug: string,
    boroughSlug: string,
    serviceTitle: string,
    locationName: string,
    propertyProfile: string,
  ): string {
    const template = seededPick(`areas-${serviceSlug}-${boroughSlug}`, AREAS_DESCRIPTION_TEMPLATES);
    return template(serviceTitle.toLowerCase(), locationName, propertyProfile);
  }
  
  export function getOverviewTitle(
    serviceSlug: string,
    boroughSlug: string,
    serviceTitle: string,
    locationName: string,
    landmark: string,
  ): string {
    const template = seededPick(`overview-${serviceSlug}-${boroughSlug}`, OVERVIEW_TEMPLATES);
    return template(serviceTitle.toLowerCase(), locationName, landmark);
  }