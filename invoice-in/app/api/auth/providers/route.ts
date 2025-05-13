import { NextResponse } from "next/server";

// Return available auth providers
export async function GET() {
  return NextResponse.json({
    credentials: {
      id: "credentials",
      name: "Email & Password",
      type: "credentials",
    }
  });
}

// Also export other methods to avoid 405 errors
export async function HEAD() {
  return NextResponse.json({});
}

export async function OPTIONS() {
  return NextResponse.json({});
} 