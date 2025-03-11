// src/middleware.js

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get the token
  const token = await getToken({ req: request });
  
  // Define protected customer routes
  const customerProtectedRoutes = [
    '/account/profile',
    '/account/orders',
    '/cart',
    '/checkout',
  ];
  
  // Define admin routes that require admin authentication
  const adminProtectedRoutes = [
    '/admin/dashboard',
    // '/admin/products',
    // '/admin/orders',
    '/admin/customers',
  ];

  // Check if the path is a protected customer route
  const isCustomerProtectedRoute = customerProtectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the path is a protected admin route
  const isAdminProtectedRoute = adminProtectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Redirect logic for customer routes
  if (isCustomerProtectedRoute) {
    if (!token) {
      // Store the URL the user was trying to access
      const url = new URL('/account/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  // Redirect logic for admin routes
  if (isAdminProtectedRoute) {
    if (!token || token.role !== 'admin') {
      // Admin needs to login
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    '/account/:path*',
    '/admin/:path*',
    '/cart',
    '/checkout',
  ],
};