import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Hardcoded admin credentials - CHANGE THESE IN PRODUCTION!
const ADMIN_CREDENTIALS = {
  username: "admin",
  email: "admin@hdas.com",
  password: "admin@123", // Change this password!
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check credentials against hardcoded values
    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: "admin-001",
        email: ADMIN_CREDENTIALS.email,
        role: "admin",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Admin response
    const adminResponse = {
      _id: "admin-001",
      username: ADMIN_CREDENTIALS.username,
      email: ADMIN_CREDENTIALS.email,
      role: "admin",
    };

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        admin: adminResponse,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to login" },
      { status: 500 }
    );
  }
}
