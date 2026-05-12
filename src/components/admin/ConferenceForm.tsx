"use client";

import { useActionState, useState } from "react";
import type { Dict, Lang } from "@/lib/i18n/dict";
import type { Conference } from "@/lib/admin/types";
import { TOPICS, TOPIC_CATEGORIES, CONFERENCE_TIERS, type TopicCategory, type ConferenceTier } from "@/lib/admin/topics";
import { createConference, updateConference, type ConferenceFormState } from "@/app/admin/conferences/actions";
import { TopicTag } from "./TopicTag";
import { tabClass } from "@/lib/admin/ui";

const CATEGORY_KEYS: TopicCategory[] = ["network-systems", "measurement", "security", "emerging", "infrastructure"];
const TIER_KEYS: ConferenceTier[] = ["top", "good", "workshop"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="tracked-label">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function ConferenceForm({ t, lang, conference }: { t: Dict; lang: Lang; conference?: Conference }) {
  const action = conference ? updateConference : createConference;
  const [state, formAction, pending] = useActionState<ConferenceFormState, FormData>(action, undefined);
  const [category, setCategory] = useState<TopicCategory>(conference?.category ?? "network-systems");
  const [tier, setTier] = useState<ConferenceTier>(conference?.tier ?? "good");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(conference?.topics ?? []);
  const [showPicker, setShowPicker] = useState(false);

  function toggleTopic(slug: string) {
    setSelectedTopics((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  const inputCls = "w-full rounded-md border border-line bg-surface px-3 py-2 text-[14px] focus:outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100";

  return (
    <form action={formAction} className="space-y-6">
      {conference && <input type="hidden" name="id" value={conference.id} />}
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="tier" value={tier} />
      {selectedTopics.map((slug) => (
        <input key={slug} type="hidden" name="topics" value={slug} />
      ))}

      {state?.error && (
        <div className="rounded-md border border-rust-100 bg-rust-50 px-3 py-2 text-[12.5px] text-rust-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <Field label={t.conf.name}>
          <input name="name" defaultValue={conference?.name ?? ""} placeholder={t.conf.namePlaceholder} className={inputCls} />
        </Field>

        <Field label={t.conf.abbreviation}>
          <input name="abbreviation" defaultValue={conference?.abbreviation ?? ""} placeholder={t.conf.abbreviationPlaceholder}
            className={`${inputCls} font-mono text-[13px] uppercase tracking-[0.08em]`} />
        </Field>

        <Field label={t.conf.url}>
          <input name="url" type="url" defaultValue={conference?.url ?? ""} placeholder={t.conf.urlPlaceholder} className={inputCls} />
        </Field>

        <Field label={t.conf.location}>
          <input name="location" defaultValue={conference?.location ?? ""} placeholder={t.conf.locationPlaceholder} className={inputCls} />
        </Field>

        <Field label={t.conf.startDate}>
          <input name="start_date" type="date" required defaultValue={conference?.start_date ?? ""}
            className={`${inputCls} font-mono text-[14px] tabular-nums`} />
        </Field>

        <Field label={t.conf.endDate}>
          <input name="end_date" type="date" defaultValue={conference?.end_date ?? ""}
            className={`${inputCls} font-mono text-[14px] tabular-nums`} />
        </Field>

        <Field label={t.conf.category}>
          <div className="inline-flex rounded-md border border-line bg-surface p-0.5">
            {CATEGORY_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={tabClass(category === key, "sm")}
              >
                {TOPIC_CATEGORIES[key][lang]}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t.conf.tier}>
          <div className="inline-flex rounded-md border border-line bg-surface p-0.5">
            {TIER_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTier(key)}
                className={tabClass(tier === key, "sm")}
              >
                {CONFERENCE_TIERS[key][lang]}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <Field label={t.conf.topics}>
        <div className="flex flex-wrap gap-1.5 min-h-[28px]">
          {selectedTopics.map((slug) => (
            <button key={slug} type="button" onClick={() => toggleTopic(slug)} className="transition-opacity hover:opacity-60">
              <TopicTag label={slug} lang={lang} />
            </button>
          ))}
          {selectedTopics.length === 0 && (
            <span className="text-[12px] text-ink-400">{t.common.clickToSelect}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-navy-500 hover:text-navy-700 transition-colors"
        >
          {showPicker ? "▲ " : "▼ "}{t.common.selectTopics}
        </button>
        {showPicker && (
          <div className="mt-2 rounded-md border border-line bg-surface p-4 space-y-4 max-h-[280px] overflow-y-auto">
            {CATEGORY_KEYS.map((cat) => (
              <div key={cat}>
                <p className="tracked-label mb-1.5">{TOPIC_CATEGORIES[cat][lang]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {TOPICS.filter((tp) => tp.category === cat).map((topic) => (
                    <button
                      key={topic.slug}
                      type="button"
                      onClick={() => toggleTopic(topic.slug)}
                      className={`inline-flex items-center rounded-full border border-line px-2 py-0.5 font-mono text-[9.5px] tracking-[0.1em] transition-all ${
                        selectedTopics.includes(topic.slug)
                          ? "opacity-30 line-through"
                          : "hover:border-navy-300 hover:bg-navy-50"
                      }`}
                    >
                      {topic[lang]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Field>

      <Field label={t.conf.notes}>
        <textarea name="notes" rows={3} defaultValue={conference?.notes ?? ""} placeholder={t.conf.notesPlaceholder}
          className={`${inputCls} leading-relaxed resize-y`} />
      </Field>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.16em]">
          {conference ? (
            <span className="text-ink-400">ID · {conference.id.slice(0, 8)}</span>
          ) : (
            <span className="text-ink-400">{t.common.new}</span>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-navy-700 px-4 py-1.5 text-[12.5px] text-navy-50 hover:bg-navy-600 disabled:opacity-60"
        >
          {pending ? "..." : t.conf.save}
        </button>
      </div>
    </form>
  );
}
