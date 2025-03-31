'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * Component that redirects users based on their role after authentication
 * This component should be placed on pages that need role-based redirection
 */
export default function RedirectBasedOnRole({ 
  adminRedirectPath = '/admin/',
  customerRedirectPath = '/account/',
  defaultRedirectPath = '/',
  loadingComponent = null
}) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only redirect after authentication status is confirmed (not loading)
    if (status === 'authenticated') {
      // Check if user has an admin role
      if (session?.user?.role) {
        router.push(adminRedirectPath);
      } else {
        // Regular customer user
        router.push(customerRedirectPath);
      }
    } else if (status === 'unauthenticated') {
      // Redirect unauthenticated users to home
      router.push(defaultRedirectPath);
    }
  }, [session, status, router, adminRedirectPath, customerRedirectPath, defaultRedirectPath]);

  // Display loading state while checking authentication
  if (status === 'loading' || status === 'authenticated') {
    return loadingComponent || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-blue-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // This should not be displayed as the useEffect should redirect
  return null;
} 