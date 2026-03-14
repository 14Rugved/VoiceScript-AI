"use client";

import { useState } from "react";
import RecorderPanel from "@/components/RecorderPanel";
import TranscriptPanel from "@/components/TranscriptPanel";
import Sidebar from "@/components/Sidebar";
import RequireAuth from "@/components/RequireAuth";
import { getAuthHeaders } from "@/lib/auth-fetch";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [keyterms, setKeyterms] = useState("");

  const sendAudio = async (
    blob: Blob,
    fileName = "recording.webm",
    transcriptionHints = ""
  ) => {
    setError("");
    setIsUploading(true);

    const form = new FormData();
    form.append("file", blob, fileName);
    form.append("keyterms", transcriptionHints || keyterms);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: form,
        headers,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.details || data?.error || "Transcription failed");
        return;
      }

      setTranscript(data.transcript ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <RequireAuth>
      <div className="grid gap-6 pb-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="space-y-6">
          <RecorderPanel
            keyterms={keyterms}
            onKeytermsChange={setKeyterms}
            onRecorded={sendAudio}
          />
          {isUploading ? (
            <p className="text-sm text-slate-500">Uploading and transcribing audio...</p>
          ) : null}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <TranscriptPanel transcript={transcript} />
        </section>
        <aside>
          <Sidebar />
        </aside>
      </div>
    </RequireAuth>
  );
}
