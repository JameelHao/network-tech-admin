import { Topbar } from "@/components/admin/Topbar";
import { DetailNav } from "@/components/admin/DetailNav";
import { TierBadge } from "@/components/admin/TierBadge";
import { FavoriteButton } from "@/components/admin/FavoriteButton";
import { ConfSummarySection } from "@/components/admin/ConfSummarySection";
import { getConference } from "@/lib/admin/conferences";
import { getAdjacentItems } from "@/lib/admin/adjacent";
import { getDict } from "@/lib/i18n/server";
import { TOPIC_CATEGORIES } from "@/lib/admin/topics";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ConferenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, t } = await getDict();
  const conf = await getConference(id);
  if (!conf) notFound();

  const supabase = await createClient();
  const adjacent = await getAdjacentItems("conferences", id, "abbreviation", "start_date", false);
  const today = new Date().toISOString().slice(0, 10);
  const isPast = (conf.end_date ?? conf.start_date) < today;

  const { data: sessions } = await supabase
    .from("conference_sessions")
    .select("*")
    .eq("conference_id", id)
    .order("created_at", { ascending: true });

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: t.nav.conferences, href: "/admin/conferences" },
        { label: conf.abbreviation ?? conf.name },
      ]} t={t} lang={lang} />

      <DetailNav
        prev={adjacent.prev}
        next={adjacent.next}
        basePath="/admin/conferences"
        labels={{ backTo: t.detail.backTo, prev: t.detail.prev, next: t.detail.next }}
      />
      <main className="px-4 sm:px-6 xl:px-10 py-6 sm:py-10 space-y-4">
        {/* Conference Info */}
        <section className="rounded-lg border border-line bg-surface overflow-hidden">
          <div className="px-5 py-3 border-b border-line bg-paper/30">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              {t.conf.confInfo}
            </p>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-5">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 ring-1 ring-navy-100 font-sans text-[20px] font-bold tracking-[-0.02em] text-navy-700">
                {conf.abbreviation?.slice(0, 3) ?? "C"}
              </span>
              <div>
                <h1 className="font-sans text-[28px] font-bold leading-none tracking-tight text-ink-900">
                  {conf.abbreviation ?? conf.name}
                </h1>
                {conf.abbreviation && (
                  <p className="mt-1 text-[13px] text-ink-500">{conf.name}</p>
                )}
              </div>
              <FavoriteButton entity="conferences" id={id} label={conf.abbreviation ?? conf.name} />
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-3">
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
          </div>
        </section>

        {/* AI Summary */}
        <ConfSummarySection confId={id} initialSummary={conf.ai_summary} />

        {/* Papers - simple waterfall */}
        <section className="rounded-lg border border-line bg-surface overflow-hidden">
          <header className="flex items-center gap-3 px-5 py-3 border-b border-line bg-paper/30">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              {t.conf.papersAndTalks}
            </p>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
              {sessions?.length ?? 0} {t.conf.entries}
            </span>
          </header>

          {sessions && sessions.length > 0 ? (
            <div className="divide-y divide-line">
              {sessions.map((s: any) => (
                <div key={s.id} className="px-5 py-4">
                  <p className="text-[13px] font-medium text-ink-800 leading-relaxed">{s.title}</p>
                  {s.authors?.length > 0 && (
                    <p className="text-[12px] text-ink-500 mt-1">{s.authors.slice(0, 6).join(", ")}{s.authors.length > 6 ? ` +${s.authors.length - 6}` : ""}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {s.topics?.slice(0, 5).map((topic: string) => (
                      <span key={topic} className="text-[10px] font-mono bg-navy-50 text-navy-600 px-1.5 py-0.5 rounded">{topic}</span>
                    ))}
                    {s.affiliations?.length > 0 && (
                      <span className="text-[10px] font-mono text-ink-400">{s.affiliations.slice(0, 3).join(", ")}{s.affiliations.length > 3 ? "..." : ""}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-[13px] text-ink-400">{t.conf.noPapers}</p>
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
