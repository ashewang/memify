"use client";

import { useState } from "react";

import type {
  MemeGenerationRequest,
  MemeGenerationResponse,
} from "@/types/api";

type MemeGeneratorProps = {
  userId?: string;
};

type ContextType = NonNullable<MemeGenerationRequest["context_type"]>;

const defaultForm: MemeGenerationRequest = {
  context_type: "text",
  text_snippet: "",
  tags_hint: [],
};

export function MemeGenerator({ userId }: MemeGeneratorProps) {
  const [form, setForm] = useState<MemeGenerationRequest>({
    ...defaultForm,
    user_id: userId,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MemeGenerationResponse | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.text_snippet && !form.image_base64) {
      setError("Please add a text snippet or screenshot first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/memes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to generate meme.");
      }

      const payload =
        (await response.json()) as MemeGenerationResponse;
      setResult(payload);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_minmax(0,1fr)]">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <label
            htmlFor="text-snippet"
            className="text-sm font-medium text-neutral-800"
          >
            Context
          </label>

          <select
            value={form.context_type}
            onChange={(event) => {
              const value = event.target.value as ContextType;
              setForm((state) => ({
                ...state,
                context_type: value,
              }));
            }}
            className="rounded-full border border-neutral-300 px-3 py-1 text-xs uppercase tracking-[0.2em] text-neutral-500"
          >
            <option value="text">Text</option>
            <option value="screenshot">Screenshot</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        <textarea
          id="text-snippet"
          className="min-h-[220px] w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
          placeholder="Paste the message, thread, or idea you want to memeify..."
          value={form.text_snippet ?? ""}
          onChange={(event) =>
            setForm((state) => ({
              ...state,
              text_snippet: event.target.value,
            }))
          }
        />

        <div className="flex flex-col gap-2">
          <label htmlFor="tags" className="text-sm font-medium text-neutral-800">
            Humor vibes (comma separated)
          </label>
          <input
            id="tags"
            type="text"
            className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
            placeholder="e.g. relatable, sarcasm, pop culture"
            value={form.tags_hint?.join(", ") ?? ""}
            onChange={(event) =>
              setForm((state) => ({
                ...state,
                tags_hint: event.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              }))
            }
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate meme concept"}
        </button>

        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <p className="text-xs text-neutral-400">
            Screenshots coming soon — paste a base64 payload to experiment
            early.
          </p>
        )}
      </form>

      <aside className="flex flex-col gap-4 rounded-3xl border border-dashed border-neutral-300 bg-white/80 p-6 text-sm text-neutral-700 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-900">
          AI draft preview
        </h2>

        {!result && !loading && (
          <p className="text-sm text-neutral-500">
            Run the generator to see suggested templates, captions, and safety
            notes.
          </p>
        )}

        {loading && (
          <p className="animate-pulse text-neutral-500">
            Analyzing humor signals and pulling templates...
          </p>
        )}

        {result && (
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                Template
              </span>
              <p className="text-lg font-semibold text-neutral-900">
                {result.template.display_name}
              </p>
              <p className="text-xs text-neutral-500">
                Ratio {result.template.aspect_ratio} · Humor tags{" "}
                {result.template.humor_categories.join(", ")}
              </p>
            </section>

            <section className="flex flex-col gap-2 rounded-2xl bg-neutral-50 p-4">
              <h3 className="text-sm font-semibold text-neutral-900">
                Caption Draft
              </h3>
              <p className="text-sm text-neutral-800">
                <strong>Setup:</strong> {result.captions.setup}
              </p>
              <p className="text-sm text-neutral-800">
                <strong>Punchline:</strong> {result.captions.punchline}
              </p>
              {result.captions.alternates.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                    Alternates
                  </span>
                  <ul className="space-y-1 text-sm text-neutral-700">
                    {result.captions.alternates.map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {result.humor_categories.length > 0 && (
              <section className="flex flex-wrap gap-2">
                {result.humor_categories.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-neutral-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-neutral-500"
                  >
                    {tag}
                  </span>
                ))}
              </section>
            )}

            {result.reasoning && (
              <section className="rounded-2xl border border-neutral-200 bg-white p-4 text-xs text-neutral-500">
                {result.reasoning}
              </section>
            )}

            {result.safety.length > 0 && (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em]">
                  Safety Signals
                </h3>
                <ul className="space-y-2">
                  {result.safety.map((signal) => (
                    <li key={signal.flag}>
                      <strong>{signal.flag}</strong> · {signal.severity} —{" "}
                      {signal.rationale}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
