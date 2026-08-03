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

// UPDATE BOOKING STATUS
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found",
        },
        { status: 404 }
      );
    }

    if (status) {
      booking.status = status;
    }

    await booking.save();

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Update booking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 400 }
    );
  }
}

// DELETE BOOKING
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete booking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 400 }
    );
  }
}