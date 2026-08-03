import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "errors" in error) {
    const mongooseError = error as {
      errors?: Record<string, { message?: string }>;
      message?: string;
    };

    const firstFieldError = mongooseError.errors
      ? Object.values(mongooseError.errors)[0]?.message
      : null;

    return firstFieldError || mongooseError.message || "Validation failed";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

// GET ALL BOOKINGS (dashboard)
export async function GET() {
  try {
    await connectDB();

    const bookings = await Booking.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get bookings",
      },
      { status: 500 }
    );
  }
}

// CREATE BOOKING (public — from Contact Us form)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const service = String(body.service || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email and message are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.create({
      name,
      email,
      phone,
      service,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create booking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 400 }
    );
  }
}