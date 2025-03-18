// src/app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isAdmin: { label: "Is Admin", type: "text" }
      },
      async authorize(credentials) {
        // Debug log to see what's in credentials
        console.log("🔍 Credentials received:", credentials);

        if (!credentials?.email || !credentials?.password) {
          console.error("❌ Missing credentials");
          return null;
        }

        // Access isAdmin directly from credentials
        const isAdminLogin = credentials.isAdmin === 'true';
        console.log("👤 Is Admin Login:", isAdminLogin);

        try {
          const endpoint = isAdminLogin
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/customers/login`;

          console.log("🔌 Calling API:", endpoint);

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
          });

          console.log("📡 API Response Status:", response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ API error response:", errorText);
            return null;
          }

          const responseData = await response.json();
          console.log("✅ API Response Success:", responseData.success);

          if (!responseData.success || !responseData.data?.token) {
            console.error("❌ Authentication failed:", responseData);
            return null;
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
          return null;
        }
      }
    }),
  ],
  // Rest of your NextAuth config remains the same
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
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/account/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development"
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };