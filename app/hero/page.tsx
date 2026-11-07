"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { display, mono } from "@/lib/fonts";

// Point directly to your live MVP portal or a local /request route
const MVP_REQUEST_URL = "https://wisscano-mvp-mu.vercel.app/";

const SECTORS = ["ICT & Digital", "Power & Energy", "Facility Technology"] as const;
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D9BFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#00070D]";

/* ------------------------------------------------------------------ */
/* Keyframes for the Power & Energy glitch and the code caret          */
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
  background: #4D9BFF; vertical-align: -0.15em;
  animation: wz-caret 0.9s steps(1) infinite;
}
.wz-glitch {
  position: relative; display: inline-block; white-space: nowrap;
  animation: wz-flicker 2.2s steps(1, end) infinite;
}
.wz-glitch::before, .wz-glitch::after {
  content: attr(data-text); position: absolute; inset: 0; white-space: nowrap;
}
.wz-glitch::before { color: #4D9BFF; animation: wz-slice-a 1.1s steps(1, end) infinite; }
.wz-glitch::after  { color: #0A63FF; animation: wz-slice-b 0.9s steps(1, end) infinite; }
@media (prefers-reduced-motion: reduce) {
  .wz-caret, .wz-glitch { animation: none; }
  .wz-glitch::before, .wz-glitch::after { display: none; }
}
`;

/* ------------------------------------------------------------------ */
/* Cycling sector line                                                 */
/* 0 ICT & Digital     -> typed out in code format                     */
/* 1 Power & Energy    -> glitches                                     */
/* 2 Facility Tech     -> appears at random, then locks into place     */
/* ------------------------------------------------------------------ */
function SectorCycler() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  // Respect "reduce motion"
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
      // Typed, one character at a time
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
      // Shown immediately; the glitch itself is CSS
      setText(label);
      holdMs = 2600;
    } else {
      // Random characters that settle in random order
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
      {/* Always available to screen readers */}
      <ul className="sr-only">
        {SECTORS.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>

      {reduced ? (
        // Static version for people who prefer reduced motion
        <p
          aria-hidden="true"
          style={mono.style}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-lg text-white/90 md:text-xl"
        >
          {SECTORS.map((s, i) => (
            <span key={s} className="flex items-center gap-3">
              {i > 0 && <span className="text-[#4D9BFF]">/</span>}
              {s}
            </span>
          ))}
        </p>
      ) : (
        <>
          {/* Fixed height so nothing below ever jumps */}
          <div
            aria-hidden="true"
            style={mono.style}
            className={`flex h-10 items-center text-xl text-white md:h-11 md:text-2xl [text-shadow:0_2px_18px_rgba(0,7,13,0.8)] transition-opacity duration-300 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            {index === 0 && <span className="text-[#4D9BFF]">&lt;</span>}

            {index === 1 ? (
              <span className="wz-glitch" data-text={text}>
                {text}
              </span>
            ) : (
              <span>{text}</span>
            )}

            {index === 0 &&
              (done ? (
                <span className="text-[#4D9BFF]">&nbsp;/&gt;</span>
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
                  i === index ? "w-8 bg-[#0A63FF]" : "w-3 bg-white/25"
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
      className="relative min-h-[100svh] w-full overflow-hidden bg-[#00070D] text-white"
      aria-label="Wisscano Technologies"
    >
      <style>{EFFECTS_CSS}</style>

      {/* ------------------------------------------------------------- */}
      {/* 1. RESPONSIVE BACKGROUNDS                                     */}
      {/* Hidden elements don't download their image, so each device    */}
      {/* only fetches the one it needs.                                */}
      {/* ------------------------------------------------------------- */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-cover bg-[position:70%_center] bg-no-repeat md:hidden"
        style={{ backgroundImage: "url('/images/bkgroundone.jpg')" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 hidden bg-cover bg-center md:block"
        style={{ backgroundImage: "url('/images/bktwo.jpg')" }}
      />

      {/* Legibility overlay: vertical on mobile, horizontal on desktop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-gradient-to-b from-[#00070D]/85 via-[#00070D]/55 to-[#00070D]/90 md:bg-gradient-to-r md:from-[#00070D]/90 md:via-[#00070D]/60 md:to-[#00070D]/20"
      />
      {/* Soft pool of the same navy behind the text so it sits in the image */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-[radial-gradient(70%_65%_at_18%_50%,rgba(0,7,13,0.7),transparent_70%)]"
      />
      {/* Fade into the next section */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-0 h-28 bg-gradient-to-b from-transparent to-[#090D16]"
      />

      {/* ------------------------------------------------------------- */}
      {/* 2. CONTENT: NAME, MOTTO, SECTORS, ACTION                      */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 flex min-h-[100svh] flex-col justify-center px-6 pb-12 pt-28 sm:px-10 md:max-w-[56rem] md:px-14 md:pb-0 md:pt-24">
        {/* Company name */}
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white [text-shadow:0_2px_18px_rgba(0,7,13,0.8)] sm:text-base md:text-lg">
          Wisscano Technologies
        </p>

        {/* Motto */}
        <h1 className="mt-4 text-balance text-[clamp(2.6rem,12.5vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.02em] [text-shadow:0_2px_30px_rgba(0,7,13,0.7)] md:mt-5 md:text-[clamp(3.5rem,6.5vw,5.25rem)]">
          <span className="sr-only">Wisscano Technologies: </span>
          <span className="block text-white">One Hub.</span>
          <span className="block text-[#4D9BFF]">Infinite Tech Solutions.</span>
        </h1>

        {/* The three sectors */}
        <SectorCycler />

        {/* Action: sits in the page on every screen size */}
        <div className="mt-8 md:mt-10">
          <a
            href={MVP_REQUEST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex w-full items-center justify-center gap-2 rounded-full bg-[#0A63FF] px-7 py-4 sm:inline-flex sm:w-auto text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#4D9BFF] ${focusRing}`}
          >
            Start a request
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}