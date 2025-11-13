import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.appointmentId || !body.rating || !body.review) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Save review to database
    const review = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date(),
    }

    return NextResponse.json({ message: "Review submitted successfully", review }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}
