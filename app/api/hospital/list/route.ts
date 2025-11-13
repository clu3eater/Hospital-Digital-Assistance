import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import Hospital from "@/lib/models/Hospital";

export async function GET(req: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const city = searchParams.get("city") || "";

    // Build query - Only show verified hospitals to patients
    const query: any = {
      isVerified: true, // Only approved/verified hospitals are visible
    };

    if (search) {
      query.$or = [
        { hospitalName: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    // Fetch hospitals
    const hospitals = await Hospital.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        hospitals,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fetch hospitals error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch hospitals" },
      { status: 500 }
    );
  }
}
