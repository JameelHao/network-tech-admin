"use server";

import { getPaperFull } from "@/lib/admin/papers";

export async function getPaperDetail(id: string) {
  return getPaperFull(id);
}
