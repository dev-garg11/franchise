import { NextResponse } from "next/server";
import { getLogs, createLog, deleteLog, clearLogs } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const panel = searchParams.get("panel") || "all";
    const userEmail = searchParams.get("userEmail") || "";
    const search = searchParams.get("search") || "";
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const logs = await getLogs({ panel, userEmail, search, limit: "10000" });
    const total = logs.length;

    if (pageParam !== null || limitParam !== null) {
      const page = Math.max(1, parseInt(pageParam || "1", 10));
      const limit = Math.max(1, parseInt(limitParam || "10", 10));
      const start = (page - 1) * limit;
      const paginatedData = logs.slice(start, start + limit);
      const totalPages = Math.ceil(total / limit) || 1;

      return NextResponse.json({
        data: paginatedData,
        total,
        page,
        limit,
        totalPages
      });
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET /api/logs error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { panel, action, description, userEmail, userName, role, targetId, targetType, details } = body;

    if (!panel || !action || !description) {
      return NextResponse.json({ error: "Missing required fields: panel, action, description" }, { status: 400 });
    }

    const log = await createLog({
      panel,
      action,
      description,
      userEmail,
      userName,
      role,
      targetId,
      targetType,
      details
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("POST /api/logs error:", error);
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll") === "true";
    const panel = searchParams.get("panel");
    const userEmail = searchParams.get("userEmail");

    if (id) {
      const deleted = await deleteLog(id);
      return NextResponse.json({ success: deleted });
    }

    if (clearAll) {
      const deletedCount = await clearLogs(panel, userEmail);
      return NextResponse.json({ success: true, deletedCount });
    }

    return NextResponse.json({ error: "Specify id or clearAll=true" }, { status: 400 });
  } catch (error) {
    console.error("DELETE /api/logs error:", error);
    return NextResponse.json({ error: "Failed to delete logs" }, { status: 500 });
  }
}
