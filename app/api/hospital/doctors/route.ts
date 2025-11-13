import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || !body.specialty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const doctor = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date(),
    }

    return NextResponse.json({ message: "Doctor added successfully", doctor }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add doctor" }, { status: 500 })
  }
}
