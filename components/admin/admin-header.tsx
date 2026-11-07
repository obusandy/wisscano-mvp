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
    <img
      src="/images/logo.png"
      alt="Logo"
      className="size-9 rounded-lg object-contain"
    />
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
