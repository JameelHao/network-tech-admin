"use client";

export function StarRangeFilter({
  starsMin,
  starsMax,
  filterParams,
}: {
  starsMin?: string;
  starsMax?: string;
  filterParams: Record<string, string>;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        placeholder="Min"
        defaultValue={starsMin ?? ""}
        className="w-20 rounded-md border border-line bg-paper px-2 py-1 text-[12px] font-mono"
        onBlur={(e) => {
          const p = new URLSearchParams(filterParams);
          p.delete("page");
          if (e.target.value) p.set("starsMin", e.target.value);
          else p.delete("starsMin");
          window.location.href = `/admin/opensource?${p.toString()}`;
        }}
      />
      <span className="text-ink-400 text-[11px]">—</span>
      <input
        type="number"
        placeholder="Max"
        defaultValue={starsMax ?? ""}
        className="w-20 rounded-md border border-line bg-paper px-2 py-1 text-[12px] font-mono"
        onBlur={(e) => {
          const p = new URLSearchParams(filterParams);
          p.delete("page");
          if (e.target.value) p.set("starsMax", e.target.value);
          else p.delete("starsMax");
          window.location.href = `/admin/opensource?${p.toString()}`;
        }}
      />
    </div>
  );
}
