import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Review from "@/lib/models/Review";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    await connect();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const patientId = decoded?.patientId;
    if (!patientId) {
      return NextResponse.json({ error: "Invalid token: missing patientId" }, { status: 401 });
    }

    const reviews = await Review.find({ patientId: new mongoose.Types.ObjectId(patientId) })
      .populate("hospitalId", "hospitalName city")
      .sort({ createdAt: -1 });

    const averageRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json(
      {
        success: true,
        reviews,
        averageRating,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fetch patient reviews error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
