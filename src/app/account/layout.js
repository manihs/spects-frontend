// app/account/layout.js - Customer account layout
// import { CustomerSidebar } from '@/components/account';
import { useSession } from 'next-auth/react';
// import { redirect } from 'next/navigation';

export default function AccountLayout({ children }) {
  // const { data: session, status } = useSession();
  
  // If this is not a login/register page and user isn't signed in, redirect
  // This is a client-side check in addition to the middleware
  
  return (
    <div className="account-layout">
      {/* <CustomerSidebar /> */}
      <main>{children}</main>
    </div>
  );
}