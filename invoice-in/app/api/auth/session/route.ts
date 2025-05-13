import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Handle all session requests
export async function GET() {
  try {
    // Log environment for debugging
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Secret exists:", !!process.env.NEXTAUTH_SECRET);
    
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (sessionError) {
      console.error("Session fetch error:", sessionError);
      return NextResponse.json(
        { error: "Internal session error", details: sessionError instanceof Error ? sessionError.message : String(sessionError) },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      authenticated: !!session,
      session,
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Also export other methods to avoid 405 errors
export async function HEAD() {
  return NextResponse.json({});
}

export async function OPTIONS() {
  return NextResponse.json({});
}

export async function POST() {
  return NextResponse.json({});
} 