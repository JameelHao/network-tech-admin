"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RefreshAllButton({ label }: { label: string }) {
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
      const res = await fetch("/api/conferences/refresh-all", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setResult(`Error: ${data.error}`);
      } else {
        const updated = data.results?.filter((r: { updates: Record<string, string> }) => Object.keys(r.updates).length > 0).length ?? 0;
        setResult(`${updated}/${data.results?.length ?? 0} updated`);
        refreshPage();
      }
    } catch {
      setResult("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="rounded-md border border-gold-300 bg-gold-50 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold-700 hover:bg-gold-100 disabled:opacity-50 transition-colors"
    >
      {loading ? "Refreshing..." : label}
      {result && <span className="ml-2 normal-case tracking-normal">{result}</span>}
    </button>
  );
}
