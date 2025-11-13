import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Hospital from "@/lib/models/Hospital";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function PUT(req: NextRequest) {
  try {
    await connect();

    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    // Verify token (you can add admin role check here)
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { hospitalId, isVerified } = body;

    if (!hospitalId) {
      return NextResponse.json(
        { error: "Hospital ID is required" },
        { status: 400 }
      );
    }

    // Update hospital verification status
    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      { isVerified: isVerified !== false }, // Default to true if not specified
      { new: true }
    ).select("-password");

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Hospital ${isVerified ? "approved" : "unapproved"} successfully`,
        hospital,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Approve hospital error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update hospital status" },
      { status: 500 }
    );
  }
}
