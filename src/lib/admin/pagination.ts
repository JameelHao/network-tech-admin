export type PaginationParams = {
  page: number;
  pageSize: number;
  search?: string;
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
  return { page, pageSize, search };
}

export function buildResult<T>(data: T[], total: number, params: PaginationParams): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / params.pageSize));
  return { data, total, page: params.page, pageSize: params.pageSize, totalPages };
}
