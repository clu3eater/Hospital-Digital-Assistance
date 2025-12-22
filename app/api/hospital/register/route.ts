import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Hospital from "@/lib/models/Hospital";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connect();

    const body = await req.json();
    const { hospitalName, email, password, confirmPassword, phone, city, address, specialties } = body;

    // Validate required fields
    if (!hospitalName || !email || !password || !phone || !address) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Check if hospital already exists
    const existingHospital = await Hospital.findOne({ email });
    if (existingHospital) {
      return NextResponse.json(
        { error: "Hospital with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse specialties (comma-separated string to array)
    const specialtiesArray = specialties
      ? specialties.split(",").map((s: string) => s.trim()).filter((s: string) => s)
      : [];

    // Create new hospital (starts unverified; admin must approve)
    const newHospital = await Hospital.create({
      hospitalName,
      email,
      password: hashedPassword,
      phone,
      city: city || "",
      address,
      specialties: specialtiesArray,
      isVerified: false,
    });

    // Remove password from response
    const hospitalResponse = {
      _id: newHospital._id,
      hospitalName: newHospital.hospitalName,
      email: newHospital.email,
      phone: newHospital.phone,
      city: newHospital.city,
      address: newHospital.address,
      specialties: newHospital.specialties,
      isVerified: newHospital.isVerified,
    };

    return NextResponse.json(
      {
        message: "Hospital registered successfully",
        hospital: hospitalResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register hospital" },
      { status: 500 }
    );
  }
}
