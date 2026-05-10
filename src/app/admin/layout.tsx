import { Sidebar } from "@/components/admin/Sidebar";
import { getDict } from "@/lib/i18n/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getDict();

  return (
    <div className="min-h-dvh flex bg-paper text-ink-800">
      <Sidebar t={t} />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){
if(window.__ntMobileNavWired)return;window.__ntMobileNavWired=true;
function set(o){var n=document.getElementById('admin-mobile-nav');var b=document.getElementById('admin-mobile-nav-backdrop');if(n)n.classList.toggle('is-open',o);if(b)b.classList.toggle('is-open',o);if(n)n.setAttribute('aria-hidden',String(!o));document.querySelectorAll('[data-mobile-nav-trigger]').forEach(function(e){e.setAttribute('aria-expanded',String(o));});document.body.style.overflow=o?'hidden':'';}
document.addEventListener('click',function(e){var t=e.target.closest('[data-mobile-nav-trigger]');if(t){e.preventDefault();var n=document.getElementById('admin-mobile-nav');set(!n||!n.classList.contains('is-open'));return;}if(e.target.closest('[data-mobile-nav-backdrop]')){set(false);return;}if(e.target.closest('#admin-mobile-nav a')){set(false);return;}});
document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});
})();`,
        }}
      />
    </div>
  );
}
