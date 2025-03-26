import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Define protected routes
  const adminRoutes = ['/admin'];
  const customerRoutes = ['/account', '/orders'];
  const authRoutes = [
    '/account/login',
    '/account/register',
    '/admin/login'
  ];
  const publicRoutes = [
    '/',
    '/products',
    '/about-us',
    '/contact-us',
    '/brands'
  ];

  // Check if the current path starts with any protected route
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isCustomerRoute = customerRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Handle auth routes first (login/register)
  if (isAuthRoute) {
    // If user is already logged in, redirect based on their role
    if (token) {
      if (token.role) {
        // Admin users go to admin dashboard
        return NextResponse.redirect(new URL('/admin', request.url));
      } else {
        // Regular customers go to their profile
        return NextResponse.redirect(new URL('/profile', request.url));
      }
    }
    // If not logged in, allow access to auth routes
    return NextResponse.next();
  }

  // Handle admin routes
  if (isAdminRoute) {
    if (!token) {
      // Redirect to admin login if not authenticated
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check if user has admin role
    if (!token.role) {
      // Redirect to home if not an admin
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }

  // Handle customer routes
  if (isCustomerRoute) {
    if (!token) {
      // Redirect to customer login if not authenticated
      return NextResponse.redirect(new URL('/account/loginss', request.url));
    }

    // If user is admin trying to access customer routes, redirect to admin dashboard
    if (token.role) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
  }

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For any other route, allow access
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 