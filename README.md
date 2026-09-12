# Wisscano — Service Request Portal

A full-stack service request management system built for Wisscano, an ICT
procurement and infrastructure company. Customers submit service requests
through a public form; administrators review, filter, and manage those
requests through an authenticated dashboard with a full audit trail.

# 1. Clone and install
git clone <<<REPO_URL>>>
cd wisscano-mvp
npm install

# 2. Create your environment file
cp .env.example .env

# 3. Fill in .env with real values:
#    MONGODB_URI         — your Atlas connection string
#    NEXTAUTH_SECRET     — generate with: openssl rand -base64 32
#    NEXTAUTH_URL        — http://localhost:3000
#    ADMIN_SEED_EMAIL    — the admin account to create
#    ADMIN_SEED_PASSWORD — a strong password

# 4. Seed the database (service categories + first admin account)
npm run seed

# 5. Run
npm run dev
```

Open `http://localhost:3000`. Admin panel is at `/admin`.

### Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run seed` | Seed categories + admin (idempotent, safe to re-run) |
| `npm run test` | Run the test suite (23 tests) |
| `npm run typecheck` | TypeScript check with no emit |
| `npm run lint` | ESLint |

---

## Architecture

### Technology Choices

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | One codebase for frontend + API via Route Handlers. One deployment target. Under a tight timeline, eliminating a separate backend service removed an entire class of integration and CORS problems. |
| Database | MongoDB Atlas + Mongoose | Flexible document model suits a request/audit-log workload. Mongoose adds schema-level validation and typed models, giving structure without migration overhead. |
| Auth | NextAuth v4 (Credentials + JWT) | Handles session cookies, CSRF, and token signing correctly by default. Hand-rolling session management under time pressure is exactly how auth vulnerabilities get shipped. |
| Validation | Zod | One schema definition shared by client and server, so validation rules cannot drift apart between the two. |
| Styling | Tailwind CSS v4 + shadcn/ui | Accessible component primitives, fast iteration, no custom CSS architecture to maintain. |
| Testing | Vitest + mongodb-memory-server | Tests run against a real, throwaway MongoDB instance rather than mocks — catches actual Mongoose behaviour (validation, `select: false`, indexes). |
| Hosting | Vercel + MongoDB Atlas | Native Next.js support, zero-config deploys from Git, free tier sufficient for an MVP. |

### How the Layers Connect

```
Browser
  │
  ├── Customer page (Server Component)
  │     └── RequestForm (Client Component)
  │           ├── GET  /api/categories   → public, DB-driven dropdown
  │           └── POST /api/requests     → rate-limited, Zod-validated
  │
  └── Admin pages (Server Components, session-guarded)
        ├── Dashboard  → calls listServiceRequests() directly
        └── Detail     → RequestActions (Client Component)
                          ├── PATCH  /api/requests/:id   → writes audit log
                          └── DELETE /api/requests/:id   → soft-cancel + audit

                             │
                        Mongoose models
                             │
                        MongoDB Atlas
```

**A deliberate decision worth explaining:** admin Server Components query the
database *directly* via a shared service function (`lib/requests-service.ts`)
rather than fetching their own HTTP API. A server calling its own API over
the network is wasted round-trips. Both the Server Component and the
`/api/requests` route call the same `listServiceRequests()` function, so
there is no duplicated query logic — the API route exists for programmatic
access, not because the UI needs it.

### Route Protection: Defence in Depth

Two independent layers guard `/admin/*`, so a failure in one does not expose
the system:

1. **Edge guard (`proxy.ts`)** — intercepts every request to `/admin/*`
   before the page renders. Checks for a valid session token; redirects to
   `/admin/login` if absent. Fast, cheap, first line of defence.
2. **Server guard (`requireAdminSession()`)** — re-checked inside every
   protected page and every admin API route independently. Even if the edge
   guard were ever misconfigured, no protected page renders and no protected
   data is returned without a verified session.

