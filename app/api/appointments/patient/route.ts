import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Appointment from "@/lib/models/Appointment";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function getPatientId(decoded: any) {
  return decoded?.patientId || decoded?._id || decoded?.id || decoded?.userId || null;
}

// Combine appointment date and time string (e.g. "10:30 AM") into a single Date for comparison
function combineDateTime(dateValue: Date, timeString: string) {
  const date = new Date(dateValue);
  const [timePart, meridiem] = (timeString || "").trim().split(" ");
  const [hoursStr, minutesStr] = (timePart || "00:00").split(":");

  let hours = parseInt(hoursStr || "0", 10);
  const minutes = parseInt(minutesStr || "0", 10);
  const upperMeridiem = (meridiem || "AM").toUpperCase();

  if (upperMeridiem === "PM" && hours !== 12) hours += 12;
  if (upperMeridiem === "AM" && hours === 12) hours = 0;

  date.setHours(hours, minutes, 0, 0);
  return date;
}

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

    const patientId = getPatientId(decoded);
    if (!patientId) {
      return NextResponse.json({ error: "Invalid token: missing patientId" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Convert to ObjectId for proper matching
    const patientObjId = new mongoose.Types.ObjectId(patientId);

    // Auto-complete past appointments based on date + time
    const now = new Date();
    const candidateAppointments = await Appointment.find({
      patientId: patientObjId,
      status: { $in: ["pending", "confirmed"] },
    });

    const toCompleteIds = candidateAppointments
      .filter((apt) => {
        const aptDateTime = combineDateTime(apt.appointmentDate, apt.appointmentTime);
        return aptDateTime < now;
      })
      .map((apt) => apt._id);

    if (toCompleteIds.length > 0) {
      await Appointment.updateMany({ _id: { $in: toCompleteIds } }, { $set: { status: "completed" } });
    }

    const query: any = { patientId: patientObjId };
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate("hospitalId", "hospitalName address city phone")
      .populate("doctorId", "name specialization")
      .sort({ appointmentDate: -1 });

    return NextResponse.json(
      {
        success: true,
        appointments,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fetch patient appointments error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
