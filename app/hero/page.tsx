"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { display, mono } from "@/lib/fonts";

// Point directly to your live MVP portal or a local /request route
const MVP_REQUEST_URL = "https://wisscano-mvp-mu.vercel.app/";

// Must match the background color of the About section exactly
const ABOUT_BG = "#00070D";
const ABOUT_RGB = "0, 7, 13"; // same color as ABOUT_BG, as r, g, b

const SECTORS = ["ICT & Digital", "Power & Energy", "Facility Technology"] as const;
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A63FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4F8FC]";

/* ------------------------------------------------------------------ */
/* The fade into the About section. Many small steps, so there is no   */
/* point where the eye can see an edge.                                */
/* ------------------------------------------------------------------ */
const fadeStops: [number, number][] = [
  [0, 0],
  [10, 0.02],
  [20, 0.07],
  [30, 0.15],
  [40, 0.27],
  [50, 0.42],
  [60, 0.58],
  [70, 0.74],
  [80, 0.87],
  [90, 0.96],
  [100, 1],
];

const FADE_STYLE: CSSProperties = {
  backgroundImage: `linear-gradient(to bottom, ${fadeStops
    .map(([pos, a]) => `rgba(${ABOUT_RGB}, ${a}) ${pos}%`)
    .join(", ")})`,
};

/* ------------------------------------------------------------------ */
/* Keyframes for the Power & Energy glitch and the code caret         */
/* ------------------------------------------------------------------ */
const EFFECTS_CSS = `
@keyframes wz-caret { 0%,49% { opacity: 1 } 50%,100% { opacity: 0 } }
@keyframes wz-flicker {
  0%,100% { opacity: 1 } 6% { opacity: .55 } 8% { opacity: 1 }
  52% { opacity: 1 } 54% { opacity: .4 } 56% { opacity: 1 }
}
@keyframes wz-slice-a {
  0%,36%,82%,100% { clip-path: inset(0 0 100% 0); transform: translate(0,0) }
  12% { clip-path: inset(8% 0 62% 0); transform: translate(-4px,0) }
  24% { clip-path: inset(54% 0 18% 0); transform: translate(3px,0) }
  58% { clip-path: inset(30% 0 40% 0); transform: translate(-2px,1px) }
  70% { clip-path: inset(76% 0 4% 0); transform: translate(4px,0) }
}
@keyframes wz-slice-b {
  0%,30%,76%,100% { clip-path: inset(0 0 100% 0); transform: translate(0,0) }
  8% { clip-path: inset(42% 0 36% 0); transform: translate(4px,0) }
  20% { clip-path: inset(70% 0 8% 0); transform: translate(-3px,0) }
  48% { clip-path: inset(14% 0 66% 0); transform: translate(3px,-1px) }
  64% { clip-path: inset(58% 0 22% 0); transform: translate(-4px,0) }
}
.wz-caret {
  display: inline-block; width: 2px; height: 1.1em; margin-left: 3px;
  background: #0A63FF; vertical-align: -0.15em;
  animation: wz-caret 0.9s steps(1) infinite;
}
.wz-glitch {
  position: relative; display: inline-block; white-space: nowrap;
  animation: wz-flicker 2.2s steps(1, end) infinite;
}
.wz-glitch::before, .wz-glitch::after {
  content: attr(data-text); position: absolute; inset: 0; white-space: nowrap;
}
.wz-glitch::before { color: #38BDF8; animation: wz-slice-a 1.1s steps(1, end) infinite; }
.wz-glitch::after  { color: #0A63FF; animation: wz-slice-b 0.9s steps(1, end) infinite; }
@media (prefers-reduced-motion: reduce) {
  .wz-caret, .wz-glitch { animation: none; }
  .wz-glitch::before, .wz-glitch::after { display: none; }
}
`;

