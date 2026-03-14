"use client";

type TranscriptPanelProps = {
  transcript: string;
};

export default function TranscriptPanel({ transcript }: TranscriptPanelProps) {
  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  return (
    <section className="elevated-card rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Output</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Transcript</h2>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
          {wordCount} words
        </div>
      </div>

      <textarea
        className="field min-h-44 w-full resize-y rounded-xl p-3 text-sm leading-relaxed"
        placeholder="Your transcript will appear here..."
        value={transcript}
        readOnly
      />
    </section>
  );
}
