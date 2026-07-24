import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Service from "@/models/Service";
import { verifyToken } from "@/lib/auth";

interface ImageInput {
  url: string;
  alt?: string;
  [key: string]: unknown;
}

interface HeroInput {
  title: string;
  eyebrow: string;
  description: string;
  image: ImageInput;
  [key: string]: unknown;
}

interface SectionInput {
  title: string;
  content: string;
  image: ImageInput;
  [key: string]: unknown;
}

interface WhatsIncludedInput {
  title: string;
  intro: string;
  [key: string]: unknown;
}

interface ProcessInput {
  title: string;
  description: string;
  [key: string]: unknown;
}

interface CtaInput {
  title: string;
  content: string;
  buttonLabel: string;
  buttonHref: string;
  [key: string]: unknown;
}

interface SeoInput {
  metaTitle: string;
  metaDescription: string;
  keywords?: string[];
  [key: string]: unknown;
}

interface FaqInput {
  question?: string;
  answer?: string;
  [key: string]: unknown;
}

interface CreateServiceBody {
  title?: string;
  slug?: string;
  categorySlug?: string;
  categoryName?: string;
  status?: string;
  featured?: boolean;
  displayOrder?: number | string;
  hero?: HeroInput;
  sections?: SectionInput[];
  whatsIncluded?: WhatsIncludedInput;
  process?: ProcessInput;
  gallery?: ImageInput[];
  faqs?: FaqInput[];
  cta?: CtaInput;
  seo?: SeoInput;
  [key: string]: unknown;
}

interface MongoDuplicateKeyError {
  code: 11000;
}

function isMongoDuplicateKeyError(error: unknown): error is MongoDuplicateKeyError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

interface MongooseValidationError {
  name: "ValidationError";
  errors: Record<string, { message?: string }>;
}

function isMongooseValidationError(error: unknown): error is MongooseValidationError {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "ValidationError" &&
    "errors" in error
  );
}

function getTokenFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  return cookieHeader
    ?.split(";")
    .find((cookie) => cookie.trim().startsWith("auth_token="))
    ?.split("=")[1];
}

function getAuthedUser(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const user = verifyToken(token);
  if (!user) return null;

  if (user.role !== "admin" && user.role !== "editor") return null;

  return user;
}

export async function GET(request: Request) {
  try {
    // GET is public — no auth required. If the caller IS a logged-in
    // admin/editor, they get full access (drafts, any status/featured
    // filter) same as before. Anyone else always gets published-only,
    // regardless of what they pass in the query string.
    const user = getAuthedUser(request);

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const categorySlug = searchParams.get("categorySlug");
    const featured = searchParams.get("featured");

    const filter: Record<string, unknown> = {};

    if (user) {
      if (status) filter.status = status;
      if (featured !== null) filter.featured = featured === "true";
    } else {
      // Unauthenticated request: force published, ignore any status/featured
      // spoofing attempt.
      filter.status = "published";
      if (featured !== null) filter.featured = featured === "true";
    }

    if (categorySlug) filter.categorySlug = categorySlug;

    await connectDB();

    const services = await Service.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error: unknown) {
    console.error("Get services error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Only admin and editor can create services
    if (user.role !== "admin" && user.role !== "editor") {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to create services",
        },
        { status: 403 }
      );
    }

    const rawBody = (await request.json()) as CreateServiceBody | null;
    const body = rawBody ?? {};

    const {
      title,
      slug,
      categorySlug,
      categoryName,
      status,
      featured,
      displayOrder,
      hero,
      sections,
      whatsIncluded,
      process: processInfo,
      gallery,
      faqs,
      cta,
      seo,
    } = body;

    // Basic required-field validation (mirrors the Mongoose schema's `required` fields)
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== "string" || !slug.trim()) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 }
      );
    }

    if (!categorySlug || !categoryName) {
      return NextResponse.json(
        { success: false, message: "Category is required" },
        { status: 400 }
      );
    }

    if (!hero || !hero.title || !hero.eyebrow || !hero.description) {
      return NextResponse.json(
        {
          success: false,
          message: "Hero title, eyebrow and description are required",
        },
        { status: 400 }
      );
    }

    if (!hero.image?.url) {
      return NextResponse.json(
        { success: false, message: "Hero image is required" },
        { status: 400 }
      );
    }

    if (!whatsIncluded || !whatsIncluded.title || !whatsIncluded.intro) {
      return NextResponse.json(
        { success: false, message: "\"What's Included\" title and intro are required" },
        { status: 400 }
      );
    }

    if (!processInfo || !processInfo.title || !processInfo.description) {
      return NextResponse.json(
        { success: false, message: "Process title and description are required" },
        { status: 400 }
      );
    }

    if (!cta || !cta.title || !cta.content || !cta.buttonLabel || !cta.buttonHref) {
      return NextResponse.json(
        { success: false, message: "CTA title, content and button details are required" },
        { status: 400 }
      );
    }

    if (!seo || !seo.metaTitle || !seo.metaDescription) {
      return NextResponse.json(
        { success: false, message: "SEO meta title and meta description are required" },
        { status: 400 }
      );
    }

    // Each section needs an image + title/content (schema requires these)
    if (Array.isArray(sections)) {
      const invalidSection = sections.find(
        (s: SectionInput) => !s?.title || !s?.content || !s?.image?.url
      );
      if (invalidSection) {
        return NextResponse.json(
          {
            success: false,
            message: "Every content section needs a title, content and image",
          },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const existing = await Service.findOne({ slug: slug.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A service with this slug already exists" },
        { status: 409 }
      );
    }

    const service = await Service.create({
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      categorySlug,
      categoryName,
      status: status === "published" ? "published" : "draft",
      featured: Boolean(featured),
      displayOrder: Number(displayOrder) || 0,
      hero,
      sections: sections ?? [],
      whatsIncluded,
      process: processInfo,
      gallery: gallery ?? [],
      faqs: faqs ?? [],
      cta,
      seo: {
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        keywords: Array.isArray(seo.keywords) ? seo.keywords : [],
      },
    });

    return NextResponse.json(
      { success: true, message: "Service created", service },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create service error:", error);

    // Handle duplicate key errors from Mongo directly (race condition on slug)
    if (isMongoDuplicateKeyError(error)) {
      return NextResponse.json(
        { success: false, message: "A service with this slug already exists" },
        { status: 409 }
      );
    }

    // Handle Mongoose validation errors with a readable message
    if (isMongooseValidationError(error)) {
      const firstMessage = Object.values(error.errors)[0];
      return NextResponse.json(
        {
          success: false,
          message: firstMessage?.message || "Validation failed",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}