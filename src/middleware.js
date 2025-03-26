import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";

// Centralized route configuration
const ROUTE_CONFIG = {
  adminRoutes: ['/admin'],
  customerRoutes: ['/account', '/orders'],
  authRoutes: [
    '/account/login',
    '/account/register',
    '/admin/login'
  ],
  publicRoutes: [
    '/',
    '/products',
    '/about-us',
    '/contact-us',
    '/brands'
  ]
};

export async function middleware(request) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Logging for debugging (remove in production)
  console.log('Current Path:', pathname);
  console.log('Current Token:', token ? {
    role: token.role,
    email: token.email
  } : 'No Token');

  // Helper function to check route matching
  const matchesRoute = (routes, path) => 
    routes.some(route => path.startsWith(route));

  // Determine route types
  const isAdminRoute = matchesRoute(ROUTE_CONFIG.adminRoutes, pathname);
  const isCustomerRoute = matchesRoute(ROUTE_CONFIG.customerRoutes, pathname);
  const isAuthRoute = matchesRoute(ROUTE_CONFIG.authRoutes, pathname);
  const isPublicRoute = matchesRoute(ROUTE_CONFIG.publicRoutes, pathname);

  // Authentication bypass for public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Handle authentication routes
  if (isAuthRoute) {
    // Redirect authenticated users based on their role
    if (token) {
      const redirectUrl = token.role === 'ADMIN' 
        ? new URL('/admin', request.url)
        : new URL('/account/profile', request.url);
      
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    return NextResponse.next();
  }

  // Protect customer routes
  if (isCustomerRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/account/login', request.url));
    }
    
    if (token.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Default: allow access if no specific rules match
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude API routes, static files, and specific file types
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};