"use client";

import { useActionState } from "react";
import type { Dict } from "@/lib/i18n/dict";
import type { TalentLead } from "@/lib/admin/types";
import { LEAD_STAGES } from "@/lib/admin/types";
import { createTalent, updateTalent, deleteTalent, type TalentFormState } from "@/app/admin/talents/actions";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="tracked-label">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function TalentForm({ t, talent }: { t: Dict; talent?: TalentLead }) {
  const action = talent ? updateTalent : createTalent;
  const [state, formAction, pending] = useActionState<TalentFormState, FormData>(action, undefined);

  const inputCls = "w-full rounded-md border border-line bg-paper px-3 py-2 text-[14px] focus:outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100";

  return (
    <form action={formAction} className="space-y-6">
      {talent && <input type="hidden" name="id" value={talent.id} />}

      {state?.error && (
        <div className="rounded-md border border-rust-100 bg-rust-50 px-3 py-2 text-[12.5px] text-rust-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <Field label={t.common.name}>
          <input name="name" required defaultValue={talent?.name ?? ""} placeholder={t.talent.namePlaceholder} className={inputCls} />
        </Field>

        <Field label={t.common.role}>
          <input name="role" defaultValue={talent?.role ?? ""} placeholder={t.talent.rolePlaceholder} className={inputCls} />
        </Field>

        <Field label={t.common.company}>
          <input name="company" defaultValue={talent?.company ?? ""} placeholder={t.talent.companyPlaceholder} className={inputCls} />
        </Field>

        <Field label="LinkedIn">
          <input name="linkedin_url" type="url" defaultValue={talent?.linkedin_url ?? ""} placeholder="https://linkedin.com/in/..." className={inputCls} />
        </Field>

        <Field label={t.talent.source}>
          <input name="source" defaultValue={talent?.source ?? ""} placeholder={t.talent.sourcePlaceholder} className={inputCls} />
        </Field>

        <Field label={t.common.stage}>
          <select name="stage" defaultValue={talent?.stage ?? "new"} className={inputCls}>
            {LEAD_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={t.common.topics}>
        <input name="topics" defaultValue={talent?.topics.join(", ") ?? ""} placeholder={t.talent.topicsPlaceholder} className={inputCls} />
      </Field>

      <Field label={t.talent.notes}>
        <textarea name="notes" rows={3} defaultValue={talent?.notes ?? ""} placeholder={t.talent.notesPlaceholder} className={`${inputCls} leading-relaxed resize-y`} />
      </Field>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.16em]">
          {talent ? (
            <button
              type="button"
              onClick={() => { if (confirm(t.common.confirmDelete)) deleteTalent(talent.id); }}
              className="text-rust-600 hover:text-rust-800 transition-colors"
            >
              {t.common.delete}
            </button>
          ) : (
            <span className="text-ink-400">{t.common.new}</span>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-navy-700 px-4 py-1.5 text-[12.5px] text-navy-50 hover:bg-navy-600 disabled:opacity-60"
        >
          {pending ? "..." : t.common.save}
        </button>
      </div>
    </form>
  );
}
