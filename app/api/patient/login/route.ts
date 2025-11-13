import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Patient from "@/lib/models/Patient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    await connect();

    const body = await req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find patient by email
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, patient.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        patientId: patient._id,
        email: patient.email,
        role: "patient",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Patient response without password
    const patientResponse = {
      _id: patient._id,
      fullName: patient.fullName,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      allergies: patient.allergies,
    };

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        patient: patientResponse,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to login" },
      { status: 500 }
    );
  }
}
