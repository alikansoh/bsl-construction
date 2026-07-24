import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Service from "@/models/Service";
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

// GET /api/services/[slug]
export async function GET(
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
          message: "You do not have permission to view services",
        },
        { status: 403 }
      );
    }

    const { slug } = await params;

    await connectDB();

    const service = await Service.findOne({ slug }).lean();

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          message: "Service not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get service error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}

// PUT /api/services/[slug]
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

    // Only admins can edit services
    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Only admins can edit services",
        },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const body = await request.json();

    await connectDB();

    const service = await Service.findOne({ slug });

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          message: "Service not found",
        },
        { status: 404 }
      );
    }

    // Prevent changing slug through this endpoint
    delete body.slug;

    Object.assign(service, body);

    // Force Mongoose to detect changes on nested/mixed fields —
    // without this, save() can silently skip nested objects that
    // aren't recognized as "modified" by shallow assignment.
    [
      "hero",
      "sections",
      "whatsIncluded",
      "process",
      "gallery",
      "faqs",
      "cta",
      "seo",
    ].forEach((key) => service.markModified(key));

    await service.save();

    // Bust any cached renders of the public-facing pages so the
    // published/draft changes actually show up without a redeploy.
    revalidatePath(`/services/${service.slug}`);
    revalidatePath("/services");

    return NextResponse.json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    console.error("Update service error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/services/[slug]
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
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Only admins can delete services
    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Only admins can delete services",
        },
        { status: 403 }
      );
    }

    const { slug } = await params;

    await connectDB();

    const service = await Service.findOneAndDelete({ slug });

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          message: "Service not found",
        },
        { status: 404 }
      );
    }

    revalidatePath(`/services/${slug}`);
    revalidatePath("/services");

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}