import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pool from "./lib/db";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("[Auth] Starting authorization for:", credentials?.username);
          
          if (!credentials?.username || !credentials?.password) {
            console.log("[Auth] Missing credentials");
            return null;
          }

          console.log("[Auth] Querying database...");
          const result = await pool.query(
            'SELECT id, username, name, location, role, "passwordHash" FROM users WHERE username = $1',
            [credentials.username]
          );

          if (result.rows.length === 0) {
            console.log("[Auth] User not found");
            return null;
          }

          const user = result.rows[0];
          console.log("[Auth] User found, verifying password...");
          
          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isValidPassword) {
            console.log("[Auth] Invalid password");
            return null;
          }

          console.log("[Auth] Authentication successful");
          return {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            location: user.location,
          };
        } catch (error) {
          console.error("[Auth] Error during authorization:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.location = (user as any).location;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.location = token.location as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname === "/login";

      if (isOnLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      return isLoggedIn;
    },
  },
};
