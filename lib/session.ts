import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

/**
 * Returns the current admin session, or null if not authenticated.
 * Use this when you want to handle the "no session" case yourself.
 */
export async function getAdminSession() {
  return getServerSession(authOptions);
}

/**
 * Returns the current admin session, or redirects to login if absent.
 * This is our second line of defense (see proxy.ts for the first) —
 * even if the edge-level guard were ever bypassed or misconfigured,
 * no protected page will render without a valid, verified session.
 */
export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return session;
}
