import type { Metadata } from "next";
import { ArrowUpRight, Check, Cpu } from "lucide-react";

import { RequestForm } from "@/components/requests/request-form";

export const metadata: Metadata = {
  title: "Wisscano | Request a Service",
  description:
    "Tell Wisscano what your business needs, from ICT procurement and infrastructure to technical support.",
};

const steps = [
  {
    number: "01",
    title: "Share your requirements",
    description:
      "Choose a service and tell us what you need. A little context goes a long way.",
  },
  {
    number: "02",
    title: "We review the details",
    description:
      "The team reviews your request and identifies the right next steps.",
  },
  {
    number: "03",
    title: "Let's move things forward",
    description:
      "We follow up using your preferred contact method to discuss your requirements.",
  },
];

export default function HomePage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#f6f8fa] text-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 -top-48 -z-10 size-[650px] rounded-full bg-emerald-100/70 blur-3xl"
      />

      <header className="border-b border-slate-200/70 bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <a
            href="/"
            aria-label="Wisscano home"
            className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-emerald-400">
              <Cpu aria-hidden="true" className="size-6" />
            </span>

            <span className="text-2xl font-bold tracking-tight text-slate-950">
              wisscano<span className="text-emerald-600">.</span>
            </span>
          </a>

          <nav
            aria-label="Main navigation"
            className="flex items-center gap-6"
          >
            <a
              href="#how-it-works"
              className="hidden text-sm font-medium text-slate-600 transition hover:text-emerald-700 sm:inline"
            >
              How it works
            </a>

            <a
              href="#request"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              Make a request
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="lg:pt-5">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold tracking-wide text-emerald-800">
              <span className="size-1.5 rounded-full bg-emerald-600" />
              YOUR TECHNOLOGY. OUR FOCUS.
            </div>

            <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-6xl">
              Big plans.
              <br />
              Better technology.
              <br />
              <span className="text-emerald-600">Start here.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              From sourcing the right hardware to keeping your business
              connected, tell us what you need. Wisscano helps you take
              the next step.
            </p>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Check
                  aria-hidden="true"
                  className="size-4 text-emerald-600"
                />
                No account needed
              </span>
              <span className="inline-flex items-center gap-2">
                <Check
                  aria-hidden="true"
                  className="size-4 text-emerald-600"
                />
                Clear request confirmation
              </span>
            </div>

            <section
              id="how-it-works"
              aria-labelledby="how-it-works-heading"
              className="mt-10 scroll-mt-8 rounded-3xl bg-slate-950 p-6 text-white sm:p-8"
            >
              <div className="mb-7 flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">
                    Simple by design
                  </p>
                  <h2
                    id="how-it-works-heading"
                    className="mt-2 text-xl font-medium tracking-tight"
                  >
                    One request. A clear next step.
                  </h2>
                </div>

                <ArrowUpRight
                  aria-hidden="true"
                  className="size-6 shrink-0 text-emerald-400"
                />
              </div>

              <ol className="space-y-6">
                {steps.map((step) => (
                  <li key={step.number} className="flex gap-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-medium text-emerald-300">
                      {step.number}
                    </span>

                    <div>
                      <h3 className="text-sm font-medium text-white">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-slate-400">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section
            id="request"
            aria-labelledby="request-form-heading"
            className="scroll-mt-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.2)]"
          >
            <RequestForm />
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>Wisscano · Service request portal</p>
          <p>MVP preview · Built around your technology needs.</p>
        </div>
      </footer>
    </div>
  );
}
