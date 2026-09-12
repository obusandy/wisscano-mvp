import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { loginSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rateLimit";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hour session
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        // Malformed input — same generic failure as wrong credentials.
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        // Rate limit brute-force attempts against a single email,
        // independent of IP (protects against distributed attempts too).
        const { allowed } = checkRateLimit(`login:${email}`, {
          windowMs: 15 * 60 * 1000,
          maxRequests: 5,
        });

        if (!allowed) {
          throw new Error(
            "Too many login attempts. Please try again in 15 minutes."
          );
        }

        await connectDB();

        // passwordHash has `select: false` in the schema — must explicitly
        // request it here, since we need it to verify the password.
        const admin = await Admin.findOne({ email }).select("+passwordHash");

        // IMPORTANT: return null for BOTH "no such admin" and "wrong
        // password" — never reveal which case occurred. Returning a
        // different result for each would let an attacker enumerate
        // valid admin emails.
        if (!admin) {
          return null;
        }

        const isValid = await admin.comparePassword(password);
        if (!isValid) {
          return null;
        }

        return {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
