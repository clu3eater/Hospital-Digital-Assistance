import { NextRequest, NextResponse } from "next/server"
import connect from "@/lib/db"
import Doctor from "@/lib/models/Doctor"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function DELETE(req: NextRequest) {
  try {
    await connect()

    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = jwt.verify(token, JWT_SECRET)
    const hospitalId = decoded.hospitalId

    const { searchParams } = new URL(req.url)
    const doctorId = searchParams.get("doctorId")

    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID is required" }, { status: 400 })
    }

    const deleted = await Doctor.findOneAndDelete({ _id: doctorId, hospitalId })

    if (!deleted) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Doctor removed successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Delete doctor error:", error)
    return NextResponse.json({ error: error.message || "Failed to delete doctor" }, { status: 500 })
  }
}