import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Project from "@/models/Projects";
import Service from "@/models/Service";
import { BOROUGHS } from "@/lib/boroughs";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://bsl-construction.co.uk";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
  { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${baseUrl}/blog`, changeFrequency: "daily", priority: 0.9 },
  { url: `${baseUrl}/projects`, changeFrequency: "weekly", priority: 0.9 },
  { url: `${baseUrl}/services`, changeFrequency: "weekly", priority: 0.9 },
  { url: `${baseUrl}/services/commercial`, changeFrequency: "monthly", priority: 0.7 },
  { url: `${baseUrl}/services/construction`, changeFrequency: "monthly", priority: 0.7 },
  { url: `${baseUrl}/services/mechanical-electrical`, changeFrequency: "monthly", priority: 0.7 },
];

// One sitemap id per "chunk": 0 = static + blogs + projects + services index pages,
// 1..N = service × borough location pages, batched to keep each file well under
// the ~50,000 URL limit (and readable in size).
const LOCATIONS_PER_SITEMAP = 5000;

async function getPublishedServiceSlugs(): Promise<string[]> {
  await connectDB();
  const services = await Service.find({ status: "published" }).select("slug").lean();
  return services.map((s) => s.slug);
}

export async function generateSitemaps() {
  const serviceSlugs = await getPublishedServiceSlugs();
  const totalLocationUrls = serviceSlugs.length * BOROUGHS.length;
  const locationChunks = Math.ceil(totalLocationUrls / LOCATIONS_PER_SITEMAP) || 1;

  // id 0 reserved for core content, ids 1..N for location pages
  return Array.from({ length: locationChunks + 1 }, (_, i) => ({ id: i }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  if (id === 0) {
    const [blogs, projects, services] = await Promise.all([
      Blog.find({ status: "published" }).select("slug updatedAt").lean(),
      Project.find({ status: "published" }).select("slug updatedAt").lean(),
      Service.find({ status: "published" }).select("slug updatedAt").lean(),
    ]);

    const blogRoutes: MetadataRoute.Sitemap = blogs.map((b) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
      url: `${baseUrl}/services/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

    return [...STATIC_ROUTES, ...blogRoutes, ...projectRoutes, ...serviceRoutes];
  }

  // Location pages: services × boroughs, flattened and paginated by chunk id.
  const services = await Service.find({ status: "published" })
    .select("slug updatedAt")
    .lean();

  const allLocationUrls: MetadataRoute.Sitemap = services.flatMap((service) =>
    BOROUGHS.map((borough) => ({
      url: `${baseUrl}/services/${service.slug}/${borough.slug}`,
      lastModified: service.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  );

  const chunkIndex = id - 1; // id 1 -> chunk 0
  const start = chunkIndex * LOCATIONS_PER_SITEMAP;
  const end = start + LOCATIONS_PER_SITEMAP;

  return allLocationUrls.slice(start, end);
}