"use client";

import { useActionState, useState, useRef } from "react";
import { createSession, deleteSession, batchImportSessions } from "@/app/admin/conferences/[id]/sessions-actions";
import type { SessionFormState } from "@/app/admin/conferences/[id]/sessions-actions";
import { TOPICS, TOPIC_CATEGORIES, type TopicCategory } from "@/lib/admin/topics";
import type { Dict, Lang } from "@/lib/i18n/dict";

export function AddSessionButton({ conferenceId, lang, t }: { conferenceId: string; lang: Lang; t: Dict }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<SessionFormState, FormData>(createSession, undefined);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  if (state?.success && open) {
    setOpen(false);
    setSelectedTopics([]);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-700 hover:border-line-strong transition-colors"
      >
        {t.common.addPaper}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-lg border border-line bg-surface shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-line bg-paper/30">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                {t.common.addPaperTitle}
              </p>
            </div>
            <form ref={formRef} action={action} className="p-5 space-y-4">
              <input type="hidden" name="conference_id" value={conferenceId} />

              <div>
                <label className="tracked-label">{t.common.title}</label>
                <input name="title" required className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2 text-[13px] text-ink-900 focus:border-navy-300 focus:outline-none" />
              </div>

              <div>
                <label className="tracked-label">{t.common.authorsCommaSep}</label>
                <input name="authors" className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2 text-[13px] text-ink-900 focus:border-navy-300 focus:outline-none" placeholder="Alice, Bob, Charlie" />
              </div>

              <div>
                <label className="tracked-label">{t.common.affiliationsCommaSep}</label>
                <input name="affiliations" className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2 text-[13px] text-ink-900 focus:border-navy-300 focus:outline-none" placeholder="MIT, Google, Tsinghua" />
              </div>

              <div>
                <label className="tracked-label">{t.common.url}</label>
                <input name="url" type="url" className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2 text-[13px] text-ink-900 focus:border-navy-300 focus:outline-none" />
              </div>

              <div>
                <label className="tracked-label">{t.common.topics}</label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(Object.keys(TOPIC_CATEGORIES) as TopicCategory[]).map((cat) => {
                    const topics = TOPICS.filter((t) => t.category === cat);
                    return topics.map((t) => {
                      const active = selectedTopics.includes(t.slug);
                      return (
                        <button
                          key={t.slug}
                          type="button"
                          onClick={() => {
                            setSelectedTopics((prev) =>
                              active ? prev.filter((s) => s !== t.slug) : [...prev, t.slug]
                            );
                          }}
                          className={`rounded-full px-2.5 py-1 text-[11px] border transition-colors ${
                            active
                              ? "border-navy-300 bg-navy-50 text-navy-700"
                              : "border-line bg-paper text-ink-500 hover:border-line-strong"
                          }`}
                        >
                          {t[lang]}
                        </button>
                      );
                    });
                  })}
                </div>
                {selectedTopics.map((s) => (
                  <input key={s} type="hidden" name="topics" value={s} />
                ))}
              </div>

              {state?.error && (
                <p className="text-[12px] text-rust-600">{state.error}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button type="button" onClick={() => setOpen(false)} className="rounded-md px-3 py-1.5 text-[12.5px] text-ink-500 hover:text-ink-700">
                  {t.common.cancel}
                </button>
                <button type="submit" disabled={pending} className="rounded-md bg-navy-600 px-4 py-1.5 text-[12.5px] text-white hover:bg-navy-700 disabled:opacity-50">
                  {pending ? "..." : t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function DeleteSessionButton({ sessionId, conferenceId, t }: { sessionId: string; conferenceId: string; t: Dict }) {
  const [pending, setPending] = useState(false);

  return (
    <button
      disabled={pending}
      onClick={async () => {
        if (!confirm(t.common.confirmDelete)) return;
        setPending(true);
        await deleteSession(sessionId, conferenceId);
        setPending(false);
      }}
      className="text-[11px] text-ink-400 hover:text-rust-600 transition-colors disabled:opacity-50"
    >
      {pending ? "..." : "×"}
    </button>
  );
}

export function BatchImportButton({ conferenceId, t }: { conferenceId: string; t: Dict }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ error?: string; count?: number } | null>(null);

  const handleImport = async () => {
    setPending(true);
    setResult(null);
    try {
      const lines = text.trim().split("\n").filter(Boolean);
      const sessions = lines.map((line) => {
        const parts = line.split("\t");
        const title = parts[0]?.trim() || "";
        const authors = parts[1] ? parts[1].split(",").map((a) => a.trim()).filter(Boolean) : [];
        const topics = parts[2] ? parts[2].split(",").map((t) => t.trim()).filter(Boolean) : [];
        const url = parts[3]?.trim() || undefined;
        return { title, authors, topics, url };
      });
      const res = await batchImportSessions(conferenceId, sessions);
      setResult(res);
      if (res.count) {
        setText("");
        setTimeout(() => setOpen(false), 1000);
      }
    } catch (e) {
      setResult({ error: (e as Error).message });
    }
    setPending(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-700 hover:border-line-strong transition-colors"
      >
        {t.common.batchImport}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setOpen(false)}>
          <div className="w-full max-w-2xl rounded-lg border border-line bg-surface shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-line bg-paper/30">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                {t.common.batchImport}
              </p>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-[12px] text-ink-500">
                {t.common.batchPlaceholder}
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-[12px] font-mono text-ink-900 focus:border-navy-300 focus:outline-none"
                placeholder={"Paper Title\tAuthor1, Author2\tdc-networking, cloud-infra\thttps://..."}
              />

              {result?.error && <p className="text-[12px] text-rust-600">{result.error}</p>}
              {result?.count && <p className="text-[12px] text-moss-600">{t.common.importedCount.replace("{count}", String(result.count))}</p>}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button type="button" onClick={() => setOpen(false)} className="rounded-md px-3 py-1.5 text-[12.5px] text-ink-500 hover:text-ink-700">
                  {t.common.cancel}
                </button>
                <button onClick={handleImport} disabled={pending || !text.trim()} className="rounded-md bg-navy-600 px-4 py-1.5 text-[12.5px] text-white hover:bg-navy-700 disabled:opacity-50">
                  {pending ? "..." : t.common.import}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
