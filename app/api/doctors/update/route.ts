import { NextRequest, NextResponse } from "next/server"
import connect from "@/lib/db"
import Doctor from "@/lib/models/Doctor"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function PUT(req: NextRequest) {
  try {
    await connect()

    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = jwt.verify(token, JWT_SECRET)
    const hospitalId = decoded.hospitalId

    const body = await req.json()
    const { doctorId, name, specialization, qualification, experience, email, phone, availability, isActive } = body

    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID is required" }, { status: 400 })
    }

    const updateData: any = {}

    if (name) updateData.name = name
    if (specialization) updateData.specialization = specialization
    if (qualification) updateData.qualification = qualification
    if (experience !== undefined) updateData.experience = Number(experience) || 0
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (Array.isArray(availability)) {
      updateData.availability = availability
    }
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No update fields supplied" }, { status: 400 })
    }

    const updatedDoctor = await Doctor.findOneAndUpdate({ _id: doctorId, hospitalId }, updateData, { new: true })

    if (!updatedDoctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Doctor updated successfully", doctor: updatedDoctor }, { status: 200 })
  } catch (error: any) {
    console.error("Update doctor error:", error)
    return NextResponse.json({ error: error.message || "Failed to update doctor" }, { status: 500 })
  }
}