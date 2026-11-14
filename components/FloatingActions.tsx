"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, FileText, MessageCircle, Phone, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const WHATSAPP_URL =
  "https://wa.me/254119834490?text=Hello%20Wisscano%20Technologies%2C%20I%20would%20like%20to%20discuss%20a%20project.";
const CALL_URL = "tel:+254119834490";
const ENQUIRY_URL = "https://wisscano.co.ke/#contact";

const ring =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1A]";

const OPTIONS = [
  { label: "WhatsApp", href: WHATSAPP_URL, icon: MessageCircle, external: true },
  { label: "Call", href: CALL_URL, icon: Phone, external: false },
  { label: "Enquiry form", href: ENQUIRY_URL, icon: FileText, external: true },
] as const;

export default function FloatingActions() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);

  // Small pop on the cart badge whenever the count goes up
  useEffect(() => {
    if (!ready) return;
    if (count > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count, ready]);

  // Close the contact menu on outside click, Escape, or page change
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  // Not needed on the admin pages
  if (pathname?.startsWith("/admin")) return null;

  const showCart = pathname !== "/cart";

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* Cart button */}
      {showCart && (
        <Link
          href="/cart"
          aria-label={ready && count > 0 ? `Cart, ${count} items` : "Cart"}
          className={`pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-[#050B1A] text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] transition hover:bg-[#0A63FF] ${ring}`}
        >
          <ShoppingCart size={22} />
          {ready && count > 0 && (
            <span
              className={`absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#0A63FF] px-1.5 text-xs font-bold text-white ring-2 ring-white transition-transform duration-300 ${
                bump ? "scale-125" : "scale-100"
              }`}
            >
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Link>
      )}

      {/* Contact button and its 3 options */}
      <div ref={boxRef} className="pointer-events-auto relative flex flex-col items-end gap-3">
        {open && (
          <div
            id="contact-menu"
            role="menu"
            className="w-56 overflow-hidden rounded-2xl border border-white/15 bg-[#050B1A]/95 p-2 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-md"
          >
            <p className="px-3 pb-1 pt-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-blue-400">
              Contact Wisscano
            </p>
            {OPTIONS.map(({ label, href, icon: Icon, external }) => (
              <a
                key={label}
                role="menuitem"
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={`flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors hover:bg-white/10 ${ring}`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} className="text-blue-400" />
                  {label}
                </span>
                <ArrowUpRight size={16} className="text-white/60" />
              </a>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="contact-menu"
          aria-label={open ? "Close contact options" : "Contact us"}
          className={`flex h-14 items-center gap-2 rounded-full bg-[#0A63FF] text-white shadow-[0_10px_30px_-8px_rgba(10,99,255,0.7)] transition hover:bg-blue-600 ${ring} ${
            open ? "w-14 justify-center" : "px-5"
          }`}
        >
          {open ? (
            <X size={22} />
          ) : (
            <>
              <MessageCircle size={22} />
              <span className="text-xs font-semibold uppercase tracking-[0.12em]">Contact</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}