Knowing the admin URL grants nothing — verified both by automated test and
by direct `curl` against the live deployment.

### Project Structure

```
app/
  page.tsx                      Customer-facing landing page + form
  admin/
    page.tsx                    Redirects to dashboard (guarded)
    login/page.tsx              Server wrapper (force-dynamic)
    dashboard/page.tsx          Request list: search, filter, paginate
    requests/[id]/page.tsx      Detail view, status editor, audit trail
  api/
    categories/route.ts         GET  public
    requests/route.ts           POST public (rate-limited) | GET admin
    requests/[id]/route.ts      GET | PATCH | DELETE — all admin-only
    requests/[id]/audit/route.ts GET admin-only audit history
    auth/[...nextauth]/route.ts NextAuth handler

lib/
  db.ts                       Cached Mongoose connection
  auth.ts                     NextAuth configuration
  session.ts                  getAdminSession / requireAdminSession
  validations.ts              All Zod schemas (shared client + server)
  request-constants.ts        Status & contact enums (no DB imports)
  rateLimit.ts                In-memory sliding-window limiter
  apiResponse.ts              Centralised error handling
  audit.ts                    Audit writer + server-side field diffing
  requests-service.ts         Shared list query
  request-detail-service.ts   Get / update / cancel + audit integration

models/                       Mongoose schemas
components/
  requests/request-form.tsx    Customer form (client)
  admin/                       Admin dashboard components
  site/mobile-nav.tsx          Marketing page mobile nav
scripts/seed.ts                Idempotent seeding
proxy.ts                       Edge guard for /admin/* (Next 16 middleware)
tests/                         23 tests across 5 files
```

---

## Database Design

### Collections

**`categories`** — service types, database-driven rather than hardcoded
```
name, slug (unique), description, isActive, sortOrder, timestamps
```

**`serviceRequests`** — the core entity
```
fullName, email, phone,
category (ObjectId ref), categoryNameSnapshot (string),
description, preferredContact (EMAIL|PHONE),
status (NEW|REVIEWING|IN_PROGRESS|COMPLETED|CANCELLED),
createdAt, updatedAt
```

**`admins`**
```
email (unique, lowercased), passwordHash (select: false),
name, role, timestamps
```

**`auditLogs`** — append-only change history
```
requestId (ref), action, field, previousValue, newValue,
changedBy (ref Admin), changedByEmail (snapshot), changedAt
```

### Why It Is Structured This Way

**Categories are a collection, not an enum.** The brief asked that
categories not be hardcoded where architecture reasonably allows. This paid
off concretely during development: after researching Wisscano's actual
service lines (IT Support, Network Deployment, Fiber Installation, Server
Solutions, Cloud Services, CCTV Installation, Device Servicing,
Cybersecurity Services, Technology Consulting, ICT Procurement, plus the
spec's required Data Recovery, Software Installation, IT Support, and
Other), the category list was replaced entirely by re-running the seed
script — **zero UI or code changes**. That is the practical proof the
decision was correct, not just theoretically nicer.

**Requests store a category reference *and* a name snapshot.** If an admin
later renames or deactivates a category, historical requests must still show
what the customer actually selected at submission time. The reference keeps
relational integrity for filtering; the snapshot keeps the historical record
honest. A test asserts the snapshot survives a category rename.

**Audit logs are a separate collection, not an embedded array.** Three
reasons: (1) request documents stay small, so list queries stay fast;
(2) audit history can be paginated independently as it grows — a long-lived
request could accumulate many entries; (3) it is naturally append-only,
which matches what an audit trail should be. Embedding would mean rewriting
the parent document on every change.

**Audit logs store `changedByEmail` as a snapshot alongside `changedBy`.**
If an admin account is ever deleted, the audit trail must still say who made
the change. A dangling ObjectId is not an answer to "who did this?"

