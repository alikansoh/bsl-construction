import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import ProjectDetail from "@/components/ProjectDetail";
import type { PublicProject } from "@/components/ProjectDetail";

/* -------------------------------------------------------------------------
 * Data fetching
 * ---------------------------------------------------------------------- */

interface ProjectResponse {
  success: boolean;
  project?: PublicProject;
}

/*
  `fetch` on the server has no implicit origin, so a relative path like
  `/api/projects/x` throws ("Failed to parse URL from /api/projects/x").
  Prefer an explicit env var in production; fall back to the incoming
  request's own host/protocol (works in dev and most deployments without
  any extra config).
*/
async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error(
      "Could not resolve a base URL for the API request — set NEXT_PUBLIC_SITE_URL.",
    );
  }

  return `${protocol}://${host}`;
}

async function getProject(slug: string): Promise<PublicProject | null> {
  const base = await getBaseUrl();

  const res = await fetch(`${base}/api/projects/${slug}`, {
    // Projects are edited from the admin at any time — always read fresh.
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to load project");
  }

  const data: ProjectResponse = await res.json();

  if (!data.success || !data.project) {
    return null;
  }

  return data.project;
}

/* -------------------------------------------------------------------------
 * Metadata
 * ---------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return { title: "Project not found" };
  }

  const title = project.seo?.metaTitle || project.title;
  const description = project.seo?.metaDescription || project.shortDescription;

  return {
    title,
    description,
    keywords: project.seo?.keywords?.length ? project.seo.keywords : undefined,
    openGraph: {
      title,
      description,
      images: project.heroImage?.url ? [{ url: project.heroImage.url }] : undefined,
    },
  };
}

/* -------------------------------------------------------------------------
 * Page
 * ---------------------------------------------------------------------- */

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetail project={project} />;
}