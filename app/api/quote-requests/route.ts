import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Resend } from "resend";
import { connectDB } from "@/lib/db";
import CatalogItem from "@/models/CatalogItem";
import QuoteRequest from "@/models/QuoteRequest";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");

type OrderItem = {
  itemId: string;
  name: string;
  brand?: string;
  price: number;
  quantity: number;
  note: string;
};

function buildEmail(
  ref: string,
  c: { name: string; email: string; phone: string; company: string; message: string },
  items: OrderItem[]
) {
  const total = items.reduce((n, i) => n + i.price * i.quantity, 0);

  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;vertical-align:top">
          <strong>${esc(i.name)}</strong>
          ${i.brand ? `<br><span style="color:#6b7280;font-size:12px">${esc(i.brand)}</span>` : ""}
          ${i.note ? `<br><span style="color:#374151;font-size:13px">Note: ${esc(i.note)}</span>` : ""}
        </td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;vertical-align:top">${i.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;vertical-align:top">KES ${i.price.toLocaleString("en-KE")}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;vertical-align:top">KES ${(i.price * i.quantity).toLocaleString("en-KE")}</td>
      </tr>`
    )
    .join("");

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#111827">
    <h2 style="margin:0 0 4px">New quote request</h2>
    <p style="margin:0 0 20px;color:#6b7280">Reference ${esc(ref)}</p>

    <h3 style="margin:0 0 8px">Customer</h3>
    <p style="margin:0 0 20px;line-height:1.6">
      ${esc(c.name)}${c.company ? ` (${esc(c.company)})` : ""}<br>
      <a href="mailto:${esc(c.email)}">${esc(c.email)}</a><br>
      ${esc(c.phone)}
    </p>

    <h3 style="margin:0 0 8px">Items</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead>
        <tr style="background:#f3f4f6;text-align:left">
          <th style="padding:10px">Item</th>
          <th style="padding:10px;text-align:center">Qty</th>
          <th style="padding:10px;text-align:right">Unit</th>
          <th style="padding:10px;text-align:right">Line total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="text-align:right;font-size:16px;margin:14px 0 20px">
      <strong>Estimated total: KES ${total.toLocaleString("en-KE")}</strong>
    </p>

    ${
      c.message
        ? `<h3 style="margin:0 0 8px">Customer notes</h3><p style="line-height:1.6">${esc(c.message)}</p>`
        : ""
    }
    <p style="color:#6b7280;font-size:12px">Prices are indicative placeholders. Confirm the final quote with the customer.</p>
  </div>`;

  return { html, total };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const company = String(body.company ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !phone || !EMAIL.test(email)) {
      return NextResponse.json(
        { error: "Please enter your name, a valid email and a phone number." },
        { status: 400 }
      );
    }

    const requested: { id: string; quantity: number; note: string }[] = Array.isArray(body.items)
      ? body.items
          .filter((i: { id?: unknown }) => mongoose.isValidObjectId(i?.id))
          .map((i: { id: string; quantity?: unknown; note?: unknown }) => ({
            id: String(i.id),
            quantity: Math.max(1, Math.min(999, Number(i.quantity) || 1)),
            note: String(i.note ?? "").trim().slice(0, 500),
          }))
      : [];

    if (requested.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    await connectDB();

    // Names and prices come from the database, never from the browser
    const found = await CatalogItem.find({
      _id: { $in: requested.map((r) => r.id) },
      active: true,
    }).lean();

    const items: OrderItem[] = [];
    for (const r of requested) {
      const doc = found.find((f: { _id: unknown }) => String(f._id) === r.id) as
        | { name: string; brand?: string; price?: number }
        | undefined;
      if (!doc) continue;
      items.push({
        itemId: r.id,
        name: doc.name,
        brand: doc.brand,
        price: doc.price ?? 0,
        quantity: r.quantity,
        note: r.note,
      });
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Those items are no longer available." },
        { status: 400 }
      );
    }

    // 1. Save the order first, so it is never lost
    const created = await QuoteRequest.create({
      name,
      email,
      phone,
      company,
      message,
      items,
    });
    const ref = String(created._id).slice(-6).toUpperCase();

    // 2. Email the summary to the boss. A failure here must not fail the order.
    let emailSent = false;
    try {
      const apiKey = process.env.RESEND_API_KEY;
      const to = process.env.ORDER_NOTIFY_EMAIL;
      const from = process.env.RESEND_FROM;

      if (!apiKey || !to || !from) {
        console.error(
          "Order email skipped: set RESEND_API_KEY, ORDER_NOTIFY_EMAIL and RESEND_FROM."
        );
      } else {
        const resend = new Resend(apiKey);
        const { html } = buildEmail(ref, { name, email, phone, company, message }, items);
        const { error } = await resend.emails.send({
          from,
          to: to.split(",").map((s) => s.trim()),
          replyTo: email,
          subject: `New quote request ${ref} from ${name}`,
          html,
        });
        if (error) {
          console.error("Resend error:", error);
        } else {
          emailSent = true;
        }
      }
    } catch (mailError) {
      console.error("Order email failed:", mailError);
    }

    if (emailSent) {
      await QuoteRequest.updateOne({ _id: created._id }, { $set: { emailSent: true } });
    }

    return NextResponse.json({ ok: true, id: String(created._id) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/quote-requests failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again shortly." },
      { status: 500 }
    );
  }
}