import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { ConferenceForm } from "@/components/admin/ConferenceForm";
import { getDict } from "@/lib/i18n/server";

export default async function NewConferencePage() {
  const { lang, t } = await getDict();

  return (
    <>
      <Topbar crumbs={[
        { label: t.nav.dashboard, href: "/admin" },
        { label: t.nav.conferences, href: "/admin/conferences" },
        { label: t.conf.addNew },
      ]} t={t} lang={lang} />
      <main className="px-6 xl:px-10 py-10">
        <div className="max-w-3xl">
          <header className="mb-8">
            <Link href="/admin/conferences" className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400 hover:text-ink-700">
              ← {t.nav.conferences}
            </Link>
            <p className="mt-6 font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
              {t.conf.addNew}
            </p>
            <h1 className="mt-2 font-sans text-[32px] font-bold leading-tight tracking-tight text-ink-900">
              {t.conf.addNew}
            </h1>
          </header>

          <div className="rounded-lg border border-line bg-surface p-6">
            <ConferenceForm t={t} lang={lang} />
          </div>
        </div>
      </main>
    </>
  );
}
