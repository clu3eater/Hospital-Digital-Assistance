import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Appointment from "@/lib/models/Appointment";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid appointment ID" }, { status: 400 });
    }

    const appointment = await Appointment.findById(id)
      .populate("patientId", "fullName email phone")
      .populate("hospitalId", "hospitalName address city phone")
      .populate("doctorId", "name specialization qualification");

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Verify the requester has access to this appointment
    const patientId = decoded.patientId;
    const hospitalId = decoded.hospitalId;

    const isPatient = patientId && appointment.patientId?._id?.toString() === patientId;
    const isHospital = hospitalId && appointment.hospitalId?._id?.toString() === hospitalId;

    if (!isPatient && !isHospital) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(
      {
        success: true,
        appointment,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fetch appointment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}
