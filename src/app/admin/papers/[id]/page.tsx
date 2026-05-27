import { Topbar } from "@/components/admin/Topbar";
import { DetailNav } from "@/components/admin/DetailNav";
import { TopicTag } from "@/components/admin/TopicTag";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { getPaper, listAllPapersLight } from "@/lib/admin/papers";
import { findSimilarPapers } from "@/lib/admin/paper-utils";
import { getAdjacentItems } from "@/lib/admin/adjacent";
import { getDict } from "@/lib/i18n/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { COMPANY_COLORS, COMPANY_NAMES } from "@/lib/admin/companies";

export default async function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, t } = await getDict();
  const [paper, allPapers, adjacent] = await Promise.all([
    getPaper(id),
    listAllPapersLight(),
    getAdjacentItems("papers", id, "title", "created_at", false),
  ]);
  if (!paper) notFound();

  const relatedPapers = findSimilarPapers(paper, allPapers);

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: t.nav.papers, href: "/admin/papers" },
        { label: paper.title.slice(0, 40) },
      ]} t={t} lang={lang} />
      <DetailNav
        prev={adjacent.prev}
        next={adjacent.next}
        basePath="/admin/papers"
        labels={{ backTo: t.detail.backTo, prev: t.detail.prev, next: t.detail.next }}
      />
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10 w-full space-y-6">
        <div className="rounded-lg border border-line bg-surface p-5 sm:p-7 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-sans text-[20px] sm:text-[22px] font-bold tracking-[-0.02em] text-ink-900">{paper.title}</h1>
            <FavoriteButton entity="papers" id={id} label={paper.title} />
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.authors}</dt><dd className="mt-1 text-ink-800">{paper.authors.join(", ")}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.venue}</dt><dd className="mt-1 text-ink-800">{paper.venue ?? "—"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.date}</dt><dd className="mt-1 text-ink-800 tabular-nums">{paper.published_date ?? "—"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.link}</dt><dd className="mt-1">{paper.url ? <a href={paper.url} target="_blank" rel="noreferrer" className="text-navy-500 hover:text-navy-700 transition-colors truncate block">{paper.url}</a> : "—"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.papers.citations}</dt><dd className="mt-1 text-ink-800 tabular-nums">{paper.citation_count != null ? paper.citation_count.toLocaleString() : "—"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.papers.source}</dt><dd className="mt-1 text-ink-800">{paper.source ?? "—"}</dd></div>
            {paper.companies && paper.companies.length > 0 && (
              <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">Companies</dt><dd className="mt-1 flex flex-wrap gap-1">{[...new Set(paper.companies)].map((c) => (
                <span key={c} className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${COMPANY_COLORS[c] ?? "bg-zinc-100 text-zinc-600 border border-zinc-200"}`}>
                  {COMPANY_NAMES[c] ?? c}
                </span>
              ))}</dd></div>
            )}
          </dl>
          {paper.abstract && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.abstract}</p>
              <p className="text-[13px] text-ink-600 leading-relaxed">{paper.abstract}</p>
            </div>
          )}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">{t.detail.topics}</p>
            <div className="flex flex-wrap gap-1.5">
              {paper.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}
            </div>
          </div>
          {paper.notes && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.notes}</p>
              <p className="text-[13px] text-ink-600">{paper.notes}</p>
            </div>
          )}
        </div>

        {relatedPapers.length > 0 && (
          <div className="rounded-lg border border-line bg-surface overflow-hidden">
            <div className="px-5 py-3 border-b border-line bg-paper/30">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                {t.papers.relatedPapers}
              </p>
            </div>
            <div className="divide-y divide-line">
              {relatedPapers.map((rp) => {
                const commonTopics = paper.topics.filter((tp) => rp.topics.includes(tp));
                return (
                  <Link
                    key={rp.id}
                    href={`/admin/papers/${rp.id}`}
                    className="block px-5 py-3.5 hover:bg-paper/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[13px] font-medium text-ink-800">{rp.title}</p>
                      <span className="shrink-0 rounded-full bg-moss-100 text-moss-700 px-2 py-0.5 font-mono text-[10px]">
                        {Math.round(rp.similarity * 100)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-500 mt-1">
                      {rp.authors.slice(0, 3).join(", ")}{rp.authors.length > 3 ? ` +${rp.authors.length - 3}` : ""}
                    </p>
                    {commonTopics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <span className="text-[10px] text-ink-400">{t.papers.commonTopics}:</span>
                        {commonTopics.map((tp) => (
                          <TopicTag key={tp} label={tp} lang={lang} />
                        ))}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
