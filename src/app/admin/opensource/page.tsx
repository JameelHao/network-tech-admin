import { Topbar } from "@/components/admin/Topbar";
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
          <div className="px-5 pt-4 pb-3 border-b border-line">
            <h1 className="font-display text-[17px] tracking-tight text-ink-800">{t.nav.opensource}</h1>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-paper/30 text-left">
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.name}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.language}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.stars}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.lastActive}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.topics}</th>
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
