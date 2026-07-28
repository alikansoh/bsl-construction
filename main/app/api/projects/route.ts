import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Projects";
import { verifyToken } from "@/lib/auth";

interface ImageInput {
  url: string;
  alt?: string;
  publicId?: string;
  [key: string]: unknown;
}

interface SectionBlockInput {
  title?: string;
  items?: string[];
  [key: string]: unknown;
}

interface CtaInput {
  title?: string;
  content?: string;
  buttonLabel?: string;
  buttonHref?: string;
  [key: string]: unknown;
}

interface SeoInput {
  metaTitle: string;
  metaDescription: string;
  keywords?: string[];
  [key: string]: unknown;
}

interface ProjectDetailInput {
  label?: string;
  value?: string;
  [key: string]: unknown;
}

interface CreateProjectBody {
  title?: string;
  slug?: string;
  shortDescription?: string;

  category?: string;
  client?: string;
  location?: string;

  status?: string;
  featured?: boolean;
  displayOrder?: number | string;

  completedAt?: string;
  duration?: string;

  thumbnail?: ImageInput;
  heroImage?: ImageInput;

  gallery?: ImageInput[];

  overview?: {
    title?: string;
    content?: string;
    [key: string]: unknown;
  };

  challenges?: SectionBlockInput;
  solutions?: SectionBlockInput;
  results?: SectionBlockInput;

  technologies?: string[];

  projectDetails?: ProjectDetailInput[];

  cta?: CtaInput;

  seo?: SeoInput;

  [key: string]: unknown;
}


interface MongoDuplicateKeyError {
  code: 11000;
}

function isMongoDuplicateKeyError(
  error: unknown
): error is MongoDuplicateKeyError {
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


function isMongooseValidationError(
  error: unknown
): error is MongooseValidationError {
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

  if (user.role !== "admin" && user.role !== "editor") {
    return null;
  }

  return user;
}



export async function GET(request: Request) {
  try {
    const user = getAuthedUser(request);

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");


    const filter: Record<string, unknown> = {};


    if (user) {
      if (status) {
        filter.status = status;
      }

      if (featured !== null) {
        filter.featured = featured === "true";
      }

    } else {

      filter.status = "published";

      if (featured !== null) {
        filter.featured = featured === "true";
      }
    }


    if (category) {
      filter.category = category;
    }


    await connectDB();


    const projects = await Project.find(filter)
      .sort({
        displayOrder: 1,
        createdAt: -1,
      })
      .lean();


    return NextResponse.json({
      success: true,
      count: projects.length,
      projects,
    });


  } catch (error) {

    console.error("Get projects error:", error);


    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}



export async function POST(request: Request) {

  try {

    const token = getTokenFromRequest(request);


    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }


    const user = verifyToken(token);


    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        {
          status: 401,
        }
      );
    }


    if (user.role !== "admin" && user.role !== "editor") {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to create projects",
        },
        {
          status: 403,
        }
      );
    }


    const rawBody = (await request.json()) as CreateProjectBody | null;

    const body = rawBody ?? {};    const {
      title,
      slug,
      shortDescription,

      category,
      client,
      location,

      status,
      featured,
      displayOrder,

      completedAt,
      duration,

      thumbnail,
      heroImage,

      gallery,

      overview,

      challenges,
      solutions,
      results,

      technologies,

      projectDetails,

      cta,

      seo,

    } = body;


    // Required validation

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required",
        },
        {
          status: 400,
        }
      );
    }


    if (!slug || typeof slug !== "string" || !slug.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug is required",
        },
        {
          status: 400,
        }
      );
    }


    if (
      !shortDescription ||
      typeof shortDescription !== "string" ||
      !shortDescription.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Short description is required",
        },
        {
          status: 400,
        }
      );
    }


    if (!category || typeof category !== "string" || !category.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required",
        },
        {
          status: 400,
        }
      );
    }


    if (!thumbnail?.url) {
      return NextResponse.json(
        {
          success: false,
          message: "Thumbnail image is required",
        },
        {
          status: 400,
        }
      );
    }


    if (!heroImage?.url) {
      return NextResponse.json(
        {
          success: false,
          message: "Hero image is required",
        },
        {
          status: 400,
        }
      );
    }


    if (!overview?.content || !overview.content.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Overview content is required",
        },
        {
          status: 400,
        }
      );
    }


    if (!seo || !seo.metaTitle || !seo.metaDescription) {
      return NextResponse.json(
        {
          success: false,
          message:
            "SEO meta title and meta description are required",
        },
        {
          status: 400,
        }
      );
    }



    if (Array.isArray(projectDetails)) {

      const invalidDetail = projectDetails.find(
        (detail) =>
          !detail.label?.trim() ||
          !detail.value?.trim()
      );


      if (invalidDetail) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Every project detail requires a label and value",
          },
          {
            status: 400,
          }
        );
      }
    }



    await connectDB();



    const existing = await Project.findOne({
      slug: slug.trim().toLowerCase(),
    });



    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A project with this slug already exists",
        },
        {
          status: 409,
        }
      );
    }




    const project = await Project.create({

      title: title.trim(),


      slug: slug
        .trim()
        .toLowerCase(),


      shortDescription:
        shortDescription.trim(),



      category:
        category.trim(),



      client:
        client?.trim() || undefined,



      location:
        location?.trim() || undefined,



      status:
        status === "published"
          ? "published"
          : "draft",



      featured:
        Boolean(featured),



      displayOrder:
        Number(displayOrder) || 0,



      completedAt:
        completedAt
          ? new Date(completedAt)
          : undefined,



      duration:
        duration?.trim() || undefined,



      thumbnail,



      heroImage,



      gallery:
        Array.isArray(gallery)
          ? gallery
          : [],




      overview: {

        title:
          overview.title?.trim() ||
          "Overview",

        content:
          overview.content.trim(),

      },



      challenges:
        challenges ?? {
          title: "Challenges",
          items: [],
        },



      solutions:
        solutions ?? {
          title: "Solutions",
          items: [],
        },



      results:
        results ?? {
          title: "Results",
          items: [],
        },



      technologies:
        Array.isArray(technologies)
          ? technologies
          : [],



      projectDetails:
        Array.isArray(projectDetails)
          ? projectDetails
          : [],



      cta:
        cta ?? undefined,



      seo: {

        metaTitle:
          seo.metaTitle.trim(),


        metaDescription:
          seo.metaDescription.trim(),


        keywords:
          Array.isArray(seo.keywords)
            ? seo.keywords
            : [],

      },

    });




    return NextResponse.json(
      {
        success: true,
        message: "Project created",
        project,
      },
      {
        status: 201,
      }
    );



  } catch (error: unknown) {


    console.error(
      "Create project error:",
      error
    );



    if (isMongoDuplicateKeyError(error)) {

      return NextResponse.json(
        {
          success: false,
          message:
            "A project with this slug already exists",
        },
        {
          status: 409,
        }
      );
    }



    if (isMongooseValidationError(error)) {

      const firstError =
        Object.values(error.errors)[0];


      return NextResponse.json(
        {
          success: false,
          message:
            firstError?.message ||
            "Validation failed",
        },
        {
          status: 400,
        }
      );
    }



    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong",
      },
      {
        status: 500,
      }
    );

  }
}