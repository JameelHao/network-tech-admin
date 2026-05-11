import { Topbar } from "@/components/admin/Topbar";
import { Pagination } from "@/components/admin/Pagination";
import { StatusPill } from "@/components/admin/StatusPill";
import { TopicTag } from "@/components/admin/TopicTag";
import { listTalentLeads } from "@/lib/admin/talents";
import { parsePaginationParams } from "@/lib/admin/pagination";
import { getDict } from "@/lib/i18n/server";
import { LEAD_STAGES } from "@/lib/admin/types";
import Link from "next/link";

export default async function TalentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const filterStage = typeof sp.stage === "string" ? sp.stage : undefined;
  const { lang, t } = await getDict();
  const params = parsePaginationParams(sp);
  const result = await listTalentLeads(params, { stage: filterStage });
  const talents = result.data;

  const filterParams: Record<string, string> = {};
  if (filterStage) filterParams.stage = filterStage;

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.talents }]} t={t} lang={lang} />
      <main className="flex-1 px-6 xl:px-10 py-10">
        <div className="rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line">
            <h1 className="font-display text-[17px] tracking-tight text-ink-800">{t.nav.talents}</h1>
            <Link
              href="/admin/talents/new"
              className="rounded-md bg-navy-700 px-3 py-1.5 text-[12.5px] text-navy-50 hover:bg-navy-600 transition-colors"
            >
              + {t.common.new}
            </Link>
          </div>

          <div className="flex items-center gap-1 px-5 py-2 border-b border-line bg-paper/30">
            <Link
              href="/admin/talents"
              className={`px-3 py-1 rounded font-mono text-[10.5px] uppercase tracking-[0.16em] transition-colors ${
                !filterStage ? "bg-navy-700 text-navy-50" : "text-ink-500 hover:text-ink-800"
              }`}
            >
              {t.common.all}
            </Link>
            {LEAD_STAGES.map((s) => (
              <Link
                key={s}
                href={`/admin/talents?stage=${s}`}
                className={`px-3 py-1 rounded font-mono text-[10.5px] uppercase tracking-[0.16em] transition-colors ${
                  filterStage === s ? "bg-navy-700 text-navy-50" : "text-ink-500 hover:text-ink-800"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>

          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-paper/30 text-left">
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.name}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.role}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.company}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.stage}</th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.common.topics}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {talents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[13px] text-ink-400">
                    {t.talent.noTalents}
                  </td>
                </tr>
              ) : (
                talents.map((tl) => (
                  <tr key={tl.id} className="hover:bg-paper/40 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/admin/talents/${tl.id}`} className="font-medium text-ink-800 hover:text-navy-600 transition-colors">
                        {tl.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink-600">{tl.role ?? "—"}</td>
                    <td className="px-5 py-3 text-ink-600">{tl.company ?? "—"}</td>
                    <td className="px-5 py-3">
                      <StatusPill label={tl.stage} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {tl.topics.length > 0
                          ? tl.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)
                          : <span className="text-[11px] text-ink-400">—</span>
                        }
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            basePath="/admin/talents"
            searchParams={filterParams}
            labels={{ rows: t.common.rows, page: t.common.page, of: t.common.of }}
          />
        </div>
      </main>
    </>
  );
}
