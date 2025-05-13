import { NextResponse } from "next/server";

// Handle NextAuth logging
export async function POST(request: Request) {
  try {
    // Just allow logging but don't do anything with it
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Log error:", error);
    return NextResponse.json(
      { error: "Failed to log" },
      { status: 500 }
    );
  }
}

// Also export other methods to avoid 405 errors
export async function GET() {
  return NextResponse.json({});
}

export async function HEAD() {
  return NextResponse.json({});
}

export async function OPTIONS() {
  return NextResponse.json({});
} 