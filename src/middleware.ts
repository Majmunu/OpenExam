import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === "ADMIN"
    const isStudent = token?.role === "STUDENT"
    const isAuthPage = req.nextUrl.pathname.startsWith("/login")

    // Redirect to login if not authenticated and not on auth page
    if (!token && !isAuthPage) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Redirect authenticated users away from login page
    if (token && isAuthPage) {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin", req.url))
      } else if (isStudent) {
        return NextResponse.redirect(new URL("/student", req.url))
      }
    }

    // Protect admin routes
    if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/student", req.url))
    }

    // Protect student routes
    if (req.nextUrl.pathname.startsWith("/student") && !isStudent) {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith("/login")
        return !!token || isAuthPage
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/login"]
}
