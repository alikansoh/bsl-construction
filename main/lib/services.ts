// lib/services.ts

/* -------------------------------------------------------------------------- */
/* Config                                                                     */
/* -------------------------------------------------------------------------- */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const DEFAULT_REVALIDATE_SECONDS = 300;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ServiceImage = {
  url: string;
  alt: string;
  publicId?: string;
};

export type ServiceCtaLink = {
  label: string;
  href: string;
};

export type ServiceHero = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  description: string;
  image?: ServiceImage;
  primaryCta?: ServiceCtaLink;
  secondaryCta?: ServiceCtaLink;
};

export type ServiceSection = {
  _id?: string;
  id?: string;
  layout?: string;
  title: string;
  content: string;
  image?: ServiceImage;
  cta?: ServiceCtaLink;
};

export type ServiceFaq = {
  _id?: string;
  question: string;
  answer: string;
};

export type ServiceProcessStep = {
  _id?: string;
  step: number;
  title: string;
  content: string;
};

export type ServiceProcess = {
  title: string;
  description: string;
  steps: ServiceProcessStep[];
};

export type ServiceCta = {
  title: string;
  content: string;
  buttonLabel: string;
  buttonHref: string;
};

export type WhatsIncluded = {
  title: string;
  intro: string;
  items: string[];
};

export type ServiceSeo = {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
};

export type TrustBarItem = {
  id: string;
  label: string;
};

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

  categoryName: string;
  categorySlug: string;

  serviceType: ServiceType;

  status: "published" | "draft";

  featured: boolean;

  displayOrder: number;

  hero: ServiceHero;

  sections: ServiceSection[];

  whatsIncluded?: WhatsIncluded;

  process?: ServiceProcess;

  gallery: ServiceImage[];

  faqs: ServiceFaq[];

  cta?: ServiceCta;

  seo: ServiceSeo;
};

/* -------------------------------------------------------------------------- */
/* Raw API Types                                                              */
/* -------------------------------------------------------------------------- */

type RawServiceImage = {
  url?: string;
  alt?: string;
  publicId?: string;
};

type RawCtaLink = {
  label?: string;
  href?: string;
};

type RawHero = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: RawServiceImage;
  primaryCta?: RawCtaLink;
  secondaryCta?: RawCtaLink;
};

type RawSection = {
  _id?: string;
  id?: string;
  layout?: string;
  title?: string;
  content?: string;
  image?: RawServiceImage;
  cta?: RawCtaLink;
};

type RawProcessStep = {
  _id?: string;
  step?: number;
  title?: string;
  content?: string;
};

type RawProcess = {
  title?: string;
  description?: string;
  steps?: RawProcessStep[];
};

type RawWhatsIncluded = {
  title?: string;
  intro?: string;
  items?: unknown[];
};

type RawFaq = {
  _id?: string;
  question?: string;
  answer?: string;
};

type RawCta = {
  title?: string;
  content?: string;
  buttonLabel?: string;
  buttonHref?: string;
};

type RawSeo = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: unknown[];
};

type RawService = {
  _id?: string;
  id?: string;

  slug?: string;
  title?: string;

  categorySlug?: string;
  categoryName?: string;

  status?: string;
  featured?: boolean;
  displayOrder?: number;

  hero?: RawHero;

  sections?: RawSection[];

  whatsIncluded?: RawWhatsIncluded;

  process?: RawProcess;

  gallery?: RawServiceImage[];

  faqs?: RawFaq[];

  cta?: RawCta;

  seo?: RawSeo;
};

type ServicesListResponse = {
  success: boolean;
  count?: number;
  services?: RawService[];
  message?: string;
};

/* -------------------------------------------------------------------------- */
/* Fetch Helper                                                               */
/* -------------------------------------------------------------------------- */

