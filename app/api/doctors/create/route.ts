import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Doctor from "@/lib/models/Doctor";
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
    const hospitalId = decoded.hospitalId;

    const body = await req.json();
    const { name, specialization, qualification, experience, email, phone, availability } = body;

    if (!name || !specialization || !qualification || !email || !phone) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const newDoctor = await Doctor.create({
      hospitalId,
      name,
      specialization,
      qualification,
      experience: experience || 0,
      email,
      phone,
      availability: availability || [],
      isActive: true,
    });

    return NextResponse.json(
      {
        message: "Doctor added successfully",
        doctor: newDoctor,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create doctor error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add doctor" },
      { status: 500 }
    );
  }
}
