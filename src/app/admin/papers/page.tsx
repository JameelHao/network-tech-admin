import { Topbar } from "@/components/admin/Topbar";
import { TopicTag } from "@/components/admin/TopicTag";
import { listPapers } from "@/lib/admin/papers";
import { getDict } from "@/lib/i18n/server";
import Link from "next/link";

export default async function PapersPage() {
  const { lang, t } = await getDict();
  const papers = await listPapers();

  return (
    <>
      <Topbar crumbs={[{ label: t.nav.dashboard, href: "/admin" }, { label: t.nav.papers }]} t={t} lang={lang} />
      <main className="flex-1 px-6 xl:px-10 py-10">
        <div className="rounded-lg border border-line bg-surface">
          <div className="px-5 pt-4 pb-3 border-b border-line">
            <h1 className="font-display text-[17px] tracking-tight text-ink-800">{t.nav.papers}</h1>
          </div>
          <div className="divide-y divide-line">
            {papers.map((p) => (
              <Link key={p.id} href={`/admin/papers/${p.id}`} className="block px-5 py-4 hover:bg-paper/40 transition-colors">
                <p className="text-[13px] font-medium text-ink-800">{p.title}</p>
                <p className="text-[12px] text-ink-500 mt-1">
                  {p.authors.join(", ")} · {p.venue} · {p.published_date}
                </p>
                {p.abstract && (
                  <p className="text-[12px] text-ink-400 mt-1.5 line-clamp-2">{p.abstract}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {p.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