/* ------------------------------------------------------------------ */
/* Cycling sector line                                                */
/* ------------------------------------------------------------------ */
function SectorCycler() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) return;

    const label = SECTORS[index];
    const timeouts: number[] = [];
    const intervals: number[] = [];
    let holdMs = 2400;

    setVisible(true);
    setDone(false);

    if (index === 0) {
      const step = 60;
      let i = 0;
      setText("");
      const id = window.setInterval(() => {
        i += 1;
        setText(label.slice(0, i));
        if (i >= label.length) {
          window.clearInterval(id);
          setDone(true);
        }
      }, step);
      intervals.push(id);
      holdMs = label.length * step + 1800;
    } else if (index === 1) {
      setText(label);
      holdMs = 2600;
    } else {
      const settleBy = 1100;
      const start = performance.now();
      const settleAt = label.split("").map(() => 250 + Math.random() * (settleBy - 250));
      const id = window.setInterval(() => {
        const t = performance.now() - start;
        if (t >= settleBy) {
          setText(label);
          setDone(true);
          window.clearInterval(id);
          return;
        }
        setText(
          label
            .split("")
            .map((ch, i) =>
              ch === " " || t >= settleAt[i]
                ? ch
                : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
            )
            .join("")
        );
      }, 45);
      intervals.push(id);
      holdMs = settleBy + 1500;
    }

    timeouts.push(window.setTimeout(() => setVisible(false), holdMs));
    timeouts.push(
      window.setTimeout(() => setIndex((i) => (i + 1) % SECTORS.length), holdMs + 350)
    );

    return () => {
      timeouts.forEach((t) => window.clearTimeout(t));
      intervals.forEach((t) => window.clearInterval(t));
    };
  }, [index, reduced]);

  return (
    <div className="mt-6 md:mt-9">
      <ul className="sr-only">
        {SECTORS.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>

      {reduced ? (
        <p
          aria-hidden="true"
          style={mono.style}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-lg text-[#1E293B] md:text-xl"
        >
          {SECTORS.map((s, i) => (
            <span key={s} className="flex items-center gap-3">
              {i > 0 && <span className="text-[#0A63FF]">/</span>}
              {s}
            </span>
          ))}
        </p>
      ) : (
        <>
          <div
            aria-hidden="true"
            style={mono.style}
            className={`flex h-10 items-center text-xl font-medium text-[#0F172A] md:h-11 md:text-2xl transition-opacity duration-300 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            {index === 0 && <span className="text-[#0A63FF]">&lt;</span>}

            {index === 1 ? (
              <span className="wz-glitch" data-text={text}>
                {text}
              </span>
            ) : (
              <span>{text}</span>
            )}

            {index === 0 &&
              (done ? (
                <span className="text-[#0A63FF]">&nbsp;/&gt;</span>
              ) : (
                <span className="wz-caret" />
              ))}
          </div>

          {/* Progress markers */}
          <div aria-hidden="true" className="mt-4 flex items-center gap-2">
            {SECTORS.map((s, i) => (
              <span
                key={s}
                className={`h-[3px] rounded-full transition-all duration-500 ${
                  i === index ? "w-8 bg-[#0A63FF]" : "w-3 bg-[#0F172A]/20"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function HeroSection() {
  return (
    <section
      id="home"
      style={display.style}
      className="relative min-h-[100svh] w-full overflow-hidden bg-[#F4F8FC] text-[#050B14]"
      aria-label="Wisscano Technologies"
    >
      <style>{EFFECTS_CSS}</style>

      {/* ------------------------------------------------------------- */}
      {/* 1. RESPONSIVE BACKGROUNDS                                     */}
      {/* ------------------------------------------------------------- */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-cover bg-[position:70%_center] bg-no-repeat md:hidden"
        style={{ backgroundImage: "url('/images/bgtwochoice.jpg')" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 hidden bg-cover bg-center md:block"
        style={{ backgroundImage: "url('/images/bgtwochoice.jpg')" }}
      />

      {/* Soft continuous veil to protect text legibility without harsh edges */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-gradient-to-b from-[#F4F8FC]/90 via-[#F4F8FC]/60 to-[#F4F8FC]/20 md:bg-gradient-to-r md:from-[#F4F8FC]/95 md:via-[#F4F8FC]/50 md:to-transparent"
      />

      {/* Slow fade into the About section: tall, many steps, no visible edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-72 md:h-96"
        style={FADE_STYLE}
      />

      {/* Thin strip of the About color at the very bottom, so no light line can show */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[2px]"
        style={{ backgroundColor: ABOUT_BG }}
      />

      {/* ------------------------------------------------------------- */}
      {/* 2. CONTENT: NAME, MOTTO, SECTORS, ACTION                      */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 flex min-h-[100svh] flex-col justify-center px-6 pb-16 pt-28 sm:px-10 md:max-w-[56rem] md:px-14 md:pb-12 md:pt-24">
        {/* Company name */}
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#334155] sm:text-base md:text-lg">
          Wisscano Technologies
        </p>

        {/* Motto */}
        <h1 className="mt-4 text-balance text-[clamp(2.6rem,12.5vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.02em] md:mt-5 md:text-[clamp(3.5rem,6.5vw,5.25rem)]">
          <span className="sr-only">Wisscano Technologies: </span>
          <span className="block text-[#050B14]">One Hub.</span>
          <span className="block text-[#0A63FF]">Infinite Tech Solutions.</span>
        </h1>

        {/* The three sectors */}
        <SectorCycler />

        {/* Action */}
        <div className="mt-8 md:mt-10">
          <a
            href="/#contact"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex w-full items-center justify-center gap-2 rounded-full bg-[#0A63FF] px-7 py-4 sm:inline-flex sm:w-auto text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm transition-colors hover:bg-[#004ECB] ${focusRing}`}
          >
            Start a request
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}