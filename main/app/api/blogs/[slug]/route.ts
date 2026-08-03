import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";


function getToken(request: Request) {
  const cookieHeader = request.headers.get("cookie");

  return cookieHeader
    ?.split(";")
    .find((cookie) => cookie.trim().startsWith("auth_token="))
    ?.split("=")[1];
}


function authenticate(request: Request) {
  const token = getToken(request);

  if (!token) {
    return null;
  }

  return verifyToken(token);
}



// GET /api/blogs/[slug] (PUBLIC)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    await connectDB();

    const blog = await Blog.findOne({
      slug,
      status: "published", // only show published posts publicly
    }).lean();

    if (!blog) {
      return NextResponse.json(
        {
          success: false,
          message: "Blog post not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      blog,
    });

  } catch (error) {
    console.error(
      "Get public blog error:",
      error
    );

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






// PUT /api/blogs/[slug]

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {

  try {

    const user = authenticate(request);


    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }



    if (user.role !== "admin" && user.role !== "editor") {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to edit blog posts",
        },
        { status: 403 }
      );
    }



    const { slug } = await params;


    const body = await request.json();



    /*
      Removed fields:
      - slug editing
    */

    delete body.slug;



    await connectDB();



    const blog = await Blog.findOne({
      slug,
    });



    if (!blog) {
      return NextResponse.json(
        {
          success: false,
          message: "Blog post not found",
        },
        { status: 404 }
      );
    }



    // If status is being flipped to published for the first time,
    // stamp publishedAt automatically.
    if (
      body.status === "published" &&
      blog.status !== "published" &&
      !body.publishedAt
    ) {
      body.publishedAt = new Date();
    }



    Object.assign(
      blog,
      body
    );



    [
      "thumbnail",
      "coverImage",
      "tags",
      "seo",
    ].forEach((key) => {
      blog.markModified(key);
    });



    await blog.save();



    revalidatePath(
      `/blog/${blog.slug}`
    );

    revalidatePath(
      "/blog"
    );



    return NextResponse.json({
      success: true,
      message:
        "Blog post updated successfully",
      blog,
    });



  } catch (error) {

    console.error(
      "Update blog error:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong",
      },
      { status: 500 }
    );

  }
}






// DELETE /api/blogs/[slug]

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {

  try {

    const user = authenticate(request);



    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized",
        },
        { status: 401 }
      );
    }



    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only admins can delete blog posts",
        },
        { status: 403 }
      );
    }



    const { slug } = await params;



    await connectDB();



    const blog =
      await Blog.findOneAndDelete({
        slug,
      });



    if (!blog) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Blog post not found",
        },
        { status: 404 }
      );
    }



    revalidatePath(
      `/blog/${slug}`
    );

    revalidatePath(
      "/blog"
    );



    return NextResponse.json({
      success: true,
      message:
        "Blog post deleted successfully",
    });



  } catch (error) {

    console.error(
      "Delete blog error:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong",
      },
      { status: 500 }
    );

  }
}