"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { display } from "@/lib/fonts";

// Same destination as the hero CTA
const MVP_REQUEST_URL = "https://wisscano-mvp-mu.vercel.app/";

// Put your logo at public/logo.png
const LOGO_SRC = "/images/logo.png";

// Each href must match a section id on the page (id="home", id="about", ...)
const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Products", href: "/products" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A63FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4F8FC]";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [logoFailed, setLogoFailed] = useState(false);

  // Darken or shadow the pill once the page moves
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the link for the section currently in the middle of the screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    NAV_LINKS.forEach(({ href }) => {
      const el = document.getElementById(href.slice(1));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Close the mobile menu with Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    // fixed = stays at the top while scrolling, and floats over the hero
    <header
      style={display.style}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr] items-center md:grid-cols-[1fr_auto_1fr]">
        {/* Logo, outside the pill */}
        <a
          href="#home"
          aria-label="Wisscano Technologies, back to top"
          className={`relative block h-12 w-12 justify-self-start overflow-hidden rounded-full bg-white ring-1 ring-[#050B14]/10 shadow-sm sm:h-14 sm:w-14 ${focusRing}`}
        >
          {logoFailed ? (
            <span className="flex h-full w-full items-center justify-center text-xl font-bold text-[#0A63FF]">
              W
            </span>
          ) : (
            <Image
              src={LOGO_SRC}
              alt=""
              fill
              sizes="56px"
              priority
              className="object-contain p-0"
              onError={() => setLogoFailed(true)}
            />
          )}
        </a>

        {/* Pill nav */}
        <div className="relative justify-self-end md:justify-self-center">
          <nav
            aria-label="Primary"
            className={`flex items-center gap-1 rounded-full border p-1.5 backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 motion-reduce:transition-none ${
              scrolled
                ? "border-[#050B14]/15 bg-[#F4F8FC]/90 shadow-[0_12px_40px_-8px_rgba(10,99,255,0.15)]"
                : "border-[#050B14]/10 bg-[#F4F8FC]/70 shadow-sm"
            }`}
          >
            {/* Desktop links */}
            <ul className="hidden items-center gap-0.5 md:flex">
              {NAV_LINKS.map((link) => {
                const isActive = active === link.href.slice(1);
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      aria-current={isActive ? "true" : undefined}
                      className={`block rounded-full px-4 py-2 text-sm font-medium transition-colors ${focusRing} ${
                        isActive
                          ? "bg-[#0A63FF]/15 text-[#050B14] font-semibold"
                          : "text-[#334155] hover:bg-[#050B14]/5 hover:text-[#050B14]"
                      }`}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Desktop CTA */}
            <a
              href="/#contact"
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-1 hidden items-center gap-2 rounded-full bg-[#0A63FF] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm transition-colors hover:bg-[#004ECB] md:inline-flex ${focusRing}`}
            >
              Start a request
              <ArrowRight size={14} />
            </a>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-[#050B14] transition-colors hover:bg-[#050B14]/5 md:hidden ${focusRing}`}
            >
              {menuOpen ? "Close" : "Menu"}
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </nav>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div
              id="mobile-menu"
              className="absolute right-0 top-full mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-3xl border border-[#050B14]/15 bg-[#F4F8FC]/95 p-2 shadow-[0_12px_40px_-8px_rgba(10,99,255,0.2)] backdrop-blur-md md:hidden"
            >
              <ul className="flex flex-col">
                {NAV_LINKS.map((link) => {
                  const isActive = active === link.href.slice(1);
                  return (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={isActive ? "true" : undefined}
                        className={`block rounded-2xl px-4 py-3.5 text-base font-medium transition-colors ${focusRing} ${
                          isActive
                            ? "bg-[#0A63FF]/15 text-[#050B14] font-semibold"
                            : "text-[#334155] hover:bg-[#050B14]/5 hover:text-[#050B14]"
                        }`}
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Empty third column keeps the pill truly centred on desktop */}
        <div className="hidden md:block" aria-hidden="true" />
      </div>
    </header>
  );
}