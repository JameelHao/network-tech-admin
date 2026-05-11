import { Topbar } from "@/components/admin/Topbar";
import { ExportButton } from "@/components/admin/ExportButton";
import { Pagination } from "@/components/admin/Pagination";
import { TopicTag } from "@/components/admin/TopicTag";
import { listOpenSource } from "@/lib/admin/opensource";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { getDict } from "@/lib/i18n/server";
import Link from "next/link";

export default async function OpenSourcePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { lang, t } = await getDict();
  const params = parsePaginationParams(sp);
  const result = await listOpenSource(params);
  const projects = result.data;

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.opensource }]} t={t} lang={lang} />
      <main className="flex-1 px-6 xl:px-10 py-10">
        <div className="rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line">
            <h1 className="font-display text-[17px] tracking-tight text-ink-800">{t.nav.opensource}</h1>
            <div className="flex items-center gap-2">
              <ExportButton entity="opensource" format="csv" label={t.common.exportCSV} />
              <ExportButton entity="opensource" format="json" label={t.common.exportJSON} />
            </div>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-paper/30 text-left">
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.name}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.language}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.stars}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.lastActive}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.topics}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.list.repo}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {projects.map((o) => (
                <tr key={o.id} className="hover:bg-paper/40 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/admin/opensource/${o.id}`} className="font-medium text-ink-800 hover:text-navy-600 transition-colors">
                      {o.name}
                    </Link>
                    {o.description && (
                      <p className="text-[11px] text-ink-400 mt-0.5 truncate max-w-xs">{o.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-600">{o.language ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-600 tabular-nums">{o.stars?.toLocaleString() ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-600 tabular-nums">{o.last_active ?? "—"}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {o.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {o.repo_url ? (
                      <a href={o.repo_url} target="_blank" rel="noopener noreferrer" className="text-navy-500 hover:text-navy-700">
                        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor"><path d="M8 .2A8 8 0 0 0 5.47 15.79c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.42 7.42 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 8 .2Z"/></svg>
                      </a>
                    ) : <span className="text-ink-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            basePath="/admin/opensource"
            labels={{ rows: t.common.rows, page: t.common.page, of: t.common.of }}
          />
        </div>
      </main>
    </>
  );
}
