import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === "ADMIN"
    const isUser = token?.role === "USER"
    const isAuthPage = req.nextUrl.pathname.startsWith("/login")

    // Redirect to login if not authenticated and not on auth page
    if (!token && !isAuthPage) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Redirect authenticated users away from login page
    if (token && isAuthPage) {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin", req.url))
      } else if (isUser) {
        return NextResponse.redirect(new URL("/user", req.url))
      }
    }

    // Protect admin routes
    if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/user", req.url))
    }

    // Protect user routes
    if (req.nextUrl.pathname.startsWith("/user") && !isUser) {
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
  matcher: ["/admin/:path*", "/user/:path*", "/login"]
}
