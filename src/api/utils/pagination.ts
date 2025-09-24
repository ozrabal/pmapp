export type PaginationDto = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type PaginatedQuery<T> = {
  data: T[];
  pagination: PaginationDto;
};

export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Execute a paginated query with a count query to get both results and pagination information
 *
 * @param baseQuery The base query to paginate (including any where clauses)
 * @param countQuery The query to use for counting total records
 * @param options Pagination options (page, limit)
 * @returns The data and pagination information
 */
export async function executePaginatedQuery<T>({
  baseQuery,
  countQuery,
  options,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseQuery: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countQuery: any;
  options: PaginationOptions;
}): Promise<PaginatedQuery<T>> {
  // Ensure valid pagination options
  const page = Math.max(1, options.page);
  const limit = Math.max(1, options.limit);
  const offset = (page - 1) * limit;

  // Apply pagination to base query
  const paginatedQuery = baseQuery.limit(limit).offset(offset);

  // Execute the data query and count query in parallel
  const [dataResult, countResult] = await Promise.all([paginatedQuery, countQuery]);

  // Calculate pagination information
  const total = Number(countResult[0].count);
  const pages = Math.ceil(total / limit);

  return {
    data: dataResult as T[],
    pagination: {
      total,
      page,
      limit,
      pages,
    },
  };
}
