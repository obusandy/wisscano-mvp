"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { z } from "zod";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createRequestSchema,
  type CreateRequestInput,
} from "@/lib/validations";

const categoriesResponseSchema = z.object({
  categories: z.array(
    z.object({
      _id: z.string().regex(/^[0-9a-fA-F]{24}$/),
      name: z.string().min(1),
    })
  ),
});

const submissionResponseSchema = z.object({
  requestId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

const errorResponseSchema = z.object({
  error: z.string(),
});

type Category = z.infer<
  typeof categoriesResponseSchema
>["categories"][number];

type CategoryState =
  | { status: "loading" }
  | { status: "ready"; categories: Category[] }
  | { status: "error"; message: string };

type FieldName = keyof CreateRequestInput;
type FieldErrors = Partial<Record<FieldName, string[]>>;

type Receipt = {
  id: string;
  firstName: string;
  preferredContact: CreateRequestInput["preferredContact"];
};

function Field({
  name,
  label,
  error,
  children,
}: {
  name: FieldName;
  label: string;
  error?: string[];
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
        <span aria-hidden="true" className="ml-1 text-emerald-700">
          *
        </span>
      </Label>

      {children}

      {error?.[0] && (
        <p
          id={`${name}-error`}
          role="alert"
          className="text-sm text-red-700"
        >
          {error[0]}
        </p>
      )}
    </div>
  );
}

const inputClassName =
  "h-11 border-slate-200 bg-white text-slate-900 " +
  "focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20";

export function RequestForm() {
  const [categoryState, setCategoryState] = useState<CategoryState>({
    status: "loading",
  });
  const [retryKey, setRetryKey] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [copyState, setCopyState] = useState<
    "idle" | "copied" | "failed"
  >("idle");

  const formRef = useRef<HTMLFormElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const submissionLock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch("/api/categories", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Categories endpoint returned an error");
        }

        const payload: unknown = await response.json();
        const data = categoriesResponseSchema.parse(payload);

        if (controller.signal.aborted) return;

        if (data.categories.length === 0) {
          setCategoryState({
            status: "error",
            message:
              "No services are available yet. Please try again shortly.",
          });
          return;
        }

        setCategoryState({
          status: "ready",
          categories: data.categories,
        });
      } catch {
        if (!controller.signal.aborted) {
          setCategoryState({
            status: "error",
            message:
              "We couldn't load the services. Check your connection and retry.",
          });
        }
      }
    }

    void loadCategories();

    return () => controller.abort();
  }, [retryKey]);

  useEffect(() => {
    if (receipt) {
      successHeadingRef.current?.focus();
    }
  }, [receipt]);

  const categories =
    categoryState.status === "ready" ? categoryState.categories : [];

  function fieldAttributes(name: FieldName) {
    const hasError = Boolean(errors[name]?.length);

    return {
      id: name,
      name,
      required: true,
      "aria-invalid": hasError,
      "aria-describedby": hasError ? `${name}-error` : undefined,
    };
  }

  function retryCategories() {
    setCategoryState({ status: "loading" });
    setRetryKey((current) => current + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      submissionLock.current ||
      categoryState.status !== "ready"
    ) {
      return;
    }

    setErrors({});
    setFormError(null);

    const values = Object.fromEntries(
      new FormData(event.currentTarget)
    );
    const result = createRequestSchema.safeParse(values);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);

      const firstField = result.error.issues[0]?.path[0];

      if (typeof firstField === "string") {
        formRef.current
          ?.querySelector<HTMLElement>(`[name="${firstField}"]`)
          ?.focus();
      }

      return;
    }

    // Prevent overlapping submissions, including rapid double-clicks.
    submissionLock.current = true;
    setSubmitting(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      });

      const payload: unknown = await response.json();

      if (!response.ok) {
        const failure = errorResponseSchema.safeParse(payload);

        setFormError(
          failure.success
            ? failure.data.error
            : "We couldn't submit your request. Please try again shortly."
        );

        return;
      }

      const saved = submissionResponseSchema.parse(payload);

      setReceipt({
        id: saved.requestId,
        firstName: result.data.fullName.split(/\s+/)[0] ?? "there",
        preferredContact: result.data.preferredContact,
      });
    } catch {
      // A network failure can occur after the server saves the request.
      // Do not automatically retry POST requests and risk duplicates.
      setFormError(
        "We couldn't confirm your submission. It may have been received. " +
          "Please check your connection before trying again."
      );
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  }

  async function copyReference() {
    if (!receipt) return;

    try {
      await navigator.clipboard.writeText(receipt.id);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  if (receipt) {
    return (
      <div className="px-6 py-12 text-center sm:px-10">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2
            aria-hidden="true"
            className="size-10 text-emerald-600"
          />
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
          REQUEST RECEIVED
        </span>

        <h2
          id="request-form-heading"
          ref={successHeadingRef}
          tabIndex={-1}
          className="mt-5 break-words text-3xl font-semibold tracking-tight text-slate-950 outline-none"
        >
          Thanks, {receipt.firstName}.
          <br />
          We&apos;ll take it from here.
        </h2>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-600">
          Your request has been saved. The team will review your
          requirements and follow up by{" "}
          {receipt.preferredContact === "EMAIL" ? "email" : "phone"}.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Request reference
            </p>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              New
            </span>
          </div>

          <code className="mt-3 block select-all break-all text-sm font-semibold text-slate-900">
            {receipt.id}
          </code>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyReference}
            className="mt-4"
          >
            {copyState === "copied" ? (
              <Check aria-hidden="true" className="size-4" />
            ) : (
              <Copy aria-hidden="true" className="size-4" />
            )}
            {copyState === "copied" ? "Copied" : "Copy reference"}
          </Button>

          <p aria-live="polite" className="mt-2 text-xs text-slate-500">
            {copyState === "failed"
              ? "Clipboard unavailable. Select and copy the reference above."
              : "Keep this reference for any follow-up."}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => {
            setReceipt(null);
            setCopyState("idle");
            setErrors({});
            setFormError(null);
          }}
          className="mt-7 h-11 w-full bg-slate-950 text-white hover:bg-slate-800"
        >
          Submit another request
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-7">
        <div className="mb-3 flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Let&apos;s get started
          </p>
        </div>

        <h2
          id="request-form-heading"
          className="text-2xl font-semibold tracking-tight text-slate-950"
        >
          Tell us what you need
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Share a few details so we can understand your request.
          All fields are required.
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        aria-busy={submitting}
        className="space-y-5"
      >
        <fieldset disabled={submitting} className="min-w-0 space-y-5">
          <legend className="sr-only">
            Customer and service request details
          </legend>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              name="fullName"
              label="Full name"
              error={errors.fullName}
            >
              <Input
                {...fieldAttributes("fullName")}
                autoComplete="name"
                maxLength={120}
                placeholder="Jane Doe"
                className={inputClassName}
              />
            </Field>

            <Field name="email" label="Email address" error={errors.email}>
              <Input
                {...fieldAttributes("email")}
                type="email"
                autoComplete="email"
                maxLength={200}
                placeholder="jane@example.com"
                className={inputClassName}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="phone" label="Phone number" error={errors.phone}>
              <Input
                {...fieldAttributes("phone")}
                type="tel"
                autoComplete="tel"
                maxLength={20}
                placeholder="+254 712 345 678"
                className={inputClassName}
              />
            </Field>

            <Field
              name="categoryId"
              label="Service required"
              error={errors.categoryId}
            >
              <div className="relative">
                <select
                  {...fieldAttributes("categoryId")}
                  defaultValue=""
                  disabled={categoryState.status !== "ready"}
                  className="h-11 w-full appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-900 shadow-xs outline-none transition focus-visible:border-emerald-500 focus-visible:ring-[3px] focus-visible:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-red-500"
                >
                  <option value="" disabled>
                    {categoryState.status === "loading"
                      ? "Loading services..."
                      : "Select a service"}
                  </option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-3.5 size-4 text-slate-400"
                />
              </div>
            </Field>
          </div>

          {categoryState.status === "error" && (
            <div
              role="alert"
              className="rounded-xl border border-amber-200 bg-amber-50 p-4"
            >
              <p className="text-sm text-amber-900">
                {categoryState.message}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={retryCategories}
                className="mt-3"
              >
                <RefreshCw aria-hidden="true" className="size-4" />
                Retry loading services
              </Button>
            </div>
          )}

          <fieldset
            aria-describedby={
              errors.preferredContact
                ? "preferredContact-error"
                : undefined
            }
          >
            <legend className="mb-2 text-sm font-medium text-slate-700">
              Preferred contact method
              <span aria-hidden="true" className="ml-1 text-emerald-700">
                *
              </span>
            </legend>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "EMAIL", label: "Email", Icon: Mail },
                { value: "PHONE", label: "Phone", Icon: Phone },
              ].map(({ value, label, Icon }) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-sm text-slate-700 transition has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50"
                >
                  <input
                    type="radio"
                    name="preferredContact"
                    value={value}
                    defaultChecked={value === "EMAIL"}
                    required
                    className="size-4 accent-emerald-600"
                  />
                  <Icon
                    aria-hidden="true"
                    className="size-4 text-slate-500"
                  />
                  {label}
                </label>
              ))}
            </div>

            {errors.preferredContact?.[0] && (
              <p
                id="preferredContact-error"
                role="alert"
                className="mt-2 text-sm text-red-700"
              >
                {errors.preferredContact[0]}
              </p>
            )}
          </fieldset>

          <Field
            name="description"
            label="How can we help?"
            error={errors.description}
          >
            <Textarea
              {...fieldAttributes("description")}
              rows={4}
              maxLength={2000}
              placeholder="Tell us what you need. Include useful details such as equipment, quantities, location, or the problem you're experiencing."
              className="min-h-32 resize-y border-slate-200 bg-white text-slate-900 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
            />
            <p className="text-xs leading-5 text-slate-500">
              10–2,000 characters. Please do not include passwords, PINs,
              payment details, or other confidential information.
            </p>
          </Field>
        </fieldset>

        {formError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
          >
            {formError}
          </div>
        )}

        <Button
          type="submit"
          disabled={submitting || categoryState.status !== "ready"}
          className="h-12 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          {submitting ? (
            <>
              <Loader2
                aria-hidden="true"
                className="size-4 animate-spin"
              />
              Submitting your request...
            </>
          ) : (
            <>
              Submit request
              <ArrowRight aria-hidden="true" className="size-4" />
            </>
          )}
        </Button>

        <p className="text-center text-xs leading-5 text-slate-500">
          Your contact details help the team follow up on this request.
        </p>
      </form>
    </div>
  );
}
