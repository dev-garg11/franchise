import { NextResponse } from "next/server";
import { loginUser } from "@/lib/db";

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Missing email/username or password" }, { status: 400 });
    }

    const result = await loginUser(identifier, password);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.message }, { status: 401 });
    }
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