**Audit logs deliberately have no `updatedAt`.** Mongoose's `timestamps: true`
shortcut would add one. An audit record that can be edited after the fact is
not an audit record, so only an immutable `changedAt` is stored.

**Passwords are never returned by default.** `passwordHash` has
`select: false` at the schema level — a query for an Admin document will not
include it unless explicitly requested with `.select("+passwordHash")`. This
is verified by a test, since it is exactly the kind of protection that
silently breaks during a careless refactor.

### Indexes

| Index | Supports |
|---|---|
| `serviceRequests { status: 1, createdAt: -1 }` | Default dashboard view: filter by status, newest first |
| `serviceRequests { email: 1 }` | Looking up a customer's history |
| `serviceRequests` text index on name/email/description | Admin search |
| `auditLogs { requestId: 1, changedAt: -1 }` | Audit history for one request |
| `categories { isActive: 1, sortOrder: 1 }` | Public dropdown query |
| `categories { slug: 1 }` unique | Idempotent seed upserts; enforced at the DB level, not just in application code |

These were declared at schema-definition time rather than retrofitted later,
since adding indexes to a large existing collection is far more expensive
than declaring them upfront.

---

## Security

### Threats Considered and What Was Implemented

**Unauthorised access to the admin area** — Two independent layers (see
"Route Protection" above): edge-level redirect plus per-route session
verification. Confirmed via `curl` returning `401` on every admin API route
when unauthenticated, and via browser redirect testing.

**Invalid input** — Every write endpoint validates with Zod before touching
the database. Client-side validation exists purely for UX; the server never
trusts it. Mongoose schema validation acts as a further layer at the
database boundary.

**NoSQL injection** — Zod's strict type parsing rejects operator-injection
payloads such as `{"email": {"$ne": null}}`, because a string schema rejects
an object outright. This is asserted explicitly in tests rather than
assumed to be true.

**Brute-force login** — Login attempts are rate-limited to 5 per 15 minutes,
keyed by email address rather than IP, so a distributed attack against one
account is still throttled.

**User enumeration** — `authorize()` returns `null` identically for "no such
admin" and "wrong password." Distinguishing the two would let an attacker
discover which emails are valid admin accounts.

**Password exposure** — Passwords are bcrypt-hashed with 12 salt rounds and
excluded from query results by default (see Database section above).

**Public API abuse** — `POST /api/requests` is rate-limited to 5 submissions
per 10 minutes per IP, and payloads over 10KB are rejected before validation
or database work.

**Sensitive information disclosure** — `lib/apiResponse.ts` centralises
error handling. Clients receive generic messages; full errors, including
stack traces, are logged server-side only. Database errors, schema details,
and internal paths are never returned to the client.

