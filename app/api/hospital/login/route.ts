import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Hospital from "@/lib/models/Hospital";
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

    // Find hospital by email
    const hospital = await Hospital.findOne({ email });
    if (!hospital) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, hospital.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        hospitalId: hospital._id,
        email: hospital.email,
        role: "hospital",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Hospital response without password
    const hospitalResponse = {
      _id: hospital._id,
      hospitalName: hospital.hospitalName,
      email: hospital.email,
      phone: hospital.phone,
      city: hospital.city,
      address: hospital.address,
      specialties: hospital.specialties,
      isVerified: hospital.isVerified,
    };

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        hospital: hospitalResponse,
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
