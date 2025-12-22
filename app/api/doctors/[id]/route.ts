import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Doctor from "@/lib/models/Doctor";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    const { id } = await params;
    const doctors = await Doctor.find({ hospitalId: id, isActive: true })
      .select("-__v");

    return NextResponse.json(
      {
        success: true,
        doctors,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fetch doctors error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}
