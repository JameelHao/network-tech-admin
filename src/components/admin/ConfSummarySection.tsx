"use client";

export function ConfSummarySection({
  initialSummary,
}: {
  confId?: string;
  initialSummary?: string | null;
}) {
  if (!initialSummary) return null;

  return (
    <section className="rounded-lg border border-line bg-surface overflow-hidden">
      <div className="px-5 py-3 border-b border-line bg-paper/30">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">AI Analysis</p>
      </div>
      <div className="p-5">
        <div className="text-[13px] text-ink-700 leading-relaxed whitespace-pre-line">
          {initialSummary.split("\n\n").map((p, i) => (
            <p key={i} className="mb-2 last:mb-0">{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
