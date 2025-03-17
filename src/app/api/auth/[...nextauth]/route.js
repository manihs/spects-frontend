// src/app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          console.log("🟢 authorize() function called");
          console.log("Received Credentials:", credentials);

          const isAdminLogin = req.body && req.body.isAdmin === 'true';
          console.log("Is Admin Login:", isAdminLogin);

          const endpoint = isAdminLogin
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/customers/login`;

          console.log("Calling API:", endpoint);

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
          });

          console.log("API Response Status:", response.status);

          const responseData = await response.json();
          console.log("API Response Data:", responseData);

          if (!response.ok || !responseData.success || !responseData.data?.token) {
            console.error("❌ Authentication failed:", responseData);
            throw new Error(responseData.message || "Invalid credentials");
          }

          const userData = responseData.data;

          return {
            id: userData.customer?.id || userData.admin?.id || 'unknown',
            name: userData.customer?.firstName
              ? `${userData.customer.firstName} ${userData.customer.lastName}`
              : (userData.admin?.name || 'User'),
            email: credentials.email,
            role: isAdminLogin ? 'admin' : 'customer',
            token: userData.token
          };

        } catch (error) {
          console.error("🔥 Authentication error:", error.message);
          throw new Error(error.message || "Authentication failed");
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/account/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development"
};

// ✅ Export named handlers for App Router
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
