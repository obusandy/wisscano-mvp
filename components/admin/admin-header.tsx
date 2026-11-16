import { SignOutButton } from "@/components/admin/sign-out-button";
import { AdminNav } from "./admin-nav";

export function AdminHeader({
  adminName,
  adminEmail,
}: {
  adminName: string;
  adminEmail: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="Logo"
            className="size-9 shrink-0 rounded-lg object-contain"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950">Wisscano Admin</p>
            <p className="hidden truncate text-xs text-slate-500 sm:block">{adminEmail}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm font-medium text-slate-600 hover:text-blue-700 sm:inline"
          >
            View site
          </a>
          <span className="hidden text-sm text-slate-600 md:inline">Hi, {adminName}</span>
          <SignOutButton />
        </div>
      </div>

      <AdminNav />
    </header>
  );
}