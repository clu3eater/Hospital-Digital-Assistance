import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Appointment from "@/lib/models/Appointment";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
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

    const patientId = decoded.patientId;
    if (!patientId) {
      return NextResponse.json({ error: "Invalid token: missing patientId" }, { status: 401 });
    }

    const body = await req.json();
    const {
      hospitalId,
      doctorId,
      appointmentDate,
      appointmentTime,
      reason,
      visitType,
      meetingUrl,
      preVisitQuestions,
    } = body;

    if (!hospitalId || !doctorId || !appointmentDate || !appointmentTime || !reason) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const normalizedVisitType = visitType === "telehealth" ? "telehealth" : "in_person";

    const sanitizedPreVisit = Array.isArray(preVisitQuestions)
      ? preVisitQuestions
          .filter((item: any) => item && typeof item.question === "string" && item.question.trim().length > 0)
          .map((item: any) => ({
            question: item.question.trim(),
            ...(item.answer && typeof item.answer === "string" ? { answer: item.answer.trim() } : {}),
          }))
      : undefined;

    const newAppointment = await Appointment.create({
      patientId: new mongoose.Types.ObjectId(patientId),
      hospitalId: new mongoose.Types.ObjectId(hospitalId),
      doctorId: new mongoose.Types.ObjectId(doctorId),
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      reason,
      status: "pending",
      visitType: normalizedVisitType,
      meetingUrl: meetingUrl ? String(meetingUrl).trim() : undefined,
      preVisitQuestions: sanitizedPreVisit,
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
