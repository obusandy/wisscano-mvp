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
    </div>
  );
}