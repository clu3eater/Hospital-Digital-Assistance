import { type NextRequest, NextResponse } from "next/server"
import connect from "@/lib/db"
import Hospital from "@/lib/models/Hospital"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    await connect()

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const hospitalId = decoded.hospitalId
    if (!hospitalId) {
      return NextResponse.json({ error: "Invalid token: missing hospitalId" }, { status: 401 })
    }

    const hospital = await Hospital.findById(hospitalId).select("-password")
    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, hospital }, { status: 200 })
  } catch (error: any) {
    console.error("Get hospital settings error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connect()

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const hospitalId = decoded.hospitalId
    if (!hospitalId) {
      return NextResponse.json({ error: "Invalid token: missing hospitalId" }, { status: 401 })
    }

    const body = await request.json()
    const { hospitalName, phone, city, address, specialties } = body

    if (!hospitalName) {
      return NextResponse.json({ error: "Hospital name is required" }, { status: 400 })
    }

    const updateData: any = {}
    if (hospitalName) updateData.hospitalName = hospitalName
    if (phone) updateData.phone = phone
    if (city !== undefined) updateData.city = city
    if (address !== undefined) updateData.address = address
    if (specialties !== undefined) {
      // Handle comma-separated string or array
      updateData.specialties = Array.isArray(specialties)
        ? specialties
        : specialties.split(",").map((s: string) => s.trim()).filter((s: string) => s)
    }

    const updatedHospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      updateData,
      { new: true }
    ).select("-password")

    if (!updatedHospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        success: true,
        message: "Settings updated successfully",
        hospital: updatedHospital,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Update hospital settings error:", error)
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 })
  }
}
