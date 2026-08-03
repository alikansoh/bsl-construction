import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { verifyToken } from "@/lib/auth";

interface ImageInput {
  url: string;
  alt?: string;
  publicId?: string;
  [key: string]: unknown;
}

interface SeoInput {
  metaTitle: string;
  metaDescription: string;
  keywords?: string[];
  [key: string]: unknown;
}

interface CreateBlogBody {
  title?: string;
  slug?: string;
  excerpt?: string;

  category?: string;
  author?: string;
  tags?: string[];

  status?: string;
  featured?: boolean;
  displayOrder?: number | string;

  publishedAt?: string;
  readTime?: string;

  thumbnail?: ImageInput;
  coverImage?: ImageInput;

  content?: string;

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
    const tag = searchParams.get("tag");


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

    if (tag) {
      filter.tags = tag;
    }


    await connectDB();


    const blogs = await Blog.find(filter)
      .sort({
        displayOrder: 1,
        publishedAt: -1,
        createdAt: -1,
      })
      .lean();


    return NextResponse.json({
      success: true,
      count: blogs.length,
      blogs,
    });


  } catch (error) {

    console.error("Get blogs error:", error);


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
          message: "You do not have permission to create blog posts",
        },
        {
          status: 403,
        }
      );
    }


    const rawBody = (await request.json()) as CreateBlogBody | null;

    const body = rawBody ?? {};

    const {
      title,
      slug,
      excerpt,

      category,
      author,
      tags,

      status,
      featured,
      displayOrder,

      publishedAt,
      readTime,

      thumbnail,
      coverImage,

      content,

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


    if (!excerpt || typeof excerpt !== "string" || !excerpt.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Excerpt is required",
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


    if (!author || typeof author !== "string" || !author.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Author is required",
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


    if (!coverImage?.url) {
      return NextResponse.json(
        {
          success: false,
          message: "Cover image is required",
        },
        {
          status: 400,
        }
      );
    }


    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Content is required",
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



    await connectDB();



    const existing = await Blog.findOne({
      slug: slug.trim().toLowerCase(),
    });



    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A blog post with this slug already exists",
        },
        {
          status: 409,
        }
      );
    }




    const blog = await Blog.create({

      title: title.trim(),


      slug: slug
        .trim()
        .toLowerCase(),


      excerpt:
        excerpt.trim(),



      category:
        category.trim(),



      author:
        author.trim(),



      tags:
        Array.isArray(tags)
          ? tags
          : [],



      status:
        status === "published"
          ? "published"
          : "draft",



      featured:
        Boolean(featured),



      displayOrder:
        Number(displayOrder) || 0,



      publishedAt:
        status === "published"
          ? publishedAt
            ? new Date(publishedAt)
            : new Date()
          : publishedAt
          ? new Date(publishedAt)
          : undefined,



      readTime:
        readTime?.trim() || undefined,



      thumbnail,



      coverImage,



      content:
        content.trim(),



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
        message: "Blog post created",
        blog,
      },
      {
        status: 201,
      }
    );



  } catch (error: unknown) {


    console.error(
      "Create blog error:",
      error
    );



    if (isMongoDuplicateKeyError(error)) {

      return NextResponse.json(
        {
          success: false,
          message:
            "A blog post with this slug already exists",
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