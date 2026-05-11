"use client";

type Props = {
  entity: string;
  format: "csv" | "json";
  filters?: Record<string, string>;
  label: string;
};

export function ExportButton({ entity, format, filters = {}, label }: Props) {
  const params = new URLSearchParams({ format, ...filters });
  const href = `/api/export/${entity}?${params.toString()}`;

  return (
    <a
      href={href}
      download
      className="rounded-md border border-line px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-600 hover:bg-paper/60 transition-colors"
    >
      ↓ {label}
    </a>
  );
}
