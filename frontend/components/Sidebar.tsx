"use client";

import { useEffect, useMemo, useState } from "react";
import { getAuthHeaders } from "@/lib/auth-fetch";

type TranscriptItem = {
  id: string;
  filename: string | null;
  text: string | null;
};

export default function Sidebar() {
  const [query, setQuery] = useState("");
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);

  useEffect(() => {
    const loadTranscripts = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch("/api/transcripts", { headers });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setTranscripts(data);
        }
      } catch {
        setTranscripts([]);
      }
    };

    loadTranscripts();
  }, []);

  const filteredTranscripts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transcripts.slice(0, 8);

    return transcripts
      .filter((item) => {
        const filename = (item.filename || "").toLowerCase();
        const text = (item.text || "").toLowerCase();
        return filename.includes(q) || text.includes(q);
      })
      .slice(0, 8);
  }, [query, transcripts]);

  return (
    <section className="elevated-card h-full rounded-2xl p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-slate-900">Past Transcripts</h2>
      <p className="mt-1 text-xs text-slate-500">Quickly revisit recent sessions.</p>

      <input
        placeholder="Search transcripts..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="field mt-3 w-full rounded-lg px-3 py-2 text-xs"
      />

      <ul className="mt-4 space-y-2">
        {filteredTranscripts.map((item) => (
          <li key={item.id}>
            <button className="w-full rounded-lg border border-transparent bg-slate-50 px-3 py-2.5 text-left transition hover:border-teal-100 hover:bg-teal-50/50">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-800">
                  {item.filename || "Untitled recording"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                {(item.text || "No transcript text").slice(0, 90)}
              </p>
            </button>
          </li>
        ))}
        {filteredTranscripts.length === 0 ? (
          <li className="text-xs text-slate-500">No matching transcripts.</li>
        ) : null}
      </ul>
    </section>
  );
}
