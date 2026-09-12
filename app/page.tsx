import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Building2,
  Camera,
  Check,
  Cloud,
  Cpu,
  Headset,
  Network,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

import { RequestForm } from "@/components/requests/request-form";
import { MobileNav } from "@/components/site/mobile-nav";

export const metadata: Metadata = {
  title: "Wisscano | Request a Service",
  description:
    "Tell Wisscano what your business needs, from ICT procurement and infrastructure to technical support.",
};

// Presentational only — curated highlights of Wisscano's real service
// lines for the marketing page. The live, authoritative category list
// still comes from the database inside <RequestForm />; this section
// is not a source of truth and does not need to list every category.
const services = [
  {
    title: "IT Support",
    description: "General technical support and day-to-day troubleshooting.",
    Icon: Headset,
  },
  {
    title: "Network Deployment",
    description: "Routers, switches, access points, and structured cabling.",
    Icon: Network,
  },
  {
    title: "Cloud Services",
    description: "Migration, hosting, hybrid cloud, and backup.",
    Icon: Cloud,
  },
  {
    title: "CCTV Installation",
    description: "Surveillance, access control, and biometrics.",
    Icon: Camera,
  },
  {
    title: "Device Servicing",
    description: "Computer, laptop, and printer repair & maintenance.",
    Icon: Wrench,
  },
  {
    title: "Cybersecurity Services",
    description: "Security software, firewalls, and threat protection.",
    Icon: ShieldCheck,
  },
  {
    title: "Technology Consulting",
    description: "Strategic IT and technology advisory.",
    Icon: Building2,
  },
  {
    title: "ICT Procurement",
    description: "Sourcing hardware and equipment from trusted brands.",
    Icon: Boxes,
    featured: true,
  },
];

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
      "A real person on our team reads every request and identifies the right next step.",
  },
  {
    number: "03",
    title: "We follow up",
    description:
      "We reach out using your preferred contact method to move things forward.",
  },
];

