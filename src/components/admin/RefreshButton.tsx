"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RefreshButton({ conferenceId, label }: { conferenceId: string; label: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  function refreshPage() {
    router.refresh();
    window.location.reload();
  }

  async function handleRefresh() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/conferences/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: conferenceId }),
      });
      const data = await res.json();
      if (data.error) {
        setResult(`Error: ${data.error}`);
      } else {
        const keys = Object.keys(data.updates || {});
        setResult(keys.length > 0 ? `Updated: ${keys.join(", ")}` : "No new info found");
        refreshPage();
      }
    } catch {
      setResult("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="rounded-md border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-600 hover:bg-surface-sunk disabled:opacity-50 transition-colors"
      >
        {loading ? "..." : label}
      </button>
      {result && <span className="text-[11px] text-ink-500">{result}</span>}
    </div>
  );
}
