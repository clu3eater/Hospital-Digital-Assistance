import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Hospital from "@/lib/models/Hospital";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const verificationStatus = searchParams.get("status"); // 'verified', 'unverified', or 'all'

    // Build query
    const query: any = {};
    
    if (verificationStatus === "verified") {
      query.isVerified = true;
    } else if (verificationStatus === "unverified") {
      query.isVerified = false;
    }
    // If 'all' or no status, don't filter by verification

    // Fetch all hospitals (for admin)
    const hospitals = await Hospital.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    const stats = {
      total: hospitals.length,
      verified: hospitals.filter(h => h.isVerified).length,
      unverified: hospitals.filter(h => !h.isVerified).length,
    };

    return NextResponse.json(
      {
        success: true,
        hospitals,
        stats,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fetch all hospitals error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch hospitals" },
      { status: 500 }
    );
  }
}
