import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Patient from "@/lib/models/Patient";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connect();

    const body = await req.json();
    const { fullName, email, password, phone, dateOfBirth, allergies } = body;

    // Validate required fields
    if (!fullName || !email || !password || !phone || !dateOfBirth) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return NextResponse.json(
        { error: "Patient with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new patient
    const newPatient = await Patient.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      allergies: allergies || "",
    });

    // Remove password from response
    const patientResponse = {
      _id: newPatient._id,
      fullName: newPatient.fullName,
      email: newPatient.email,
      phone: newPatient.phone,
      dateOfBirth: newPatient.dateOfBirth,
      allergies: newPatient.allergies,
    };

    return NextResponse.json(
      {
        message: "Patient registered successfully",
        patient: patientResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register patient" },
      { status: 500 }
    );
  }
}
