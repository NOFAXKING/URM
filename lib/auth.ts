import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations";

// There is exactly one administrator account, sourced entirely from
// environment variables. It is never persisted in the database.
// The password is hashed with bcrypt before comparison so the plaintext
// value from the env var is never compared directly.
async function verifyAdminCredentials(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD are not configured");
  }

  if (email.toLowerCase() !== adminEmail.toLowerCase()) {
    return false;
  }

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  return bcrypt.compare(password, hashedAdminPassword);
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Administrator",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const isValid = await verifyAdminCredentials(
          parsed.data.email,
          parsed.data.password
        );
        if (!isValid) return null;

        return {
          id: "admin",
          email: parsed.data.email,
          name: "Administrator",
          role: "ADMIN",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