async function fetchJson<T>(
  path: string,
  revalidate: number = DEFAULT_REVALIDATE_SECONDS
): Promise<T | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        next: {
          revalidate,
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Services API error: ${response.status} ${response.statusText}`
      );

      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(
      `Services API fetch failed: ${path}`,
      error
    );

    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Service Type Resolver                                                      */
/* -------------------------------------------------------------------------- */

function getServiceType(
  categoryName: string,
  categorySlug: string,
  title: string
): ServiceType {
  const categoryText =
    `${categoryName} ${categorySlug} ${title}`.toLowerCase();

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
    "loft conversion",
    "basement",
    "groundwork",
    "groundworks",
    "structural",
    "development",
    "developments",
  ];

  if (
    constructionKeywords.some(
      (keyword) =>
        categoryText.includes(keyword)
    )
  ) {
    return "construction";
  }

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
    propertyKeywords.some(
      (keyword) =>
        categoryText.includes(keyword)
    )
  ) {
    return "property";
  }

  return "trade";
}

/* -------------------------------------------------------------------------- */
/* Normalizers                                                                */
/* -------------------------------------------------------------------------- */

function normalizeImage(
  image?: RawServiceImage
): ServiceImage | undefined {
  if (!image?.url) {
    return undefined;
  }

  return {
    url: image.url,
    alt: image.alt ?? "",
    publicId: image.publicId,
  };
}

/* -------------------------------------------------------------------------- */

function normalizeCtaLink(
  cta?: RawCtaLink
): ServiceCtaLink | undefined {
  if (!cta) {
    return undefined;
  }

  if (!cta.label && !cta.href) {
    return undefined;
  }

  return {
    label: cta.label ?? "",
    href: cta.href ?? "#",
  };
}

/* -------------------------------------------------------------------------- */

function normalizeHero(
  hero?: RawHero
): ServiceHero {
  return {
    eyebrow: hero?.eyebrow ?? "",
    title: hero?.title ?? "",
    subtitle: hero?.subtitle ?? "",
    description: hero?.description ?? "",
    image: normalizeImage(hero?.image),
    primaryCta:
      normalizeCtaLink(
        hero?.primaryCta
      ),
    secondaryCta:
      normalizeCtaLink(
        hero?.secondaryCta
      ),
  };
}

/* -------------------------------------------------------------------------- */

function normalizeSections(
  sections?: RawSection[]
): ServiceSection[] {
  if (!Array.isArray(sections)) {
    return [];
  }

  return sections.map(
    (section, index) => ({
      _id: section._id,
      id:
        section.id ??
        section._id ??
        `section-${index}`,

      layout:
        section.layout ??
        "image-right",

      title:
        section.title ?? "",

      content:
        section.content ?? "",

      image:
        normalizeImage(
          section.image
        ),

      cta:
        normalizeCtaLink(
          section.cta
        ),
    })
  );
}

/* -------------------------------------------------------------------------- */

function normalizeWhatsIncluded(
  data?: RawWhatsIncluded
): WhatsIncluded | undefined {
  if (!data) {
    return undefined;
  }

  return {
    title:
      data.title ?? "",

    intro:
      data.intro ?? "",

    items:
      Array.isArray(data.items)
        ? data.items.filter(
            (
              item
            ): item is string =>
              typeof item ===
                "string" &&
              item.trim().length >
                0
          )
        : [],
  };
}

/* -------------------------------------------------------------------------- */

function normalizeProcess(
  process?: RawProcess
): ServiceProcess | undefined {
  if (!process) {
    return undefined;
  }

  return {
    title:
      process.title ?? "",

    description:
      process.description ?? "",

    steps:
      Array.isArray(
        process.steps
      )
        ? process.steps.map(
            (
              step,
              index
            ) => ({
              _id:
                step._id,

              step:
                typeof step.step ===
                "number"
                  ? step.step
                  : index + 1,

              title:
                step.title ?? "",

              content:
                step.content ?? "",
            })
          )
        : [],
  };
}

/* -------------------------------------------------------------------------- */

function normalizeGallery(
  gallery?: RawServiceImage[]
): ServiceImage[] {
  if (!Array.isArray(gallery)) {
    return [];
  }

  return gallery
    .map(
      (image) =>
        normalizeImage(image)
    )
    .filter(
      (
        image
      ): image is ServiceImage =>
        Boolean(image)
    );
}

/* -------------------------------------------------------------------------- */

function normalizeFaqs(
  faqs?: RawFaq[]
): ServiceFaq[] {
  if (!Array.isArray(faqs)) {
    return [];
  }

  return faqs
    .filter(
      (faq) =>
        Boolean(faq.question)
    )
    .map((faq) => ({
      _id: faq._id,

      question:
        faq.question ?? "",

      answer:
        faq.answer ?? "",
    }));
}

/* -------------------------------------------------------------------------- */

function normalizeCta(
  cta?: RawCta
): ServiceCta | undefined {
  if (!cta) {
    return undefined;
  }

  return {
    title:
      cta.title ?? "",

    content:
      cta.content ?? "",

    buttonLabel:
      cta.buttonLabel ?? "",

    buttonHref:
      cta.buttonHref ?? "#",
  };
}

/* -------------------------------------------------------------------------- */

function normalizeSeo(
  seo?: RawSeo
): ServiceSeo {
  return {
    metaTitle:
      seo?.metaTitle ?? "",

    metaDescription:
      seo?.metaDescription ?? "",

    keywords:
      Array.isArray(
        seo?.keywords
      )
        ? seo.keywords.filter(
            (
              keyword
            ): keyword is string =>
              typeof keyword ===
              "string"
          )
        : [],
  };
}

/* -------------------------------------------------------------------------- */
/* Normalize Service                                                          */
/* -------------------------------------------------------------------------- */

function normalizeService(
  raw: RawService
): Service {
  const title =
    raw.title ?? "";

  const categoryName =
    raw.categoryName ?? "";

  const categorySlug =
    raw.categorySlug ?? "";

  return {
    id: String(
      raw._id ??
        raw.id ??
        ""
    ),

    slug:
      raw.slug ?? "",

    title,

    categoryName,

    categorySlug,

    serviceType:
      getServiceType(
        categoryName,
        categorySlug,
        title
      ),

    status:
      raw.status ===
      "published"
        ? "published"
        : "draft",

    featured:
      Boolean(
        raw.featured
      ),

    displayOrder:
      Number(
        raw.displayOrder ?? 0
      ),

    hero:
      normalizeHero(
        raw.hero
      ),

    sections:
      normalizeSections(
        raw.sections
      ),

    whatsIncluded:
      normalizeWhatsIncluded(
        raw.whatsIncluded
      ),

    process:
      normalizeProcess(
        raw.process
      ),

    gallery:
      normalizeGallery(
        raw.gallery
      ),

    faqs:
      normalizeFaqs(
        raw.faqs
      ),

    cta:
      normalizeCta(
        raw.cta
      ),

    seo:
      normalizeSeo(
        raw.seo
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* Get All Services                                                           */
/* -------------------------------------------------------------------------- */

export async function getAllServices(): Promise<
  Service[]
> {
  const data =
    await fetchJson<ServicesListResponse>(
      "/api/services"
    );

  if (
    !data?.success ||
    !Array.isArray(
      data.services
    )
  ) {
    return [];
  }

  return data.services
    .filter(
      (service) =>
        service.status ===
        "published"
    )
    .sort(
      (a, b) =>
        (a.displayOrder ?? 0) -
        (b.displayOrder ?? 0)
    )
    .map(
      normalizeService
    );
}

/* -------------------------------------------------------------------------- */
/* Get Service By Slug                                                        */
/* -------------------------------------------------------------------------- */

export async function getServiceBySlug(
  slug: string
): Promise<
  Service | undefined
> {
  const services =
    await getAllServices();

  return services.find(
    (service) =>
      service.slug === slug
  );
}

/* -------------------------------------------------------------------------- */
/* Get Services By Category                                                   */
/* -------------------------------------------------------------------------- */

export async function getServicesByCategorySlug(
  categorySlug: string
): Promise<Service[]> {
  const services =
    await getAllServices();

  return services.filter(
    (service) =>
      service.categorySlug ===
      categorySlug
  );
}

/* -------------------------------------------------------------------------- */
/* Get Services By Type                                                       */
/* -------------------------------------------------------------------------- */

export async function getServicesByType(
  serviceType: ServiceType
): Promise<Service[]> {
  const services =
    await getAllServices();

  return services.filter(
    (service) =>
      service.serviceType ===
      serviceType
  );
}

/* -------------------------------------------------------------------------- */
/* Get Trust Bar                                                              */
/* -------------------------------------------------------------------------- */

const STATIC_TRUST_BAR: TrustBarItem[] =
  [
    {
      id: "insured",
      label: "Fully Insured",
    },
    {
      id: "team",
      label:
        "Dedicated Project Team",
    },
    {
      id: "service",
      label:
        "All Trades In-House",
    },
    {
      id: "guarantee",
      label:
        "Clear, Fixed Quotes",
    },
    {
      id: "recommended",
      label:
        "Trusted Across London",
    },
  ];

export async function getTrustBar(): Promise<
  TrustBarItem[]
> {
  return STATIC_TRUST_BAR;
}