/**
 * Shared "job ticket" helpers for the blog.
 * Both the index and the detail view render posts as work-order tickets,
 * so the docket-number hash and date formatting live here once.
 */

export function formatDate(value?: string, style: "long" | "short" = "long") {
    if (!value) return null;
    return new Date(value).toLocaleDateString(
      "en-US",
      style === "long"
        ? { month: "long", day: "numeric", year: "numeric" }
        : { month: "short", day: "2-digit", year: "numeric" }
    );
  }
  
  /** Deterministic "docket number" derived from the slug, e.g. "PE-4821". */
  export function docketNumber(slug: string) {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
      hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
    }
    const prefix = (slug.match(/[a-z]/gi)?.[0] || "J").toUpperCase();
    const secondPrefix = (slug.replace(/[^a-z]/gi, "")[3] || "T").toUpperCase();
    return `${prefix}${secondPrefix}-${(hash % 9000) + 1000}`;
  }
  
  export function initials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }