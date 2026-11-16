"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  {
    href: "/admin/dashboard",
    label: "Requests",
    // The request detail pages also belong to this tab
    match: ["/admin/dashboard", "/admin/requests"],
  },
  {
    href: "/admin/catalogue",
    label: "Products & Services",
    match: ["/admin/catalogue"],
  },
];

export function AdminNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav aria-label="Admin" className="border-t border-slate-100">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6">
        {LINKS.map((l) => {
          const active = l.match.some((m) => pathname.startsWith(m));
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition ${
                active
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-600 hover:text-slate-950"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}