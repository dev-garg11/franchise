import { NextResponse } from "next/server";
import { getAdmins } from "@/lib/db";

export async function GET() {
  try {
    const admins = await getAdmins();
    return NextResponse.json(admins);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}
