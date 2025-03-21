'use client';

import "./globals.css";
import { SessionProvider } from 'next-auth/react';
import { UserProvider } from '@/context/userContext';
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
         
            <SessionProvider>
              <UserProvider>
              {children}
              </UserProvider>
            </SessionProvider>
      </body>
    </html>
  );
}