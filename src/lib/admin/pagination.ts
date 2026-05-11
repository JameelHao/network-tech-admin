export type SortDir = "asc" | "desc";

export type PaginationParams = {
  page: number;
  pageSize: number;
  search?: string;
  sort?: string;
  dir?: SortDir;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function parsePaginationParams(
  sp: Record<string, string | string[] | undefined>,
  defaults: { pageSize?: number } = {},
): PaginationParams {
  const raw = typeof sp.page === "string" ? parseInt(sp.page, 10) : NaN;
  const page = Number.isFinite(raw) && raw >= 1 ? raw : 1;
  const rawSize = typeof sp.size === "string" ? parseInt(sp.size, 10) : NaN;
  const pageSize = [25, 50, 100].includes(rawSize) ? rawSize : (defaults.pageSize ?? 50);
  const search = typeof sp.search === "string" && sp.search.trim() ? sp.search.trim() : undefined;
  const sort = typeof sp.sort === "string" && sp.sort ? sp.sort : undefined;
  const rawDir = typeof sp.dir === "string" ? sp.dir : undefined;
  const dir: SortDir | undefined = rawDir === "asc" || rawDir === "desc" ? rawDir : undefined;
  return { page, pageSize, search, sort, dir };
}

export function validateSort(
  sort: string | undefined,
  dir: SortDir | undefined,
  allowed: readonly string[],
  defaultSort: string,
  defaultDir: SortDir,
): { column: string; ascending: boolean } {
  if (sort && allowed.includes(sort) && dir) {
    return { column: sort, ascending: dir === "asc" };
  }
  return { column: defaultSort, ascending: defaultDir === "asc" };
}

export function buildResult<T>(data: T[], total: number, params: PaginationParams): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / params.pageSize));
  return { data, total, page: params.page, pageSize: params.pageSize, totalPages };
}
