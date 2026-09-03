// app/services/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllServices, getServiceBySlug, getTrustBar } from "@/lib/services";
import ServiceDetailView from "@/components/ServiceDetailView";

const LOCATION_NAME = "London";

const SHARED_AREAS = [
  "City of London", "Westminster", "Kensington & Chelsea", "Camden",
  "Islington", "Hackney", "Hammersmith & Fulham", "Wandsworth",
  "Richmond upon Thames", "Kingston upon Thames", "Merton", "Lambeth",
  "Southwark", "Lewisham", "Greenwich", "Tower Hamlets", "Haringey",
  "Barnet", "Brent", "Harrow", "Ealing", "Hounslow", "Enfield", "Bromley", "Croydon",
];

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const services = await getAllServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};

  return {
    title: service.seo?.metaTitle || service.title,
    description:
      service.seo?.metaDescription ||
      service.hero?.description?.replace(/<[^>]*>/g, "") ||
      "",
    keywords: service.seo?.keywords || [],
    openGraph: {
      title: service.seo?.metaTitle || service.title,
      description:
        service.seo?.metaDescription ||
        service.hero?.description?.replace(/<[^>]*>/g, "") ||
        "",
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

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const trustBarItems = await getTrustBar();

  return (
    <ServiceDetailView
      service={service}
      trustBarItems={trustBarItems}
      locationName={LOCATION_NAME}
      areas={SHARED_AREAS}
    />
  );
}