"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function RegisterForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const setup = async () => {
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const type = searchParams.get("type");
      if (!accessToken || type !== "invite") {
        setError("Invalid or expired invite link. Please request a new invitation.");
        return;
      }
      const supabase = createClient();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "",
      });
      if (sessionError) {
        setError("Session error: " + sessionError.message);
        return;
      }
      setReady(true);
    };
    setup();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    }
    setSending(false);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="bg-surface p-8 rounded-xl border border-line shadow-sm max-w-sm w-full mx-4 text-center">
          <p className="text-emerald-600 font-medium text-[15px]">Password set successfully!</p>
          <p className="text-[13px] text-ink-500 mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50">
      <div className="bg-surface p-8 rounded-xl border border-line shadow-sm max-w-sm w-full mx-4">
        <h1 className="text-[18px] font-semibold text-ink-800 mb-1">Set your password</h1>
        <p className="text-[13px] text-ink-500 mb-6">You were invited. Choose a password to get started.</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200">
            <p className="text-[12px] text-rose-700">{error}</p>
          </div>
        )}

        {!ready && !error && (
          <p className="text-[13px] text-ink-400 text-center py-4">Verifying invitation...</p>
        )}

        {ready && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
                className="w-full px-3 py-2 rounded-lg border border-line text-[13px] bg-paper text-ink-800 focus:outline-none focus:ring-2 focus:ring-navy-300"
              />
            </div>
            <button
              type="submit"
              disabled={sending || password.length < 6}
              className="w-full py-2.5 rounded-lg bg-navy-500 text-white text-[13px] font-medium hover:bg-navy-700 transition-colors disabled:opacity-50"
            >
              {sending ? "Setting password..." : "Set password & login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <p className="text-ink-400 text-[13px]">Loading...</p>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
