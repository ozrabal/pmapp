import { type ChangeEvent, useCallback, useRef, useState } from "react";

export type SortDir = "asc" | "desc";
export type OrderByKey =
  | "createdAt"
  | "days"
  | "description"
  | "email"
  | "endDate"
  | "expDate"
  | "firstName"
  | "id"
  | "lastName"
  | "name"
  | "requestedAt"
  | "signature"
  | "startDate"
  | "status"
  | "type"
  | "workEmail";

/**
 * @param sortOrderBy - custom sort key, by default set to "lastName"
 * Hook that manages query parameters in the URL for sorting and searching.
 * @returns Contains functions and state to handle URL updates for sorting and searching.
 */
export function useQueryParams() {
  // Use window.location for pathname and search
  const pathName = window.location.pathname;

  const [queryPhrase, setQueryPhrase] = useState("");

  // Get the current search parameters from the URL
  const searchParams = window.location.search;
  const urlParams = new URLSearchParams(searchParams);
  const sort = urlParams.get("sort")?.split(":");
  const currSort = {
    sortDir: sort?.[1],
    sortName: sort?.[0],
  };
  const params = new URLSearchParams(searchParams);
  console.log("Current URLSearchParams:", params.toString());
  // Native debounce implementation
  function debounceFn(fn: (searchParams: URLSearchParams, queryPhrase: string) => void, delay: number) {
    let timer: ReturnType<typeof setTimeout>;
    return (searchParams: URLSearchParams, queryPhrase: string) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn(searchParams, queryPhrase), delay);
    };
  }

  const debouncedSearch = useRef(
    debounceFn((searchParams: URLSearchParams, queryPhrase: string) => {
      if (queryPhrase) {
        setQueryPhrase(queryPhrase);
        searchParams.set("search", queryPhrase);
      } else {
        searchParams.delete("search");
      }
      searchParams.set("page", "1");
      window.history.replaceState(null, "", `${pathName}?${searchParams.toString()}`);
    }, 300)
  );

  /**
   * Handles search input changes.
   * @param {ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    debouncedSearch.current(params, encodeURIComponent(e.target.value));
  };

  /**
   * Handles sorting by a given header ID.
   * @param {string} headerId - The header ID to sort by.
   */
  const handleSort = (headerId: OrderByKey, sortDir?: SortDir) => {
    const newSortDir = currSort.sortDir === "desc" ? "asc" : "desc";
    params.set("sort", `${headerId}:${sortDir ?? newSortDir}`);
    window.history.replaceState(null, "", `${pathName}?${params.toString()}`);
  };

  const setSearchParams = useCallback(
    (key: string, value: string, prefix?: string) => {
      const newSearchParams = new URLSearchParams(window.location.search);
      newSearchParams.set(prefix ? `${prefix}_${key}` : key, value);

      window.history.replaceState(null, "", `${pathName}?${newSearchParams.toString()}`);
    },
    [pathName]
  );

  const removeSearchParam = useCallback(
    (key: string) => {
      const newSearchParams = new URLSearchParams(window.location.search);
      newSearchParams.delete(key);
      window.history.replaceState(null, "", `${pathName}?${newSearchParams.toString()}`);
    },
    [pathName]
  );

  const setMultipleSearchParams = useCallback(
    (paramsArr: { key: string; value: string }[], prefix?: string) => {
      const newSearchParams = new URLSearchParams(window.location.search);
      for (const param of paramsArr) {
        newSearchParams.set(prefix ? `${prefix}_${param.key}` : param.key, param.value);
      }
      window.history.replaceState(null, "", `${pathName}?${newSearchParams.toString()}`);
    },
    [pathName]
  );

  return {
    currSort,
    handleSearch,
    handleSort,
    queryPhrase,
    removeSearchParam,
    searchParams: params,
    setMultipleSearchParams,
    setSearchParams,
  };
}
