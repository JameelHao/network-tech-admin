"use client";

import { useActionState } from "react";
import type { Lang } from "@/lib/i18n/dict";
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

export function TalentForm({ lang, talent }: { lang: Lang; talent?: TalentLead }) {
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
        <Field label={lang === "zh" ? "姓名" : "Name"}>
          <input name="name" required defaultValue={talent?.name ?? ""} placeholder={lang === "zh" ? "例如 张三" : "e.g. John Doe"} className={inputCls} />
        </Field>

        <Field label={lang === "zh" ? "角色" : "Role"}>
          <input name="role" defaultValue={talent?.role ?? ""} placeholder={lang === "zh" ? "例如 高级研究员" : "e.g. Senior Researcher"} className={inputCls} />
        </Field>

        <Field label={lang === "zh" ? "公司" : "Company"}>
          <input name="company" defaultValue={talent?.company ?? ""} placeholder={lang === "zh" ? "例如 Google" : "e.g. Google"} className={inputCls} />
        </Field>

        <Field label="LinkedIn">
          <input name="linkedin_url" type="url" defaultValue={talent?.linkedin_url ?? ""} placeholder="https://linkedin.com/in/..." className={inputCls} />
        </Field>

        <Field label={lang === "zh" ? "来源" : "Source"}>
          <input name="source" defaultValue={talent?.source ?? ""} placeholder={lang === "zh" ? "例如 SIGCOMM 2025" : "e.g. SIGCOMM 2025"} className={inputCls} />
        </Field>

        <Field label={lang === "zh" ? "阶段" : "Stage"}>
          <select name="stage" defaultValue={talent?.stage ?? "new"} className={inputCls}>
            {LEAD_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={lang === "zh" ? "主题" : "Topics"}>
        <input name="topics" defaultValue={talent?.topics.join(", ") ?? ""} placeholder={lang === "zh" ? "逗号分隔，例如 sdn, p4, ebpf" : "Comma separated, e.g. sdn, p4, ebpf"} className={inputCls} />
      </Field>

      <Field label={lang === "zh" ? "备注" : "Notes"}>
        <textarea name="notes" rows={3} defaultValue={talent?.notes ?? ""} placeholder={lang === "zh" ? "补充说明..." : "Additional notes..."} className={`${inputCls} leading-relaxed resize-y`} />
      </Field>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.16em]">
          {talent ? (
            <button
              type="button"
              onClick={() => { if (confirm(lang === "zh" ? "确认删除？" : "Confirm deletion?")) deleteTalent(talent.id); }}
              className="text-rust-600 hover:text-rust-800 transition-colors"
            >
              {lang === "zh" ? "删除" : "Delete"}
            </button>
          ) : (
            <span className="text-ink-400">{lang === "zh" ? "新建" : "New"}</span>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-navy-700 px-4 py-1.5 text-[12.5px] text-navy-50 hover:bg-navy-600 disabled:opacity-60"
        >
          {pending ? "..." : (lang === "zh" ? "保存" : "Save")}
        </button>
      </div>
    </form>
  );
}