**Clickjacking / MIME sniffing / referrer leakage** — `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, and a restrictive `Permissions-Policy` are
applied to all routes via `next.config.ts`.

**Secrets management** — No secrets are committed. `.gitignore` covers
`.env*`; `.env.example` documents required variable names with no values;
production secrets live only in Vercel's encrypted environment variables.
Verified with `git log --all --full-history -- .env`, which returns nothing.

### Known Limitations and What Would Change in Production

These are conscious MVP tradeoffs made under a tight timeline, not
oversights:

**Rate limiting is in-memory.** On Vercel's serverless platform, instances
are not guaranteed to share memory, so the limiter is best-effort rather
than strict. *Production fix:* move to Upstash Redis or Vercel KV for
shared state. The limiter was written as a self-contained module
specifically so this swap touches one file.

**Atlas network access is open (`0.0.0.0/0`).** Serverless functions have no
fixed IPs, so IP allow-listing isn't practical here. The real security
boundary is the database credential (long, random, stored only in Vercel's
encrypted env vars), not network filtering. With a fixed-IP backend, this
would be restricted properly.

**Audit writes are not transactional.** If an audit write fails after a
successful update, the failure is logged but the request update still
succeeds. Reasoning: an admin's legitimate action should not be rolled back
by a logging failure. In production, both writes belong in a single MongoDB
transaction.

**Status transitions are unrestricted.** Any status can move to any other
status. This was deliberate — real admin work often needs to move backwards
(e.g. `IN_PROGRESS → REVIEWING` when more information is needed) or cancel
from any state. A stricter state machine with explicit allowed transitions
would be appropriate once the real operational workflow is confirmed with
the business.

**No email notifications.** Customers receive an on-screen reference number
but no email confirmation. Adding this requires a transactional email
provider and ideally a queue, which was out of scope for the timeline.

**Single admin role.** The schema has a `role` field but only `ADMIN`
currently exists. Multi-role authorisation (e.g. read-only viewer,
supervisor) would extend this field rather than requiring a schema change.

---

## Testing

23 tests across 5 files, all passing. Tests run against a real in-memory
MongoDB instance via `mongodb-memory-server`, not mocks — so Mongoose
validation, unique constraints, and `select: false` behaviour are genuinely
exercised rather than assumed.

```bash
npm run test
```

### Coverage of the Required Scenarios

| Required scenario | Test file |
|---|---|
| A valid request can be submitted | `validation.test.ts`, `request-creation.test.ts` |
| Invalid data is rejected | `validation.test.ts` — bad email, short description, malformed category ID, invalid enum, missing fields, NoSQL injection attempts |
| Unauthorised users cannot access protected functionality | `auth-security.test.ts`, plus verified via `curl` against every admin API route |
| An administrator can change a request status | `status-update-audit.test.ts` |
| Important changes are recorded in the audit trail | `status-update-audit.test.ts` |

### Additional Tests Beyond the Minimum

- Category name snapshot survives a category rename after the request was created
- No audit entry is created when an update sets a field to its existing value (a true no-op)
- Multiple sequential status changes each produce their own distinct audit entry
- Soft-cancel preserves the document and logs a `CANCEL` action rather than deleting data
- `passwordHash` is not returned by default queries
- Emails are lowercased at write time to prevent case-variant duplicate accounts
- Rate limiter allows requests within its limit, blocks beyond it, and tracks separate identifiers independently

### Known Testing Gap

Tests target service functions and validation schemas directly rather than
live HTTP endpoints. Next.js Route Handlers are awkward to invoke in
isolation without a running server, and building that test harness was not
the best use of limited time under this deadline. The authorisation layer is
therefore verified manually via `curl` and browser testing rather than
automatically in the test suite. In a production setting, I would add true
end-to-end API tests, likely with Playwright or a running test server
instance.

---

## Scalability: What Breaks at 100,000 Requests

**Rate limiter — breaks first.** In-memory state does not survive across
serverless instances, and the LRU cache is capped at 5,000 tracked
identifiers. *Fix:* Redis-backed limiter (Upstash / Vercel KV).

**Text search — becomes the main bottleneck.** MongoDB's `$text` index
works acceptably at MVP scale but degrades on large collections and offers
no relevance tuning, typo tolerance, or faceted filtering.
*Fix:* MongoDB Atlas Search, or a dedicated search service like Meilisearch.

**Offset pagination — degrades progressively.** `.skip(n)` requires scanning
and discarding `n` documents before returning results, so page 500 is
dramatically slower than page 1.
*Fix:* cursor-based pagination keyed on `createdAt` + `_id`.

**`countDocuments()` on every list request — expensive at scale.** An exact
total count requires a full index scan on every page load.
*Fix:* approximate counts, or cache the total and refresh it periodically
rather than computing it live every time.

**Audit log growth is unbounded.** Every change appends a row forever, with
no archival strategy.
*Fix:* time-based partitioning or archival of old entries to cold storage,
governed by a retention policy.

**Connection pooling under serverless.** Many concurrent function instances
each holding their own Mongoose connections can exhaust Atlas's connection
limits. The global connection cache mitigates this within a single warm
instance, but not across many cold-started ones under sudden load.
*Fix:* MongoDB Data API, or a connection pooler positioned in front of Atlas.

**No caching layer.** The categories endpoint is read constantly and
changes almost never, yet hits the database on every request.
*Fix:* cache it at the edge (e.g. Vercel's Data Cache or a CDN layer) — a
very cheap, high-value win that requires minimal code change.

**Single-collection writes.** All requests currently write to one
collection; at sustained high write volume this becomes a hotspot.
*Fix:* sharding on a well-chosen key, once real access patterns are known
from production traffic — premature sharding without that data would be a
mistake.

---

## AI Usage

AI assistance was used throughout this build. I remain responsible for the
code, and the following documents where it helped, what I accepted, what I
changed, and — importantly — where it was wrong and how I found out.

### Where AI Assisted

- Scaffolding boilerplate: Mongoose schemas, Zod schemas, repetitive Route
  Handler structure across similar endpoints
- Tailwind/shadcn layout markup for the customer landing page and admin
  dashboard views
- Drafting the initial test suite structure using Vitest and
  mongodb-memory-server
- Explaining unfamiliar territory, particularly Next.js 16's App Router
  conventions (the middleware → proxy rename) and NextAuth's integration
  patterns with Server Components

### What I Accepted

- The connection-caching pattern in `lib/db.ts` — accepted after confirming
  it matches the documented approach for Mongoose + Next.js and
  understanding *why* it's needed (hot reload in dev otherwise exhausts the
  connection pool within minutes)
- Schema field constraints across all four models, after reviewing each one
  individually rather than accepting the block wholesale
- Tailwind utility markup, after visually verifying actual rendering rather
  than trusting that the classes were correct by inspection alone

### What I Changed

- **Category list.** The generic example categories from the brief were
  replaced after I researched Wisscano's actual live service offerings.
  Because categories are database-driven, this was a seed-script change, not
  a code change — direct validation of that architectural decision.
- **`lib/db.ts` environment check.** The original implementation threw at
  module import time if `MONGODB_URI` was missing. This silently broke the
  test suite: importing any service module pulled in `db.ts` and crashed
  before `mongodb-memory-server` had a chance to establish its own
  connection. I diagnosed this from the actual stack trace, moved the check
  inside `connectDB()`, and added a `readyState` check so an already-open
  connection (as used in tests) is reused instead of conflicting.
- **Admin login page structure.** The initial pattern put `"use client"` at
  the top of the entire page file. This built and ran fine locally, but
  **failed on Vercel** with `ERR_INVALID_URL` during the production build,
  because Next.js attempts to statically pre-render pages at build time, and
  NextAuth's client-side import tried to parse an empty `NEXTAUTH_URL`
  during that pre-render. I diagnosed this from the Vercel build log,
  researched the App Router pre-rendering behaviour, and restructured the
  page into a Server Component wrapper with `export const dynamic =
  "force-dynamic"`, plus a separate Client Component for the actual
  interactive form. I would not have found the real cause without reading
  the build log carefully rather than guessing.
- **Validation module coupling.** `lib/validations.ts` originally imported
  status/contact enums directly from a Mongoose model file. This would have
  pulled Mongoose into the client-side bundle the moment the form imported
  the validation schema. I extracted `lib/request-constants.ts` as a
  dependency-free shared source of truth, imported by both the model and the
  validation layer independently.
- **Tailwind v4 custom property syntax.** An earlier design pass used
  classes like `text-[--color-signal]`. This compiles without error but
  produces invalid CSS at runtime — Tailwind inserts the raw value literally
  rather than wrapping it in `var()`, so the browser silently ignores the
  declaration and colours fall back to inherited defaults. There is no
  compiler or lint error for this; it was only caught by comparing the
  rendered page against the intended design. Fixed by using the declared
  theme tokens as first-class Tailwind utilities instead of arbitrary-value
  syntax.

### What I Rejected

- Embedding the audit trail as an array inside the request document.
  Rejected for the reasons in the Database section: unbounded document
  growth and loss of independently paginated audit history.
- Hard deletion for the "delete" admin action. Replaced with a soft-cancel
  (`status: CANCELLED`) to preserve referential integrity for the audit
  trail and to match real-world practice of retaining service records.
- A strictly linear status state machine (`NEW → REVIEWING → IN_PROGRESS →
  COMPLETED` only, no other transitions). Rejected as not matching realistic
  admin workflows, and documented explicitly as a conscious decision rather
  than silently left out.
- Any generated code referencing APIs I could not verify against the
  specific installed package versions in this project (Next 16, NextAuth
  4.24, React 19 is an unusually new combination). Where behaviour was
  uncertain, I tested it directly rather than assuming documentation written
  for older versions still applied.

### How Generated Code Was Verified

1. `npm run typecheck` after every meaningful change — TypeScript catches a
   large class of integration mistakes immediately
2. `npm run test` — 23 tests running against a real, disposable MongoDB
   instance, not mocks
3. Direct `curl` requests against every API endpoint, including deliberately
   malformed input, missing auth, and boundary conditions
4. Manual browser testing of every user-facing flow, at both desktop and
   mobile viewport widths
5. `npm run build` before every deployment — this is specifically what
   caught the login page pre-rendering issue that local `npm run dev` never
   surfaced, since `next dev` does not perform the same static generation
   step as a production build

### Problems Hit and How They Were Resolved

Recorded here because the brief specifically asks how I respond when
something doesn't work, not just what the end result looks like:

| Problem | How it was resolved |
|---|---|
| `middleware.ts` threw an export error on Next 16 | Researched the framework's rename to `proxy.ts`; removed the empty placeholder file rather than force an incorrect function signature, and implemented the real logic properly once the auth phase was reached |
| Seed script couldn't find environment variables | Diagnosed a filename mismatch between `.env` and `.env.local` from the loader's own diagnostic output, rather than guessing at the cause |
| Route files silently 404'd | Traced it to files that were referenced in instructions but never actually written to disk; verified with `find` before creating anything further, rather than assuming previous steps had succeeded |
| Test suite crashed immediately on import | Traced the failure to a module-level `throw` in `db.ts` firing before the test's own database setup could run; made the environment check lazy instead of eager |
| Vercel build failed while local build passed | Read the actual Vercel build log rather than re-guessing locally; identified build-time static pre-rendering as the root cause and restructured the affected page correctly |
| Brand colours silently not rendering | Did not trust that the code "looked right" — visually compared the rendered page against intent, found invalid Tailwind v4 arbitrary-value syntax as the actual cause |

---

## Status Model

```
NEW → REVIEWING → IN_PROGRESS → COMPLETED
 └──────────┴─────────────┴──────→ CANCELLED
```

Transitions between any two statuses are permitted rather than enforced as a
strict linear pipeline (see Security → Known Limitations for the reasoning).
Cancellation is always a soft status change, never a hard deletion — the
record and its full audit history are preserved indefinitely.

---

## API Reference

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/categories` | Public | Active service categories for the request form |
| `POST` | `/api/requests` | Public (rate-limited) | Submit a new service request |
| `GET` | `/api/requests` | Admin | List requests with search, status filter, and pagination |
| `GET` | `/api/requests/:id` | Admin | Retrieve a single request |
| `PATCH` | `/api/requests/:id` | Admin | Update fields; writes an audit entry per changed field |
| `DELETE` | `/api/requests/:id` | Admin | Soft-cancel a request; writes a `CANCEL` audit entry |
| `GET` | `/api/requests/:id/audit` | Admin | Full audit history for a request |

All admin endpoints return `401 Unauthorized` with a generic message when no
valid session is present — no internal details are leaked in the response.

---

## License

Built as a technical assessment / MVP demonstration project for Wisscano.