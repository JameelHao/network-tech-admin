import Link from "next/link";
import type { ReactNode } from "react";

type Action = { label: string; href?: string; onClick?: () => void };

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: Action;
  compact?: boolean;
}

const defaultIcon = (
  <svg viewBox="0 0 48 48" className="h-10 w-10 text-ink-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="10" width="36" height="28" rx="3" />
    <path d="M6 18h36" />
    <circle cx="24" cy="30" r="4" />
    <path d="M20 30h-4M28 30h4" />
  </svg>
);

export function EmptyState({ icon, title, description, action, compact }: EmptyStateProps) {
  if (compact) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-[13px] text-ink-400">{title}</p>
        {description && <p className="mt-1 text-[12px] text-ink-300">{description}</p>}
      </div>
    );
  }

  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-paper">
        {icon ?? defaultIcon}
      </div>
      <h3 className="font-display text-[18px] tracking-tight text-ink-700">{title}</h3>
      <p className="mt-1 text-[13px] text-ink-400 max-w-xs mx-auto">{description}</p>
      {action && (
        <div className="mt-5">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center rounded-md bg-navy-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-navy-700 transition-colors"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center rounded-md bg-navy-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-navy-700 transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
