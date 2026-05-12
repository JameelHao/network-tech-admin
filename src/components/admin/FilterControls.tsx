"use client";

import { useRouter, usePathname } from "next/navigation";

function navigate(
  searchParams: Record<string, string>,
  key: string,
  value: string,
  router: ReturnType<typeof useRouter>,
  pathname: string,
) {
  const params = new URLSearchParams(searchParams);
  if (value) params.set(key, value);
  else params.delete(key);
  params.delete("page");
  const qs = params.toString();
  router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
}

type BaseProps = { searchParams: Record<string, string> };

export function FilterSelect({
  paramKey,
  label,
  options,
  value,
  searchParams,
}: BaseProps & {
  paramKey: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <select
      value={value}
      aria-label={label}
      onChange={(e) =>
        navigate(searchParams, paramKey, e.target.value, router, pathname)
      }
      className="rounded-md border border-line bg-surface px-2 py-1.5 min-h-[36px] text-[12px] text-ink-700"
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function FilterDateRange({
  fromKey,
  toKey,
  fromValue,
  toValue,
  fromLabel,
  toLabel,
  searchParams,
}: BaseProps & {
  fromKey: string;
  toKey: string;
  fromValue: string;
  toValue: string;
  fromLabel: string;
  toLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1">
      <input
        type="date"
        value={fromValue}
        onChange={(e) =>
          navigate(searchParams, fromKey, e.target.value, router, pathname)
        }
        aria-label={fromLabel}
        className="rounded-md border border-line bg-surface px-2 py-1 min-h-[36px] text-[12px] text-ink-700 w-[130px]"
      />
      <span className="text-ink-400 text-[10px]">–</span>
      <input
        type="date"
        value={toValue}
        onChange={(e) =>
          navigate(searchParams, toKey, e.target.value, router, pathname)
        }
        aria-label={toLabel}
        className="rounded-md border border-line bg-surface px-2 py-1 min-h-[36px] text-[12px] text-ink-700 w-[130px]"
      />
    </div>
  );
}

export function FilterNumberRange({
  minKey,
  maxKey,
  minValue,
  maxValue,
  minLabel,
  maxLabel,
  searchParams,
}: BaseProps & {
  minKey: string;
  maxKey: string;
  minValue: string;
  maxValue: string;
  minLabel: string;
  maxLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={minValue}
        onChange={(e) =>
          navigate(searchParams, minKey, e.target.value, router, pathname)
        }
        placeholder={minLabel}
        aria-label={minLabel}
        min="0"
        className="rounded-md border border-line bg-surface px-2 py-1 min-h-[36px] text-[12px] text-ink-700 w-[80px]"
      />
      <span aria-hidden="true" className="text-ink-400 text-[10px]">–</span>
      <input
        type="number"
        value={maxValue}
        onChange={(e) =>
          navigate(searchParams, maxKey, e.target.value, router, pathname)
        }
        placeholder={maxLabel}
        aria-label={maxLabel}
        min="0"
        className="rounded-md border border-line bg-surface px-2 py-1 min-h-[36px] text-[12px] text-ink-700 w-[80px]"
      />
    </div>
  );
}

export function FilterInput({
  paramKey,
  value,
  placeholder,
  searchParams,
}: BaseProps & {
  paramKey: string;
  value: string;
  placeholder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <input
      type="text"
      key={value}
      defaultValue={value}
      placeholder={placeholder}
      aria-label={placeholder}
      onBlur={(e) => {
        const v = e.target.value.trim();
        if (v !== value) navigate(searchParams, paramKey, v, router, pathname);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const v = e.currentTarget.value.trim();
          if (v !== value)
            navigate(searchParams, paramKey, v, router, pathname);
        }
      }}
      className="rounded-md border border-line bg-surface px-2 py-1.5 min-h-[36px] text-[12px] text-ink-700 w-32"
    />
  );
}
