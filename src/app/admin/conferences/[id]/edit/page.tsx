import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { ConferenceForm } from "@/components/admin/ConferenceForm";
import { getConference } from "@/lib/admin/conferences";
import { getDict } from "@/lib/i18n/server";
import { notFound } from "next/navigation";

export default async function EditConferencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, t } = await getDict();
  const conf = await getConference(id);
  if (!conf) notFound();

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: t.nav.conferences, href: "/admin/conferences" },
        { label: conf.abbreviation ?? conf.name, href: `/admin/conferences/${id}` },
        { label: t.conf.edit },
      ]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <div className="max-w-3xl">
          <header className="mb-8">
            <Link href={`/admin/conferences/${id}`} className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400 hover:text-ink-700">
              ← {conf.abbreviation ?? conf.name}
            </Link>
            <p className="mt-6 font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
              {t.conf.edit}
            </p>
            <h1 className="mt-2 font-display text-[32px] leading-tight tracking-tight text-ink-900">
              {conf.abbreviation ?? conf.name}
            </h1>
          </header>

          <div className="rounded-lg border border-line bg-surface p-6">
            <ConferenceForm t={t} lang={lang} conference={conf} />
          </div>
        </div>
      </main>
    </>
  );
}
