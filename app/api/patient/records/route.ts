import { NextRequest, NextResponse } from "next/server"
import connect from "@/lib/db"
import HealthRecord from "@/lib/models/HealthRecord"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(req: NextRequest) {
  try {
    await connect()

    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = jwt.verify(token, JWT_SECRET)
    const patientId = decoded.patientId

    const records = await HealthRecord.find({ patientId }).sort({ recordDate: -1, createdAt: -1 })

    return NextResponse.json({ success: true, records }, { status: 200 })
  } catch (error: any) {
    console.error("Fetch health records error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch records" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connect()

    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded: any = jwt.verify(token, JWT_SECRET)
    const patientId = decoded.patientId

    const body = await req.json()
    const { recordType, description, hospitalName, recordDate, fileUrl, fileName } = body

    if (!recordType || !description || !recordDate) {
      return NextResponse.json({ error: "Record type, description, and date are required" }, { status: 400 })
    }

    const newRecord = await HealthRecord.create({
      patientId,
      recordType,
      description,
      hospitalName: hospitalName || "",
      recordDate: new Date(recordDate),
      fileUrl: fileUrl?.trim?.() || undefined,
      fileName: fileName?.trim?.() || undefined,
    })

    return NextResponse.json({ message: "Record added", record: newRecord }, { status: 201 })
  } catch (error: any) {
    console.error("Create health record error:", error)
    return NextResponse.json({ error: error.message || "Failed to add record" }, { status: 500 })
  }
}
