"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace("/");
  };

  const signUp = async () => {
    setError("");
    setMessage("");
    setIsLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setIsLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage("Signup successful. Check your email if confirmation is enabled.");
  };

  return (
    <div className="mx-auto max-w-md pb-10 pt-8">
      <section className="elevated-card rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Sign In</h1>
        <p className="mt-1 text-sm text-slate-500">Use your account to access recording and transcripts.</p>

        <form className="mt-5 space-y-3" onSubmit={signIn}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field w-full rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field w-full rounded-lg px-3 py-2 text-sm"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full rounded-lg px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Please wait..." : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          onClick={signUp}
          disabled={isLoading}
          className="btn-muted mt-3 w-full rounded-lg px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          Create Account
        </button>

        {message ? <p className="mt-3 text-sm text-teal-700">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </section>
    </div>
  );
}
