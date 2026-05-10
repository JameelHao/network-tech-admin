import { LoginForm } from "@/components/admin/LoginForm";
import { LangToggle } from "@/components/admin/LangToggle";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
import { Logo } from "@/components/admin/Logo";
import { getDict } from "@/lib/i18n/server";

export default async function LoginPage() {
  const { lang, t } = await getDict();

  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-[1fr_540px] bg-paper">
      <aside className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-[#0b1f3a]">
        <img src="/login-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e1a30]/85 via-[#0e1a30]/70 to-[#162a4e]/60" />
        <div className="absolute bottom-12 left-12 right-12 h-px bg-[#c49a42]/30 z-10" />

        <div className="relative z-10">
          <Logo size={40} />
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-[44px] leading-[1.05] tracking-tight text-[#C9A94E] font-bold whitespace-pre-line">
            {t.login.heroTitle}
          </h1>
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-[#C9A94E]/80">
            {t.login.heroSub}
          </p>
        </div>

        <div className="relative z-10" />
      </aside>

      <main className="flex flex-col justify-center px-6 sm:px-12 py-16 relative">
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <ThemeToggle t={t} />
          <LangToggle lang={lang} />
        </div>

        <div className="lg:hidden mb-10">
          <Logo size={32} />
        </div>

        <div className="w-full max-w-sm mx-auto">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
            {t.login.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-[32px] leading-tight tracking-tight text-ink-900">
            {t.login.title}
          </h2>

          <div className="mt-8">
            <LoginForm t={t} />
          </div>
        </div>
      </main>
    </div>
  );
}
