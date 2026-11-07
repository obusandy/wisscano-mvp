"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { display, mono } from "@/lib/fonts";

const INK = "#00070D";
const BODY = "rgba(0,7,13,0.78)";
const SOFT = "rgba(0,7,13,0.55)";

const ring =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A63FF] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const eyebrow = "text-sm font-semibold uppercase tracking-[0.14em] text-[#0A63FF] md:text-base";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */
const STEPS = [
  {
    title: "Requirement",
    line: "We listen and write it down.",
    happens: "We record what you need, where and by when.",
    need: "Who is involved and who decides.",
    receive: "A written requirement for you to confirm.",
  },
  {
    title: "Partner quotes",
    line: "We go to the right specialists.",
    happens: "We request quotes from suitable partners and confirm availability first.",
    need: "Answers to follow-up questions.",
    receive: "Nothing to chase. This step is ours.",
  },
  {
    title: "One consolidated quote",
    line: "One document, not several.",
    happens: "We combine the partner quotes into one clear Wisscano quote.",
    need: "Your questions and your decision.",
    receive: "One quote covering the whole requirement.",
  },
  {
    title: "Order",
    line: "You confirm. We order.",
    happens: "You confirm and pay the agreed deposit. We place the orders.",
    need: "Written confirmation.",
    receive: "Confirmation of what is ordered, and from whom.",
    chips: true,
  },
  {
    title: "Delivery and installation",
    line: "We coordinate the work on site.",
    happens: "We coordinate partners, schedules and site access.",
    need: "Site access and a contact.",
    receive: "One contact for delivery.",
    chips: true,
  },
  {
    title: "Commissioning and handover",
    line: "We confirm it is finished.",
    happens: "We confirm the work is complete and hand over the documents.",
    need: "Your sign-off.",
    receive: "Handover documents.",
  },
  {
    title: "After-sales",
    line: "We stay your contact.",
    happens: "We follow up warranty and service with the partners.",
    need: "Tell us when something is wrong.",
    receive: "One party to raise issues with.",
  },
] as const;

const ZONE_CHIPS = ["01 Rooftop", "02 Workspace", "03 Entrance"] as const;

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */
function useInView<T extends Element>(margin = "0px 0px -12% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: margin, threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, inView] as const;
}

