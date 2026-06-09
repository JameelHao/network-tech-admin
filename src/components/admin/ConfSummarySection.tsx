"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConfSummarySection({
  confId,
  initialSummary,
}: {
  confId: string;
  initialSummary?: string | null;
}) {
  const [summary, setSummary] = useState(initialSummary ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/conferences/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: confId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setSummary(json.summary);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-lg border border-line bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-line bg-paper/30">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">AI Analysis</p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="text-[11px] font-mono text-navy-500 hover:text-navy-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Generating..." : summary ? "Regenerate" : "Generate"}
        </button>
      </div>
      <div className="p-5">
        {error && <p className="text-[12px] text-rose-600 mb-2">{error}</p>}
        {summary ? (
          <div className="text-[13px] text-ink-700 leading-relaxed whitespace-pre-line">
            {summary.split("\n\n").map((p, i) => (
              <p key={i} className="mb-2 last:mb-0">{p}</p>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[13px] text-ink-400">No AI analysis yet</p>
            <p className="text-[11px] text-ink-400 mt-1">Sessions data is available. Click Generate to create an AI summary of this conference.</p>
          </div>
        )}
      </div>
    </section>
  );
}
