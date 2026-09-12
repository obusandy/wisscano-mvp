import { Lock } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";

// Prevents Next.js from statically pre-rendering this page at build
// time. Auth-related pages should always render dynamically, since
// their behavior depends on runtime request/session state, and
// pre-rendering can execute client auth code in an environment where
// runtime configuration (e.g. NEXTAUTH_URL) isn't safely available.
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-slate-950">
            <Lock className="size-6 text-emerald-400" />
          </div>
          <h1 className="text-xl font-semibold text-slate-950">
            Admin sign in
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Wisscano service request dashboard
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