// Fade and settle as it scrolls into view
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        inView ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */
export default function ProcessSection() {
  const [current, setCurrent] = useState(-1);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const navRef = useRef<HTMLOListElement>(null);

  // Scroll-linked progress. Writes straight to CSS variables so the page
  // does not re-render on every scroll frame.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const mark = window.innerHeight * 0.5;
      let cur = -1;
      let curP = 0;
      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (mark - r.top) / r.height));
        el.style.setProperty("--p", p.toFixed(3));
        if (p > 0) {
          cur = i;
          curP = p;
        }
      });
      const np = cur < 0 ? 0 : Math.min(1, (cur + curP) / (STEPS.length - 1));
      navRef.current?.style.setProperty("--np", np.toFixed(3));
      setCurrent((c) => (c === cur ? c : cur));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const goTo = (i: number) => (e: ReactMouseEvent) => {
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stepRefs.current[i]?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  };

  const shown = Math.min(Math.max(current, 0), STEPS.length - 1);

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      style={display.style}
      className="relative scroll-mt-24 px-2 py-2 sm:px-3 sm:py-3"
    >
      {/* The white sheet. Full screen on desktop, natural height on mobile. */}
      <div className="mx-auto max-w-[110rem] overflow-clip rounded-[1.75rem] bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_30px_80px_-30px_rgba(0,7,13,0.9)] sm:rounded-[2.25rem] lg:flex lg:min-h-[calc(100svh-1.5rem)] lg:flex-col lg:justify-center">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12">
          <div className="py-14 md:py-20">
            <Reveal>
              <p className={eyebrow}>The seven steps</p>
              <h2
                id="process-heading"
                className="mt-4 max-w-3xl text-balance text-[clamp(1.75rem,5vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em]"
                style={{ color: INK }}
              >
                How a requirement becomes a working system.
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-[17rem_1fr] lg:gap-16">
              {/* Desktop: sticky step navigator */}
              <nav aria-label="Process steps" className="hidden self-start lg:sticky lg:top-28 lg:block">
                <p style={mono.style} className="text-xs font-medium uppercase tracking-[0.14em]">
                  <span className="text-[#0A63FF]">Step {String(shown + 1).padStart(2, "0")}</span>
                  <span style={{ color: SOFT }}> / {String(STEPS.length).padStart(2, "0")}</span>
                </p>
                <ol ref={navRef} className="relative mt-5">
                  {/* line behind the dots, filling as you scroll */}
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-6 h-[calc(100%-3rem)] w-px bg-[#00070D]/10"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-6 h-[calc(100%-3rem)] w-px origin-top bg-[#0A63FF] [transform:scaleY(var(--np,0))]"
                  />
                  {STEPS.map((s, i) => {
                    const reached = i <= current;
                    const isCurrent = i === current;
                    return (
                      <li key={s.title}>
                        <a
                          href={`#step-${i + 1}`}
                          onClick={goTo(i)}
                          aria-current={isCurrent ? "step" : undefined}
                          className={`relative flex h-12 items-center gap-4 rounded-full pr-3 ${ring}`}
                        >
                          <span
                            style={mono.style}
                            className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[0.7rem] font-bold transition-colors duration-500 ${
                              reached
                                ? "border-[#0A63FF] bg-[#0A63FF] text-white"
                                : "border-[#00070D]/20 bg-white text-[#00070D]/50"
                            }`}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={`text-sm leading-tight transition-colors duration-500 ${
                              isCurrent ? "font-semibold" : "font-medium"
                            }`}
                            style={{ color: isCurrent ? INK : reached ? BODY : SOFT }}
                          >
                            {s.title}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </nav>

              {/* The steps */}
              <div>
                {STEPS.map((s, i) => {
                  const reached = i <= current;
                  const isCurrent = i === current;
                  const num = String(i + 1).padStart(2, "0");
                  return (
                    <article
                      key={s.title}
                      id={`step-${i + 1}`}
                      ref={(el) => {
                        stepRefs.current[i] = el;
                      }}
                      className="flex scroll-mt-28 gap-4 pb-8 last:pb-0 lg:block lg:pb-6"
                    >
                      {/* Phones: rail with a number that stays pinned while the card scrolls */}
                      <div
                        aria-hidden="true"
                        className="relative flex w-10 shrink-0 justify-center lg:hidden"
                      >
                        <span className="absolute inset-y-0 left-[calc(50%-0.5px)] w-px bg-[#00070D]/10" />
                        <span className="absolute inset-y-0 left-[calc(50%-0.5px)] w-px origin-top bg-[#0A63FF] [transform:scaleY(var(--p,0))]" />
                        <span
                          style={mono.style}
                          className={`sticky top-24 z-10 flex h-10 w-10 items-center justify-center self-start rounded-full border-2 text-xs font-bold transition-colors duration-500 ${
                            reached
                              ? "border-[#0A63FF] bg-[#0A63FF] text-white"
                              : "border-[#00070D]/20 bg-white text-[#00070D]/50"
                          }`}
                        >
                          {num}
                        </span>
                      </div>

                      <Reveal className="min-w-0 flex-1">
                        <div
                          className={`rounded-3xl border p-5 transition-all duration-500 sm:p-7 ${
                            isCurrent
                              ? "border-[#0A63FF]/40 bg-white shadow-[0_24px_50px_-24px_rgba(10,99,255,0.45)]"
                              : "border-[#00070D]/10 bg-[#F6F9FF]"
                          }`}
                        >
                          <p
                            style={mono.style}
                            className="hidden text-xs font-medium uppercase tracking-[0.14em] text-[#0A63FF] lg:block"
                          >
                            Step {num}
                          </p>
                          <h3
                            className="text-xl font-bold tracking-[-0.01em] sm:text-2xl lg:mt-2"
                            style={{ color: INK }}
                          >
                            {s.title}
                          </h3>
                          <p className="mt-1 text-base font-medium text-[#0A63FF]">{s.line}</p>

                          <dl className="mt-5">
                            {[
                              ["What happens", s.happens],
                              ["What we need", s.need],
                              ["What you receive", s.receive],
                            ].map(([label, text], idx) => (
                              <div
                                key={label}
                                className="grid gap-1 border-t border-[#00070D]/10 py-3 sm:grid-cols-[10.5rem_1fr] sm:gap-4"
                              >
                                <dt
                                  className="text-[0.7rem] font-semibold uppercase tracking-[0.14em]"
                                  style={{ color: SOFT }}
                                >
                                  {label}
                                </dt>
                                <dd
                                  className={`text-[0.95rem] leading-relaxed ${idx === 2 ? "font-medium" : ""}`}
                                  style={{ color: idx === 2 ? INK : BODY }}
                                >
                                  {text}
                                </dd>
                              </div>
                            ))}
                          </dl>

                          {"chips" in s && s.chips && (
                            <p className="mt-2 flex flex-wrap items-center gap-2 border-t border-[#00070D]/10 pt-4">
                              <span
                                className="mr-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em]"
                                style={{ color: SOFT }}
                              >
                                In the catalogue
                              </span>
                              {ZONE_CHIPS.map((chip) => (
                                <a
                                  key={chip}
                                  href="#services"
                                  className={`rounded-full border border-[#0A63FF]/30 bg-white px-3 py-1 text-xs font-medium text-[#0A63FF] transition-colors hover:bg-[#0A63FF] hover:text-white ${ring}`}
                                >
                                  {chip}
                                </a>
                              ))}
                            </p>
                          )}
                        </div>
                      </Reveal>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}