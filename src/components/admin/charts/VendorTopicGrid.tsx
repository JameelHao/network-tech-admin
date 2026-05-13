"use client";

import type { VendorTopicCell } from "@/lib/admin/ecosystem-stats";
import { getTopicLabel } from "@/lib/admin/topics";
import Link from "next/link";
import { useMemo } from "react";

type Props = {
  data: VendorTopicCell[];
  lang: "en" | "zh";
};

export function VendorTopicGrid({ data, lang }: Props) {
  const allTopics = useMemo(() => {
    const set = new Set<string>();
    for (const v of data) for (const t of v.topics) set.add(t);
    return Array.from(set).sort();
  }, [data]);

  if (!data.length || !allTopics.length) return <p className="text-ink-400 text-sm">No data</p>;

  return (
    <div className="overflow-x-auto">
      <table className="text-[11px] border-collapse min-w-[500px]">
        <thead>
          <tr className="border-b border-line">
            <th className="px-2 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-ink-500 sticky left-0 bg-surface z-10 min-w-[100px]">Vendor</th>
            {allTopics.map((t) => (
              <th key={t} className="px-1 py-2 text-center font-mono text-[9px] uppercase tracking-wider text-ink-400 min-w-[28px]" title={getTopicLabel(t, lang)}>
                <span className="writing-mode-vertical inline-block max-w-[20px] truncate">{t.split("-")[0]}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((v) => (
            <tr key={v.vendorId} className="border-b border-line/50 hover:bg-paper/30 transition-colors">
              <td className="px-2 py-1.5 text-ink-700 truncate sticky left-0 bg-surface z-10">
                <Link href={`/admin/vendors/${v.vendorId}`} className="hover:text-navy-600 transition-colors">{v.vendorName}</Link>
              </td>
              {allTopics.map((t) => {
                const has = v.topics.includes(t);
                const productNames = Object.entries(v.productTopics)
                  .filter(([, topics]) => topics.includes(t))
                  .map(([name]) => name);
                return (
                  <td
                    key={t}
                    className="px-1 py-1 text-center"
                    title={has ? `${v.vendorName}: ${getTopicLabel(t, lang)}${productNames.length ? ` (${productNames.join(", ")})` : ""}` : ""}
                  >
                    {has && (
                      <span className={`inline-block w-3 h-3 rounded-full ${productNames.length ? "bg-indigo-500" : "bg-indigo-300"}`} />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-3 mt-3 px-2">
        <span className="flex items-center gap-1.5 text-[10px] text-ink-400">
          <span className="inline-block w-3 h-3 rounded-full bg-indigo-500" /> Product match
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-ink-400">
          <span className="inline-block w-3 h-3 rounded-full bg-indigo-300" /> Topic only
        </span>
      </div>
    </div>
  );
}
