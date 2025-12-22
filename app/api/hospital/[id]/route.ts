import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Hospital from "@/lib/models/Hospital";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    const { id } = await params;
    const hospital = await Hospital.findById(id).select("-password");

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        hospital,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fetch hospital error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch hospital" },
      { status: 500 }
    );
  }
}
