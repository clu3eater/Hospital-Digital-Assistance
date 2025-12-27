import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Appointment from "@/lib/models/Appointment";
import Doctor from "@/lib/models/Doctor";
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

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const hospitalIdString = decoded.hospitalId;

    console.log("Dashboard stats - hospitalId from JWT:", hospitalIdString);

    // Convert to ObjectId for proper matching (consistent with other routes)
    const hospitalId = new mongoose.Types.ObjectId(hospitalIdString);

    // Get appointment counts
    const [pending, confirmed, completed, totalAppointments] = await Promise.all([
      Appointment.countDocuments({ hospitalId, status: "pending" }),
      Appointment.countDocuments({ hospitalId, status: "confirmed" }),
      Appointment.countDocuments({ hospitalId, status: "completed" }),
      Appointment.countDocuments({ hospitalId }),
    ]);

    console.log("Dashboard stats counts:", { pending, confirmed, completed, totalAppointments });

    // Get doctor count
    const doctors = await Doctor.countDocuments({ hospitalId, isActive: true });

    // Get average rating
    const reviews = await Review.find({ hospitalId });
    const averageRating = reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

    return NextResponse.json(
      {
        success: true,
        stats: {
          pending,
          confirmed,
          completed,
          totalAppointments,
          doctors,
          averageRating,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
