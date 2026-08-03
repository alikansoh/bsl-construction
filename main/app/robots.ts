import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://bsl-construction.co.uk";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/login", "/(dashboard)", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}