const values = [
  {
    title: "Single point of contact",
    description:
      "One request, one team coordinating hardware, networking, and support.",
  },
  {
    title: "Multi-vendor sourcing",
    description:
      "Access to established hardware brands without managing multiple vendors yourself.",
  },
  {
    title: "Personally reviewed",
    description:
      "Every request is read by a person before follow-up — not just routed automatically.",
  },
  {
    title: "Flexible engagement",
    description:
      "One-off support or ongoing managed service, depending on what you need.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Skip link for keyboard/screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-slate-950 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a
            href="/"
            aria-label="Wisscano home"
            className="flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-slate-950 text-emerald-400">
              <Cpu aria-hidden="true" className="size-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-950">
              wisscano<span className="text-emerald-600">.</span>
            </span>
          </a>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-8 sm:flex"
          >
            <a
              href="#services"
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
            >
              Services
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
            >
              How it works
            </a>
            <a
              href="#request"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              Make a request
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </nav>

          <MobileNav />
        </div>
      </header>

      <main id="main-content">
        {/* ---------- Hero + Sticky Form ---------- */}
        <section className="relative overflow-hidden">
          {/* Decorative background: dot grid + soft gradient blobs.
              Pure literal values — no dependency on custom CSS
              variables, so this renders correctly regardless of
              theme-token setup. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(16,185,129,0.14)_1px,transparent_0)] bg-[length:26px_26px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-40 -top-40 -z-10 size-[550px] rounded-full bg-emerald-100/60 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 top-20 -z-10 size-[420px] rounded-full bg-teal-100/50 blur-3xl"
          />

          <div className="mx-auto max-w-6xl px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:pb-24 lg:pt-20">
            <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              {/* Left: headline & value props */}
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-800">
                  <Sparkles aria-hidden="true" className="size-3.5" />
                  IT INFRASTRUCTURE & PROCUREMENT
                </div>

                <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                  Big plans.
                  <br />
                  Better technology.
                  <br />
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    Start here.
                  </span>
                </h1>

                <p className="mt-6 max-w-md text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                  From sourcing the right hardware to keeping your business
                  connected, tell us what you need. Wisscano helps you take
                  the next step.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#request"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Submit a request
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </a>
                  <a
                    href="#services"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    View services
                  </a>
                </div>

                <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
                  {[
                    "No account needed",
                    "Personally reviewed",
                    "Clear confirmation on submit",
                  ].map((item) => (
                    <li key={item} className="inline-flex items-center gap-2">
                      <Check
                        aria-hidden="true"
                        className="size-4 text-emerald-600"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: sticky request form */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <section
                  id="request"
                  aria-labelledby="request-form-heading"
                  className="scroll-mt-24 rounded-[28px] bg-gradient-to-br from-emerald-200 via-slate-200 to-teal-200 p-[1.5px] shadow-[0_30px_90px_-30px_rgba(15,23,42,0.35)]"
                >
                  <div className="overflow-hidden rounded-[26px] bg-white">
                    <RequestForm />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Services Showcase ---------- */}
        <section
          id="services"
          aria-labelledby="services-heading"
          className="scroll-mt-24 border-t border-slate-200 bg-slate-50/60"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="mb-10 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                What we handle
              </p>
              <h2
                id="services-heading"
                className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
              >
                Popular services
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                A snapshot of what businesses ask us for most. The request
                form has the full, current list of services to choose from.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {services.map(({ title, description, Icon, featured }) => (
                <div
                  key={title}
                  className={`group rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${
                    featured
                      ? "border-emerald-300 bg-emerald-50/70"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span
                    className={`flex size-10 items-center justify-center rounded-xl transition group-hover:scale-105 ${
                      featured
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-slate-950">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-5 text-slate-600">
                    {description}
                  </p>
                  {featured && (
                    <span className="mt-3 inline-block rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Core service
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- How It Works (dark section) ---------- */}
        <section
          id="how-it-works"
          aria-labelledby="how-it-works-heading"
          className="scroll-mt-24 bg-slate-950 text-white"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="mb-12 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                Simple by design
              </p>
              <h2
                id="how-it-works-heading"
                className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                One request. A clear next step.
              </h2>
            </div>

            <ol className="relative grid gap-10 sm:grid-cols-3 sm:gap-8">
              {/* Connecting line, desktop only */}
              <div
                aria-hidden="true"
                className="absolute left-0 right-0 top-5 hidden h-px bg-white/10 sm:block"
              />

              {steps.map((step) => (
                <li key={step.number} className="relative">
                  <span className="relative z-10 flex size-10 items-center justify-center rounded-full border border-emerald-400/40 bg-slate-900 text-sm font-semibold text-emerald-300">
                    {step.number}
                  </span>
                  <h3 className="mt-4 text-base font-medium text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Value Props ---------- */}
        <section
          aria-labelledby="values-heading"
          className="border-t border-slate-200"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <h2 id="values-heading" className="sr-only">
              Why work with Wisscano
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div key={value.title}>
                  <div className="mb-3 h-1 w-10 rounded-full bg-emerald-600" />
                  <h3 className="text-sm font-semibold text-slate-950">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Closing CTA Banner ---------- */}
        <section className="border-t border-slate-200 bg-gradient-to-br from-emerald-600 to-teal-600">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Have an infrastructure or procurement need?
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-emerald-50">
                Tell us once. We&apos;ll take it from there.
              </p>
            </div>
            <a
              href="#request"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
            >
              Submit a request
              <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-emerald-400">
                  <Cpu aria-hidden="true" className="size-4" />
                </span>
                <span className="text-lg font-bold tracking-tight text-white">
                  wisscano<span className="text-emerald-500">.</span>
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                IT infrastructure, procurement, and support — coordinated
                from one request.
              </p>
            </div>

            <nav
              aria-label="Footer navigation"
              className="flex gap-8 text-sm"
            >
              <a href="#services" className="hover:text-white">
                Services
              </a>
              <a href="#how-it-works" className="hover:text-white">
                How it works
              </a>
              <a href="#request" className="hover:text-white">
                Make a request
              </a>
            </nav>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
  <p>Wisscano &middot; Service request portal</p>
  <div className="flex items-center gap-4">
    <p>MVP preview &middot; Built around your technology needs.</p>
    <a
      href="/admin"
      className="rounded-md border border-white/10 px-2.5 py-1 text-slate-500 transition hover:border-emerald-500/40 hover:text-emerald-400"
    >
      Admin
    </a>
  </div>
</div>
        </div>
      </footer>
    </div>
  );
}