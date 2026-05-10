import { cookies } from "next/headers";
import { dict, type Dict, type Lang } from "./dict";

const COOKIE_NAME = "nt_lang";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const v = store.get(COOKIE_NAME)?.value;
  return v === "en" ? "en" : "zh";
}

export async function getDict(): Promise<{ lang: Lang; t: Dict }> {
  const lang = await getLang();
  return { lang, t: dict[lang] };
}

export const LANG_COOKIE = COOKIE_NAME;
