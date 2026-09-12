import type { DefaultSession } from "next-auth";

/**
 * Extends NextAuth's built-in types to include our custom fields
 * (id, role) on the session and JWT. Without this augmentation,
 * TypeScript has no knowledge of these fields and every access
 * to session.user.id would be a type error.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
