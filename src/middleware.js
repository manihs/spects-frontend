import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";

// Centralized route configuration
const ROUTE_CONFIG = {
  adminRoutes: ['/admin'],
  customerRoutes: ['/account'],
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
    '/brands',
    '/api/auth' // Don't block NextAuth API routes
  ]
};

export async function middleware(request) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // For debugging (remove in production)
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

  // Allow public routes and API routes
  if (isPublicRoute || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Handle authentication routes (login/register)
  if (isAuthRoute) {
    // Redirect authenticated users based on their role
    if (token) {
      if (pathname.startsWith('/admin/login') && token.role === 'ADMIN') {
        // Admin users trying to access admin login - redirect to admin dashboard
        return NextResponse.redirect(new URL('/admin/', request.url));
      } else if (pathname.startsWith('/account/login') || pathname.startsWith('/account/register')) {
        // Regular users trying to access customer login - redirect to customer dashboard
        return NextResponse.redirect(new URL('/account/', request.url));
      }
    }
    return NextResponse.next();
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    if (token.role !== 'ADMIN') {
      // If user is authenticated but not an admin
      return NextResponse.redirect(new URL('/account/', request.url));
    }
    return NextResponse.next();
  }

  // Protect customer routes
  if (isCustomerRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/account/login', request.url));
    }
    
    // If the user is an admin, they can still access customer routes
    // This allows admins to view the customer experience
    return NextResponse.next();
  }

  // Default: allow access if no specific rules match
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude static files and specific file types
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};