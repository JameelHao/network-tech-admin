export function MobileNavToggle({ label = "Menu" }: { label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded="false"
      aria-controls="admin-mobile-nav"
      data-mobile-nav-trigger
      className="lg:hidden -ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-700 hover:bg-ink-100 transition-colors group"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <g className="group-[[aria-expanded=true]]:hidden">
          <path d="M3 6 H17" />
          <path d="M3 10 H17" />
          <path d="M3 14 H17" />
        </g>
        <g className="hidden group-[[aria-expanded=true]]:inline">
          <path d="M5 5 L15 15" />
          <path d="M15 5 L5 15" />
        </g>
      </svg>
    </button>
  );
}
