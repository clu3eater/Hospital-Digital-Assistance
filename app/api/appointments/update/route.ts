import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Appointment from "@/lib/models/Appointment";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function PUT(req: NextRequest) {
  try {
    await connect();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    jwt.verify(token, JWT_SECRET);

    const body = await req.json();
    const {
      appointmentId,
      status,
      notes,
      visitType,
      meetingUrl,
      preVisitQuestions,
      postVisitNotes,
      appointmentDate,
      appointmentTime,
    } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];
    const normalizedStatus = typeof status === "string" ? status.trim() : "";
    const statusProvided = normalizedStatus.length > 0;

    if (appointmentDate) {
      const parsedDate = new Date(appointmentDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid appointmentDate" },
          { status: 400 }
        );
      }
      updateData.appointmentDate = parsedDate;
    }

    if (appointmentTime !== undefined) {
      const trimmedTime = typeof appointmentTime === "string" ? appointmentTime.trim() : "";
      if (!trimmedTime) {
        return NextResponse.json(
          { error: "Invalid appointmentTime" },
          { status: 400 }
        );
      }
      updateData.appointmentTime = trimmedTime;
    }

    if (statusProvided) {
      if (!allowedStatuses.includes(normalizedStatus)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }
      updateData.status = normalizedStatus;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (visitType) {
      updateData.visitType = visitType === "telehealth" ? "telehealth" : "in_person";
    }

    if (meetingUrl !== undefined) {
      updateData.meetingUrl = meetingUrl ? String(meetingUrl).trim() : undefined;
    }

    if (Array.isArray(preVisitQuestions)) {
      updateData.preVisitQuestions = preVisitQuestions
        .filter((item: any) => item && typeof item.question === "string" && item.question.trim().length > 0)
        .map((item: any) => ({
          question: item.question.trim(),
          ...(item.answer && typeof item.answer === "string" ? { answer: item.answer.trim() } : {}),
        }));
    }

    if (postVisitNotes !== undefined) {
      updateData.postVisitNotes = postVisitNotes;
    }

    if ((updateData.appointmentDate || updateData.appointmentTime) && !statusProvided) {
      updateData.status = "pending";
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No update fields supplied" },
        { status: 400 }
      );
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    )
      .populate("patientId", "fullName email phone")
      .populate("hospitalId", "hospitalName")
      .populate("doctorId", "name specialization");

    if (!updatedAppointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Appointment updated successfully",
        appointment: updatedAppointment,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update appointment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update appointment" },
      { status: 500 }
    );
  }
}
