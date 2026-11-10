import { NextResponse } from "next/server";
import { loginUser } from "@/lib/db";

// In-memory rate limiting map for login attempts
// Key: `${clientIp}_${normalizedIdentifier}` -> { attempts: number, lockUntil: number, firstAttempt: number }
const loginAttemptMap = new Map();
const MAX_ATTEMPTS = 4;
const LOCKOUT_DURATION_MS = 2 * 60 * 1000; // 2 minutes

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown-ip";
}

function cleanExpiredEntries() {
  const now = Date.now();
  for (const [key, data] of loginAttemptMap.entries()) {
    if (data.lockUntil && now > data.lockUntil + 60000) {
      loginAttemptMap.delete(key);
    } else if (!data.lockUntil && now - data.firstAttempt > LOCKOUT_DURATION_MS * 2) {
      loginAttemptMap.delete(key);
    }
  }
}

export async function POST(request) {
  try {
    cleanExpiredEntries();

    const clientIp = getClientIp(request);
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request format" }, { status: 400 });
    }

    const { identifier, password } = body || {};

    if (!identifier || !password) {
      return NextResponse.json({ error: "Missing email/username or password." }, { status: 400 });
    }

    // Defensive control: Strictly enforce string inputs to prevent NoSQL operator injection
    if (typeof identifier !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid credentials format." }, { status: 400 });
    }

    const normalizedId = identifier.trim().toLowerCase();
    const rateLimitKey = `${clientIp}_${normalizedId}`;
    const now = Date.now();

    const attemptData = loginAttemptMap.get(rateLimitKey) || { attempts: 0, lockUntil: 0, firstAttempt: now };

    // Check if client is locked out
    if (attemptData.lockUntil && now < attemptData.lockUntil) {
      const remainingSec = Math.ceil((attemptData.lockUntil - now) / 1000);
      return NextResponse.json(
        {
          error: `Security Lockout: Account temporarily locked due to multiple failed login attempts. Please wait ${remainingSec} seconds before trying again.`,
          locked: true,
          remainingSeconds: remainingSec
        },
        {
          status: 429,
          headers: { "Retry-After": String(remainingSec) }
        }
      );
    }

    // Execute authentication
    const result = await loginUser(identifier, password);

    if (result.success) {
      // Clear rate limiting counter upon successful authentication
      loginAttemptMap.delete(rateLimitKey);
      return NextResponse.json(result);
    } else {
      // Increment failed attempt counter
      const newAttempts = attemptData.attempts + 1;
      const remainingAttempts = Math.max(0, MAX_ATTEMPTS - newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockUntil = now + LOCKOUT_DURATION_MS;
        loginAttemptMap.set(rateLimitKey, {
          attempts: newAttempts,
          lockUntil,
          firstAttempt: attemptData.firstAttempt || now
        });
        const remainingSec = Math.ceil(LOCKOUT_DURATION_MS / 1000);
        return NextResponse.json(
          {
            error: `Security Alert: 4 failed attempts reached. Login locked for 2 minutes.`,
            locked: true,
            remainingSeconds: remainingSec
          },
          {
            status: 429,
            headers: { "Retry-After": String(remainingSec) }
          }
        );
      } else {
        loginAttemptMap.set(rateLimitKey, {
          attempts: newAttempts,
          lockUntil: 0,
          firstAttempt: attemptData.firstAttempt || now
        });
        return NextResponse.json(
          {
            error: `${result.message || "Invalid credentials."} (${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining before 2-minute lockout)`,
            remainingAttempts
          },
          { status: 401 }
        );
      }
    }
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
