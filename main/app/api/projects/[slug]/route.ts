import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Projects";
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



// GET /api/projects/[slug] (PUBLIC)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    await connectDB();

    const project = await Project.findOne({
      slug,
      status: "published", // only show published projects publicly
    }).lean();

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      project,
    });

  } catch (error) {
    console.error(
      "Get public project error:",
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






// PUT /api/projects/[slug]

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



    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only admins can edit projects",
        },
        { status: 403 }
      );
    }



    const { slug } = await params;


    const body = await request.json();



    /*
      Removed fields:
      - description
      - slug editing
    */

    delete body.description;
    delete body.slug;



    await connectDB();



    const project = await Project.findOne({
      slug,
    });



    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found",
        },
        { status: 404 }
      );
    }



    Object.assign(
      project,
      body
    );



    [
      "thumbnail",
      "heroImage",
      "gallery",
      "overview",
      "challenges",
      "solutions",
      "results",
      "projectDetails",
      "cta",
      "seo",
    ].forEach((key) => {
      project.markModified(key);
    });



    await project.save();



    revalidatePath(
      `/projects/${project.slug}`
    );

    revalidatePath(
      "/projects"
    );



    return NextResponse.json({
      success: true,
      message:
        "Project updated successfully",
      project,
    });



  } catch (error) {

    console.error(
      "Update project error:",
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






// DELETE /api/projects/[slug]

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
            "Only admins can delete projects",
        },
        { status: 403 }
      );
    }



    const { slug } = await params;



    await connectDB();



    const project =
      await Project.findOneAndDelete({
        slug,
      });



    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Project not found",
        },
        { status: 404 }
      );
    }



    revalidatePath(
      `/projects/${slug}`
    );

    revalidatePath(
      "/projects"
    );



    return NextResponse.json({
      success: true,
      message:
        "Project deleted successfully",
    });



  } catch (error) {

    console.error(
      "Delete project error:",
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