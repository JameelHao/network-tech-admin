import { Topbar } from "@/components/admin/Topbar";
import { DetailNav } from "@/components/admin/DetailNav";
import { TopicTag } from "@/components/admin/TopicTag";
import { getOpenSource } from "@/lib/admin/opensource";
import { getAdjacentItems } from "@/lib/admin/adjacent";
import { getDict } from "@/lib/i18n/server";
import { notFound } from "next/navigation";

export default async function OpenSourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, t } = await getDict();
  const [project, adjacent] = await Promise.all([
    getOpenSource(id),
    getAdjacentItems("opensource", id, "name", "stars", false),
  ]);
  if (!project) notFound();

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: t.nav.opensource, href: "/admin/opensource" },
        { label: project.name },
      ]} t={t} lang={lang} />
      <DetailNav
        backHref="/admin/opensource"
        backLabel={t.nav.opensource}
        prev={adjacent.prev}
        next={adjacent.next}
        basePath="/admin/opensource"
        labels={{ backTo: t.detail.backTo, prev: t.detail.prev, next: t.detail.next }}
      />
      <main className="flex-1 px-4 sm:px-6 xl:px-10 py-6 sm:py-10 max-w-3xl w-full">
        <div className="rounded-lg border border-line bg-surface p-5 sm:p-7 space-y-5">
          <h1 className="font-display text-[20px] sm:text-[22px] tracking-tight text-ink-900">{project.name}</h1>
          {project.description && <p className="text-[13px] text-ink-600">{project.description}</p>}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.language}</dt><dd className="mt-1 text-ink-800">{project.language ?? "—"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.stars}</dt><dd className="mt-1 text-ink-800 tabular-nums">{project.stars?.toLocaleString() ?? "—"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.lastActive}</dt><dd className="mt-1 text-ink-800 tabular-nums">{project.last_active ?? "—"}</dd></div>
            <div><dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">{t.detail.repo}</dt><dd className="mt-1"><a href={project.repo_url} target="_blank" rel="noreferrer" className="text-navy-500 hover:text-navy-700 transition-colors truncate block">{project.repo_url}</a></dd></div>
          </dl>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-2">{t.detail.topics}</p>
            <div className="flex flex-wrap gap-1.5">
              {project.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)}
            </div>
          </div>
          {project.notes && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 mb-1">{t.detail.notes}</p>
              <p className="text-[13px] text-ink-600">{project.notes}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
