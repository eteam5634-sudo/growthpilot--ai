export const DEFAULT_PAGE_SIZE = 10;

export function paginateRange(page: number, pageSize = DEFAULT_PAGE_SIZE) {
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to, page: safePage, pageSize };
}

export function totalPages(total: number, pageSize = DEFAULT_PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
