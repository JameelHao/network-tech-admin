import { Sidebar } from "@/components/admin/Sidebar";
import { SkipToMain } from "@/components/admin/SkipToMain";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { MobileNavController } from "@/components/admin/MobileNavController";
import { getDict } from "@/lib/i18n/server";
import { buildSearchIndex } from "@/lib/admin/command-search-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [{ t }, searchIndex] = await Promise.all([getDict(), buildSearchIndex()]);

  return (
    <div className="min-h-dvh flex bg-paper text-ink-800">
      <SkipToMain label={t.a11y.skipToMain} />
      <Sidebar t={t} />
      <CommandPalette items={searchIndex} labels={t.command} />
      <div id="main-content" className="flex-1 min-w-0 flex flex-col">{children}</div>
      <MobileNavController />
    </div>
  );
}
