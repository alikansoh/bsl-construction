import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { verifyToken } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

export async function POST(request: Request) {
  try {
    const user = authenticate(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "admin" && user.role !== "editor") {
      return NextResponse.json(
        { success: false, message: "You do not have permission to delete images" },
        { status: 403 }
      );
    }

    const { publicId } = await request.json();

    if (!publicId || typeof publicId !== "string") {
      return NextResponse.json(
        { success: false, message: "publicId is required" },
        { status: 400 }
      );
    }

    // Guardrail: only ever delete assets inside our own folder,
    // never accept an arbitrary publicId pointing elsewhere.
    if (!publicId.startsWith("bsl-construction/")) {
      return NextResponse.json(
        { success: false, message: "Invalid publicId" },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete image" },
      { status: 500 }
    );
  }
}