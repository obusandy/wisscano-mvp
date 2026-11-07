import type { Metadata } from "next";
import { Cpu } from "lucide-react";

import { RequestForm } from "@/components/requests/request-form";
import { MobileNav } from "@/components/site/mobile-nav";

export const metadata: Metadata = {
  title: "Wisscano | Request a Service",
  description:
    "Tell Wisscano what your business needs, from ICT procurement and infrastructure to technical support.",
};

export default function HomePage() {
  return (
    <div className="relative isolate min-h-[100svh] flex flex-col justify-between overflow-x-hidden text-white selection:bg-blue-600 selection:text-white">
    

      {/* ---------- Main Form Focus (Fits Screen) ---------- */}
      <main id="main-content" className="flex-1 flex items-center justify-center py-2 px-4 sm:px-6 lg:px-8 w-full">
        <section
          id="request"
          aria-labelledby="request-form-heading"
          className="w-full max-w-7xl scroll-mt-24 bg-black/40 p-6 sm:p-10 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl"
        >
          {/* Unchanged authoritative form component */}
          <RequestForm />
        </section>
      </main>

      {/* ---------- Clean Glass Footer ---------- */}
      <footer className="border-t border-white/10 bg-black/50 backdrop-blur-lg text-white/70">
        <div className="mx-auto max-w-7xl px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-base font-bold tracking-tight text-white">
                wisscano<span className="text-blue-500">.</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-white/70 sm:justify-end">
              <p>&copy; {new Date().getFullYear()} Wisscano. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <p>MVP preview &middot; Technology needs.</p>
                <a
                  href="/admin"
                  className="rounded-md border border-white/15 bg-white/5 px-3 py-1 text-white/90 transition hover:border-blue-500/50 hover:text-blue-400"
                >
                  Admin
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}