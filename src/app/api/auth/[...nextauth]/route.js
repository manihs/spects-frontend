// src/app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from "axios"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text", placeholder: "admin (optional)" }
      },
      async authorize(credentials, req) {
        try {
          const { email, password, role } = credentials;

          // Default to customer login API
          let loginUrl = "http://localhost:3000/api/customers/login";

          // If role is explicitly "admin", use admin login API
          if (role === "admin") {
            loginUrl = "http://localhost:3000/api/users/login";
          }

          // Make Axios request
          const response = await axios.post(loginUrl, { email, password });

          if (response.data?.success && response.data?.data) {
            const user = {
              ...response.data.data.user,
              token: response.data.data.token,
            };

            // ✅ Add role only if it's present in the API response
            if (response.data.data.user?.role) {
              user.role = response.data.data.user.role;
            }

            return user;
          }

          return null;
        } catch (error) {
          console.error("Authorization error:", error.response?.data || error.message);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
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
  pages: {},
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
