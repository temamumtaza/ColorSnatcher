import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: session.user?.id || null,
          name: session.user?.name || null,
          email: session.user?.email || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth status error:", error);
    return NextResponse.json(
      { error: "Failed to check authentication status" },
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