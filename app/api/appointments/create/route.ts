import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Appointment from "@/lib/models/Appointment";
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
    const { hospitalId, doctorId, appointmentDate, appointmentTime, reason } = body;

    if (!hospitalId || !doctorId || !appointmentDate || !appointmentTime || !reason) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const newAppointment = await Appointment.create({
      patientId,
      hospitalId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      reason,
      status: "pending",
    });

    const populatedAppointment = await Appointment.findById(newAppointment._id)
      .populate("patientId", "fullName email phone")
      .populate("hospitalId", "hospitalName address city")
      .populate("doctorId", "name specialization");

    return NextResponse.json(
      {
        message: "Appointment created successfully",
        appointment: populatedAppointment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create appointment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create appointment" },
      { status: 500 }
    );
  }
}
