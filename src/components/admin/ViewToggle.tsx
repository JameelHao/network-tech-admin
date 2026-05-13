import Link from "next/link";
import { tabClass, tabGroupClass } from "@/lib/admin/ui";

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

  return (
    <div className={tabGroupClass()}>
      <Link href={href("list")} className={tabClass(active === "list", "sm")}>
        {labels.list}
      </Link>
      <Link href={href("calendar")} className={tabClass(active === "calendar", "sm")}>
        {labels.calendar}
      </Link>
    </div>
  );
}
