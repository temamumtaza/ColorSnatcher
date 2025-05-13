import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// For deployment, ensure NEXTAUTH_URL is set in environment variables
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

const secret = process.env.NEXTAUTH_SECRET || "FALLBACK_SECRET_KEY_CHANGE_THIS_IN_PRODUCTION"

export async function middleware(request: NextRequest) {
  // Skip public routes
  const publicPaths = [
    /^\/api\/auth\/.*$/,  // NextAuth API routes
    /^\/login(\/.*)?$/,   // Login pages
    /^\/register(\/.*)?$/, // Register pages
    /^\/((?!dashboard).*)$/  // All non-dashboard routes
  ];
  
  if (publicPaths.some(pattern => pattern.test(request.nextUrl.pathname))) {
    return NextResponse.next();
  }

  try {
    // Get the token using the same secret used in NextAuth
    const token = await getToken({ 
      req: request,
      secret: secret,
    })
  
    const isAuthenticated = !!token
    
    // If this is a dashboard route and user is not authenticated, redirect to login
    if (request.nextUrl.pathname.startsWith("/dashboard") && !isAuthenticated) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", request.url)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}

// Configuration to run middleware only on dashboard routes
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
} 