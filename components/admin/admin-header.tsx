import { Shield } from "lucide-react";
import { SignOutButton } from "@/components/admin/sign-out-button";

export function AdminHeader({
  adminName,
  adminEmail,
}: {
  adminName: string;
  adminEmail: string;
}) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-slate-950 text-emerald-400">
            <Shield className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Wisscano Admin
            </p>
            <p className="text-xs text-slate-500">{adminEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">Hi, {adminName}</span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
