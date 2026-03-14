"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type RecorderPanelProps = {
  keyterms?: string;
  onKeytermsChange?: (value: string) => void;
  onRecorded?: (blob: Blob, fileName?: string, keyterms?: string) => Promise<void> | void;
};

function formatTime(totalSeconds: number) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function RecorderPanel({
  keyterms = "",
  onKeytermsChange,
  onRecorded,
}: RecorderPanelProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!isRecording) return;
    const timer = window.setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const statusText = useMemo(() => {
    if (error) return "Recorder error";
    if (isUploading) return "Uploading audio for transcription";
    if (isRecording) return "Recording in progress";
    return "Ready to record or upload";
  }, [error, isRecording, isUploading]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    if (isRecording || isUploading) return;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("This browser does not support microphone access.");
        return;
      }

      if (typeof MediaRecorder === "undefined") {
        setError("This browser does not support audio recording.");
        return;
      }

      setError("");
      setFileName("");
      setSeconds(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const preferredTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
      const supportedType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type));

      const recorder = supportedType
        ? new MediaRecorder(stream, { mimeType: supportedType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsRecording(false);

        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        stopStream();

        if (!onRecorded || blob.size === 0) return;

        const extension = mimeType.includes("mp4") ? "m4a" : "webm";
        const defaultName = `recording-${Date.now()}.${extension}`;
        const enteredName = window.prompt("Name this recording:", defaultName);
        const finalName = (enteredName || "").trim() || defaultName;
        setFileName(finalName);

        try {
          setIsUploading(true);
          await onRecorded(blob, finalName, keyterms);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setIsRecording(true);
    } catch {
      setError("Microphone access failed. Please allow mic permission and try again.");
      stopStream();
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setFileName(file.name);
    if (!onRecorded) return;

    try {
      setIsUploading(true);
      await onRecorded(file, file.name, keyterms);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="elevated-card rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-teal-700">Recorder</p>
          <h1 className="mt-1 text-lg font-semibold text-slate-900 sm:text-xl">Capture your voice</h1>
        </div>
        <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-medium text-teal-700">
          {statusText}
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[0.85fr_1.15fr] md:items-center">
        <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isUploading}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-teal-700 shadow-inner shadow-teal-200/60 transition ${
              isRecording ? "bg-rose-100 text-rose-600" : "bg-white"
            } disabled:cursor-not-allowed disabled:opacity-55`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
              <rect x="9" y="2.5" width="6" height="12" rx="3" />
              <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
              <path d="M12 18v3.5" />
              <path d="M9 21.5h6" />
            </svg>
          </button>
          <div className="mt-3 text-center text-2xl font-semibold tracking-tight text-slate-900">{formatTime(seconds)}</div>
          <p className="mt-1 text-center text-xs text-slate-500">Session timer</p>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-1.5">
            {[...Array(18)].map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${isRecording && i % 2 === 0 ? "bg-teal-600" : "bg-slate-200"}`}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startRecording}
              disabled={isRecording || isUploading}
              className="btn-primary rounded-lg px-3.5 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-55"
            >
              Start Recording
            </button>
            <button
              type="button"
              onClick={stopRecording}
              disabled={!isRecording || isUploading}
              className="rounded-lg bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-55"
            >
              Stop Recording
            </button>
            <button
              type="button"
              onClick={() => {
                stopRecording();
                stopStream();
                setIsRecording(false);
                setSeconds(0);
                setError("");
                setFileName("");
              }}
              className="btn-muted rounded-lg px-3.5 py-2 text-xs font-semibold"
            >
              Reset
            </button>
          </div>

          <label className="mt-3 block w-full cursor-pointer rounded-xl border border-dashed border-teal-300 bg-teal-50/40 p-3 text-center transition hover:bg-teal-50">
            <span className="text-xs font-medium text-teal-800">Upload audio file</span>
            <p className="mt-1 text-[11px] text-slate-500">MP3, WAV, M4A, WebM</p>
            <input type="file" accept="audio/*" className="hidden" onChange={handleUpload} disabled={isUploading} />
          </label>

          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Names / keywords to recognize
            </label>
            <input
              type="text"
              value={keyterms}
              onChange={(event) => onKeytermsChange?.(event.target.value)}
              placeholder="Example: Rugved, Deepgram, Supabase"
              className="field w-full rounded-lg px-3 py-2 text-xs"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Separate important names with commas to improve recognition.
            </p>
          </div>

          {fileName ? <p className="mt-2 text-xs text-slate-600">Selected file: {fileName}</p> : null}
          {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
