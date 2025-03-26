// src/app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

// if (!process.env.NEXTAUTH_SECRET) {
//   throw new Error("NEXTAUTH_SECRET environment variable is required");
// }

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text", placeholder: "admin (optional)" }
      },
      async authorize(credentials, req) {
        try {
          const { email, password, role } = credentials;
          
          if (!email || !password) {
            throw new Error("Email and password are required");
          }

          let loginUrl = `${process.env.NEXT_PUBLIC_API_URL || "https://api.vishvaopticalcompany.com" }/api/customers/login`;
          if (role === "admin") {
            loginUrl = `${process.env.NEXT_PUBLIC_API_URL || "https://api.vishvaopticalcompany.com"}/api/users/login`;
          }

          console.log("🌐 Sending login request to:", loginUrl);

          const response = await axios.post(loginUrl, { email, password });
          console.log("✅ Login API response:", response.data);

          if (response.data?.success && response.data?.data) {
            const user = {
              ...response.data.data.user,
              token: response.data.data.token,
            };

            if (response.data.data.user?.role) {
              user.role = response.data.data.user.role;
            }

            console.log("🎯 Authorized user:", user);
            return user;
          }

          console.warn("⚠️ Login failed or user data missing");
          return null;
        } catch (error) {
          console.error("❌ Authorization error:", error.response?.data || error.message, error.stack);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("🔄 JWT Callback - Before:", { token, user });

      if (user) {
        token.id = user.id;
        token.accessToken = user.token;
        token.email = user.email;
        if (user.role) {
          token.role = user.role;
        }
      }

      console.log("🔄 JWT Callback - After:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("📦 Session Callback - Before:", { session, token });

      if (session?.user) {
        session.user.id = token.id;
        session.accessToken = token.accessToken;
        session.email = token.email;
        if (token.role) {
          session.user.role = token.role;
        }
      }

      console.log("📦 Session Callback - After:", session);
      return session;
    },
  },
  pages: {},
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "tAPMi6CZzE5i9ji0wFIJ7MS60iMEVQNm/NKiWz5+umo=",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
