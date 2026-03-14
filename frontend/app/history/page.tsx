"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { getAuthHeaders } from "@/lib/auth-fetch";

type TranscriptItem = {
  id: string;
  filename: string | null;
  text: string | null;
  created_at: string | null;
  audio_url?: string | null;
};

export default function History() {
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTranscript, setSelectedTranscript] = useState<TranscriptItem | null>(null);

  useEffect(() => {
    const loadTranscripts = async () => {
      try {
        const headers = await getAuthHeaders();
        const authedRes = await fetch("/api/transcripts", { headers });
        const data = await authedRes.json();

        if (!authedRes.ok) {
          throw new Error(data?.details || data?.error || "Failed to load transcripts");
        }

        setTranscripts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load transcripts");
      } finally {
        setIsLoading(false);
      }
    };

    loadTranscripts();
  }, []);

  return (
    <RequireAuth>
      <div className="pb-6">
        <section className="elevated-card rounded-3xl p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-500">Archive</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-3xl font-semibold text-slate-900">Transcript History</h1>
            <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              {transcripts.length} saved items
            </span>
          </div>

          {isLoading ? <p className="mt-6 text-sm text-slate-500">Loading transcripts...</p> : null}
          {error ? <p className="mt-6 text-sm text-rose-600">{error}</p> : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {transcripts.map((item) => {
              const preview = (item.text || "No transcript text").slice(0, 150);
              const dateText = item.created_at
                ? new Date(item.created_at).toLocaleString()
                : "Unknown date";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedTranscript(item)}
                  className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-slate-900">
                      {item.filename || "Untitled recording"}
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{dateText}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{preview}</p>
                  <p className="mt-3 text-xs font-medium text-teal-700">Open full transcript</p>
                </button>
              );
            })}
            {!isLoading && !error && transcripts.length === 0 ? (
              <p className="text-sm text-slate-500">No transcripts found yet.</p>
            ) : null}
          </div>
        </section>

        {selectedTranscript ? (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/45 p-4">
            <div className="elevated-card max-h-[85vh] w-full max-w-3xl overflow-auto rounded-3xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {selectedTranscript.filename || "Untitled recording"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedTranscript.created_at
                      ? new Date(selectedTranscript.created_at).toLocaleString()
                      : "Unknown date"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTranscript(null)}
                  className="btn-muted rounded-lg px-3 py-2 text-sm font-medium"
                >
                  Close
                </button>
              </div>

              <textarea
                readOnly
                value={selectedTranscript.text || "No transcript text"}
                className="field mt-5 min-h-72 w-full rounded-2xl p-4 text-sm leading-relaxed"
              />

              {selectedTranscript.audio_url ? (
                <a
                  href={selectedTranscript.audio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-sm font-medium text-teal-700 hover:text-teal-800"
                >
                  Open recorded audio
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </RequireAuth>
  );
}
