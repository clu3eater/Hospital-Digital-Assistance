import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Review from "@/lib/models/Review";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    await connect();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const patientId = decoded.patientId;

    const body = await req.json();
    const { hospitalId, rating, comment } = body;

    if (!hospitalId || !rating || !comment) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const newReview = await Review.create({
      patientId,
      hospitalId,
      rating,
      comment,
    });

    const populatedReview = await Review.findById(newReview._id)
      .populate("patientId", "fullName")
      .populate("hospitalId", "hospitalName");

    return NextResponse.json(
      {
        message: "Review submitted successfully",
        review: populatedReview,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}
