"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

const field =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#0A63FF] focus:ring-2 focus:ring-[#0A63FF]/30";

export default function CartPage() {
  const { items, ready, total, count, setQuantity, setNote, removeItem, clear } = useCart();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ id: i.id, quantity: i.quantity, note: i.note ?? "" })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      setReference(String(data.id ?? "").slice(-6).toUpperCase());
      clear();
      setStatus("done");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setStatus("idle");
    }
  };

  return (
    <main className="bg-white text-gray-900">
      <header className="relative overflow-hidden bg-[#050B1A] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 h-[26rem] w-[26rem] rounded-full bg-[#0A63FF]/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-32 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-400">
            Quote request
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Review your items <span className="text-blue-400">and send.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">
            Set the quantity, add any details for each item, then send your request and we
            will come back to you with a confirmed quote.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        {status === "done" ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 p-10 text-center">
            <p className="text-2xl font-bold">Request sent.</p>
            <p className="mt-3 text-gray-600">
              Thank you. Our team will contact you shortly with a quote.
            </p>
            {reference && (
              <p className="mt-4 text-sm text-gray-500">
                Reference: <span className="font-mono font-semibold">{reference}</span>
              </p>
            )}
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0A63FF] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-blue-600"
            >
              Back to products
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : !ready ? (
          <p className="text-gray-500">Loading your cart…</p>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-gray-300 p-10 text-center">
            <p className="text-xl font-semibold">Your cart is empty.</p>
            <p className="mt-2 text-gray-600">Add some products and they will show up here.</p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0A63FF] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-blue-600"
            >
              Browse products
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
            {/* Items */}
            <div>
              <div className="flex items-end justify-between">
                <h2 className="text-xl font-bold">
                  Your items <span className="text-gray-400">({count})</span>
                </h2>
                <button
                  type="button"
                  onClick={clear}
                  className="text-sm font-medium text-gray-500 underline hover:text-gray-900"
                >
                  Clear cart
                </button>
              </div>

              <ul className="mt-5 divide-y divide-gray-200 rounded-2xl border border-gray-200">
                {items.map((item) => (
                  <li key={item.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-gray-50 to-gray-100">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt=""
                            className="absolute inset-0 h-full w-full object-contain p-2"
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-[#0A63FF]/25">
                            {(item.brand ?? item.name).charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {item.brand && (
                          <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-gray-500">
                            {item.brand}
                          </p>
                        )}
                        <p className="font-semibold leading-snug">{item.name}</p>
                        <p className="mt-1 text-sm text-gray-600">
                          KES {item.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center rounded-full border border-gray-300">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => setQuantity(item.id, item.quantity - 1)}
                            className="flex h-9 w-9 items-center justify-center text-gray-700 hover:text-[#0A63FF]"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => setQuantity(item.id, item.quantity + 1)}
                            className="flex h-9 w-9 items-center justify-center text-gray-700 hover:text-[#0A63FF]"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-600"
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Per-item description */}
                    <label htmlFor={`note-${item.id}`} className="sr-only">
                      Notes for {item.name}
                    </label>
                    <textarea
                      id={`note-${item.id}`}
                      rows={2}
                      maxLength={500}
                      value={item.note ?? ""}
                      onChange={(e) => setNote(item.id, e.target.value)}
                      placeholder="Notes for this item (specifications, colour, delivery details...)"
                      className={`${field} mt-4`}
                    />
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4">
                <span className="text-sm text-gray-600">Estimated total</span>
                <span className="text-lg font-bold">KES {total.toLocaleString()}</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Prices are indicative. We confirm the final quote with you.
              </p>
            </div>

            {/* Details form */}
            <form
              onSubmit={submit}
              className="h-fit rounded-2xl border border-gray-200 p-6 lg:sticky lg:top-28"
            >
              <h2 className="text-xl font-bold">Your details</h2>

              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                    Full name
                  </label>
                  <input
                    id="name"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={update("name")}
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={update("email")}
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={form.phone}
                    onChange={update("phone")}
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor="company" className="mb-1.5 block text-sm font-medium">
                    Company <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="company"
                    autoComplete="organization"
                    value={form.company}
                    onChange={update("company")}
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
                    General notes <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={form.message}
                    onChange={update("message")}
                    className={field}
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="mt-4 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#0A63FF] px-7 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send quote request"}
                {status !== "sending" && <ArrowRight size={14} />}
              </button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}