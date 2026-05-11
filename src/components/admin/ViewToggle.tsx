import Link from "next/link";

type Props = {
  active: "list" | "calendar";
  basePath: string;
  searchParams?: Record<string, string>;
  labels: { list: string; calendar: string };
};

export function ViewToggle({ active, basePath, searchParams = {}, labels }: Props) {
  function href(view: string) {
    const params = new URLSearchParams(searchParams);
    params.set("view", view);
    return `${basePath}?${params.toString()}`;
  }

  const btnClass = (isActive: boolean) =>
    `px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors whitespace-nowrap ${
      isActive
        ? "bg-navy-700 text-navy-50"
        : "text-ink-500 hover:text-ink-800"
    }`;

  return (
    <div className="flex items-center rounded-full border border-line overflow-hidden">
      <Link href={href("list")} className={btnClass(active === "list")}>
        {labels.list}
      </Link>
      <Link href={href("calendar")} className={btnClass(active === "calendar")}>
        {labels.calendar}
      </Link>
    </div>
  );
}
