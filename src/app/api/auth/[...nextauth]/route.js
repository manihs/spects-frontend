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

          if (!response.data?.success || !response.data?.data) {
            throw new Error(response.data?.message || "Authentication failed");
          }

          const { user, token } = response.data.data;
          
          // Only return necessary user data
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || "customer",
            token
          };

        } catch (error) {
          console.error("Authentication error:", error.response?.data || error.message);
          throw new Error(error.response?.data?.message || "Authentication failed");
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Only store essential data in the token
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.token;
        token.email = user.email;
        if (user.role) {
          token.role = user.role;
        }
      }
     
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.accessToken = token.accessToken;
        session.email = token.email;
        if (token.role) {
          session.user.role = token.role;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/account/login',
    error: '/account/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "tAPMi6CZzE5i9ji0wFIJ7MS60iMEVQNm/NKiWz5+umo=",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
