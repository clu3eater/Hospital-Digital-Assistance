import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Doctor from "@/lib/models/Doctor";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    await connect();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const hospitalId = decoded.hospitalId;

    const doctors = await Doctor.find({ hospitalId })
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        doctors,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fetch doctors error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}
