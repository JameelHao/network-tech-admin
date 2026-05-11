import { Topbar } from "@/components/admin/Topbar";
import { ExportButton } from "@/components/admin/ExportButton";
import { Pagination } from "@/components/admin/Pagination";
import { StatusPill } from "@/components/admin/StatusPill";
import { listLeads } from "@/lib/admin/leads";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { getDict } from "@/lib/i18n/server";
import Link from "next/link";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { lang, t } = await getDict();
  const params = parsePaginationParams(sp);
  const result = await listLeads(params);
  const leads = result.data;

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.leads }]} t={t} lang={lang} />
      <main className="flex-1 px-6 xl:px-10 py-10">
        <div className="rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line">
            <h1 className="font-display text-[17px] tracking-tight text-ink-800">{t.leads.title}</h1>
            <div className="flex items-center gap-2">
              <ExportButton entity="leads" format="csv" label={t.common.exportCSV} />
              <ExportButton entity="leads" format="json" label={t.common.exportJSON} />
            </div>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-paper/30 text-left">
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.title}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.leads.source}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.leads.stage}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.leads.updatedAt}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-paper/40 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/admin/leads/${l.id}`} className="font-medium text-ink-800 hover:text-navy-600 transition-colors">
                      {l.title}
                    </Link>
                    {l.summary && (
                      <p className="text-[11px] text-ink-400 mt-0.5 truncate max-w-md">{l.summary}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-600">
                    <span className="text-[12px]">{t.sourceType[l.source_type]}</span>
                    {l.source_label && <span className="text-[11px] text-ink-400 ml-1">· {l.source_label}</span>}
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill label={l.stage} />
                  </td>
                  <td className="px-5 py-3 text-ink-500 tabular-nums text-[12px]">{l.updated_at.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            basePath="/admin/leads"
            labels={{ rows: t.common.rows, page: t.common.page, of: t.common.of }}
          />
        </div>
      </main>
    </>
  );
}
