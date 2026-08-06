// app/services/[slug]/[borough]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllServices, getServiceBySlug, getTrustBar } from "@/lib/services";
import { BOROUGHS, getBoroughBySlug } from "@/lib/boroughs";
import ServiceDetailView from "@/components/ServiceDetailView";

type PageProps = {
  params: Promise<{ slug: string; borough: string }>;
};

// Only real service × borough combinations are valid — anything else 404s
// instead of rendering an arbitrary/unknown borough.
export const dynamicParams = true;

export async function generateStaticParams() {
  const services = await getAllServices();

  return services.flatMap((service) =>
    BOROUGHS.map((borough) => ({
      slug: service.slug,
      borough: borough.slug,
    })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, borough: boroughSlug } = await params;

  const borough = getBoroughBySlug(boroughSlug);
  if (!borough) return {};

  const service = await getServiceBySlug(slug);
  if (!service) return {};

  const baseTitle = service.seo?.metaTitle || service.title;
  const baseDescription =
    service.seo?.metaDescription ||
    service.hero?.description?.replace(/<[^>]*>/g, "") ||
    "";

  // Append the borough so each borough page has a distinct meta title/
  // description rather than duplicating the main London page's metadata.
  const title = `${baseTitle} in ${borough.name}, London`;
  const description = baseDescription
    ? `${baseDescription} Serving ${borough.name} and the surrounding area.`
    : `Professional ${service.title?.toLowerCase()} services in ${borough.name}, London.`;

  return {
    title,
    description,
    keywords: service.seo?.keywords || [],
    openGraph: {
      title,
      description,
      images: service.hero?.image?.url
        ? [
            {
              url: service.hero.image.url,
              alt: service.hero.image.alt || service.hero.title || service.title,
            },
          ]
        : [],
    },
  };
}

export default async function ServiceBoroughDetailPage({ params }: PageProps) {
  const { slug, borough: boroughSlug } = await params;

  const borough = getBoroughBySlug(boroughSlug);
  if (!borough) {
    notFound();
  }

  const service = await getServiceBySlug(slug);
  if (!service) {
    notFound();
  }

  const trustBarItems = await getTrustBar();

  return (
    <ServiceDetailView
      service={service}
      trustBarItems={trustBarItems}
      locationName={`${borough.name}, London`}
      areas={borough.areas ?? []}
      borough={borough}
    />
  );
}