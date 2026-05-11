import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { TopicTag } from "@/components/admin/TopicTag";
import { TierBadge } from "@/components/admin/TierBadge";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { getConference, listConferenceSessions } from "@/lib/admin/conferences";
import { getDict } from "@/lib/i18n/server";
import { TOPIC_CATEGORIES } from "@/lib/admin/topics";
import { notFound } from "next/navigation";

export default async function ConferenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, t } = await getDict();
  const conf = await getConference(id);
  if (!conf) notFound();

  const sessions = await listConferenceSessions(id);
  const today = new Date().toISOString().slice(0, 10);
  const isPast = (conf.end_date ?? conf.start_date) < today;

  const KNOWN_COMPANIES = new Set(["Google","Microsoft","Microsoft Research","Microsoft Research Asia","Alibaba","Huawei","Intel","Meta","Amazon","Apple","ByteDance","Tencent","NVIDIA","Cloudflare","Cisco"]);
  const allAffiliations = [...new Set(sessions.flatMap((s) => s.affiliations))];
  const companies = allAffiliations.filter((a) => KNOWN_COMPANIES.has(a));
  const universities = allAffiliations.filter((a) => !KNOWN_COMPANIES.has(a));

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: t.nav.conferences, href: "/admin/conferences" },
        { label: conf.abbreviation ?? conf.name },
      ]} t={t} lang={lang} />

      <main className="px-6 xl:px-10 py-10 space-y-4">
        {/* Section 1: Conference Info */}
        <section className="rounded-lg border border-line bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-line bg-paper/30">
            <div className="flex items-center gap-3">
              <Link href="/admin/conferences" className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400 hover:text-ink-700">
                ← {t.nav.conferences}
              </Link>
              <span className="text-ink-300">/</span>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                {t.conf.confInfo}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <RefreshButton conferenceId={id} label={t.conf.refresh} />
              <Link
                href={`/admin/conferences/${id}/edit`}
                className="rounded-md border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-700 hover:border-line-strong transition-colors"
              >
                {t.conf.edit}
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-5">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 ring-1 ring-navy-100 font-display text-[20px] tracking-tight text-navy-700">
                {conf.abbreviation?.slice(0, 3) ?? "C"}
              </span>
              <div>
                <h1 className="font-display text-[28px] leading-none tracking-tight text-ink-900">
                  {conf.abbreviation ?? conf.name}
                </h1>
                {conf.abbreviation && (
                  <p className="mt-1 text-[13px] text-ink-500">{conf.name}</p>
                )}
              </div>
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-5 gap-x-6 gap-y-3">
              <Field label={t.detail.location} value={<span className="font-mono text-[12px] text-ink-700">{conf.location ?? "—"}</span>} />
              <Field label={t.detail.date} value={<span className="font-mono text-[12px] tabular-nums text-ink-700">{conf.start_date}{conf.end_date ? ` ~ ${conf.end_date}` : ""}</span>} />
              <Field label={t.conf.status} value={
                <span className={`font-mono text-[10.5px] uppercase tracking-[0.16em] ${isPast ? "text-ink-500" : "text-moss-700"}`}>
                  {isPast ? t.conf.pastLabel : t.conf.upcomingLabel}
                </span>
              } />
              <Field label={t.conf.category} value={
                <span className="font-mono text-[12px] text-ink-700">{conf.category ? TOPIC_CATEGORIES[conf.category]?.[lang] : "—"}</span>
              } />
              <Field label={t.conf.tier} value={conf.tier ? <TierBadge tier={conf.tier} lang={lang} /> : <span className="text-ink-400">—</span>} />
            </dl>
            {conf.url && (
              <div className="mt-4">
                <a href={conf.url} target="_blank" rel="noreferrer" className="font-mono text-[11px] text-navy-500 hover:text-navy-700">
                  {conf.url} ↗
                </a>
              </div>
            )}
            {conf.notes && (
              <p className="mt-4 text-[13px] text-ink-600 leading-relaxed border-t border-line pt-4">{conf.notes}</p>
            )}
          </div>
        </section>

        {/* Section 2: Stats Cards */}
        <section className="rounded-lg border border-line bg-surface overflow-hidden">
          <div className="px-5 py-3 border-b border-line bg-paper/30">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              {t.conf.statistics}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-line">
            <Stat label={t.conf.papersTalks} value={sessions.length} sub={t.conf.tracked} />
            <Stat label={t.conf.companies} value={companies.length} sub={t.conf.companiesSub} />
            <Stat label={t.conf.universities} value={universities.length} sub={t.conf.universitiesSub} />
            <Stat label={t.conf.topicAreas} value={conf.topics.length} sub={t.conf.topicAreasSub} />
            <Stat label={t.conf.affiliations} value={allAffiliations.length} sub={t.conf.total} />
          </div>
        </section>

        {/* Section 3: Papers List */}
        <section className="rounded-lg border border-line bg-surface overflow-hidden">
          <header className="flex items-center justify-between px-5 py-3 border-b border-line bg-paper/30">
            <div className="flex items-center gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                {t.conf.papersAndTalks}
              </p>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
                {sessions.length} {t.conf.entries}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshButton conferenceId={id} label={t.conf.fetchPapers} />
            </div>
          </header>

          {sessions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="font-display text-[20px] text-ink-700">{t.conf.noPapers}</div>
              <p className="mt-1 text-[13px] text-ink-500">{t.conf.noPapersHint}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-paper/30">
                    <Th>{t.common.title}</Th>
                    <Th>{t.detail.authors}</Th>
                    <Th>{t.detail.topics}</Th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-b border-line last:border-b-0 hover:bg-paper/40 transition-colors">
                      <td className="px-4 py-3 align-middle">
                        <div className="font-display text-[14px] tracking-tight text-ink-900">
                          {s.url ? <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-navy-700">{s.title}</a> : s.title}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className="font-mono text-[11px] text-ink-600 truncate block max-w-[200px]">{s.authors.join(", ") || "—"}</span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex flex-wrap gap-1">
                          {s.topics.length > 0
                            ? s.topics.map((tp) => <TopicTag key={tp} label={tp} lang={lang} />)
                            : <span className="font-mono text-[11px] text-ink-400">N/A</span>
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="tracked-label">{label}</dt>
      <dd className="mt-1.5">{value}</dd>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="bg-surface p-6">
      <p className="tracked-label">{label}</p>
      <p className="mt-3 font-display text-[30px] leading-none text-ink-900 tabular-nums">{value}</p>
      <p className="mt-2 text-[12px] text-ink-500">{sub}</p>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 text-left">{children}</th>;
}
