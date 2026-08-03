import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

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

// GET ALL USERS
export async function GET() {
  try {
    await connectDB();

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get users",
      },
      { status: 500 }
    );
  }
}

// CREATE USER
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username and password are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Username already exists",
        },
        { status: 409 }
      );
    }

    const user = await User.create({
      username,
      password,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 400 }
    );
  }
}

// UPDATE USER
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const { id, username, password } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (username) {
      user.username = String(username).trim().toLowerCase();
    }

    if (password) {
      user.password = String(password);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 400 }
    );
  }
}

// DELETE USER
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 400 }
    );
  }
}