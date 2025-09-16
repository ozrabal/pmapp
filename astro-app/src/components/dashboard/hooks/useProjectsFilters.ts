import { useState, useCallback, useMemo } from "react";
import { useQueryParams } from "@/components/hooks/useQueryParams";

export type ProjectFilters<K extends string = string> = Partial<Record<K, string>>;

/**
 * useProjectsFilters
 * @param allowedKeys - list of allowed filter keys (readonly array is accepted)
 * @param initialDefaults - optional initial default values for filters (used when URL has no value)
 */
export function useProjectsFilters<K extends string = string>(
  /**
   * Either a readonly array of allowed keys or an object mapping allowed keys to default values.
   * Examples:
   * - `['status', 'owner'] as const`
   * - `{ status: 'open', owner: 'team-a' } as const`
   */
  allowedAndDefaults: readonly K[] | Readonly<Partial<Record<K, string>>>
) {
  const { setSearchParams, searchParams, removeSearchParam } = useQueryParams();

  // Normalize inputs: derive allowed keys array and initial defaults object from single param
  const { allowedKeys, initialDefaults } = useMemo(() => {
    if (Array.isArray(allowedAndDefaults)) {
      return { allowedKeys: allowedAndDefaults as readonly K[], initialDefaults: {} as ProjectFilters<K> };
    }
    return {
      allowedKeys: Object.keys(allowedAndDefaults) as K[],
      initialDefaults: { ...(allowedAndDefaults as Partial<Record<K, string>>) } as ProjectFilters<K>,
    };
  }, [allowedAndDefaults]);

  const defaults: ProjectFilters<K> = useMemo(() => ({ ...initialDefaults }), [initialDefaults]);

  // Merge URL params (they override defaults) for allowed keys
  const initialFilters: ProjectFilters<K> = { ...defaults };
  for (const [key, value] of searchParams.entries()) {
    if (allowedKeys.includes(key as K) && value) {
      initialFilters[key as K] = value;
    }
  }

  const [filters, setFilters] = useState<ProjectFilters<K>>(initialFilters);

  // Update filters and sync with URL (functional state update to avoid stale closures)
  const updateFilters = useCallback(
    (newFilters: Partial<ProjectFilters<K>>) => {
      setFilters((prev) => {
        const merged = { ...prev, ...newFilters };

        allowedKeys.forEach((key) => {
          const value = merged[key];
          if (value) {
            setSearchParams(key, value);
          } else {
            // clear param when value is empty/undefined
            // setSearchParams(key, "");
            removeSearchParam(key);
          }
        });
        return merged;
      });
      // setSearchParams("page", "1"); // Reset page on filter change
    },
    [allowedKeys, setSearchParams, removeSearchParam]
  );

  // Reset filters to initial defaults (or empty) and sync URL
  const resetFilters = useCallback(() => {
    const resetTo: ProjectFilters<K> = { ...initialDefaults };
    console.log("RESET TO", resetTo);
    setFilters(resetTo);
    allowedKeys.forEach((key) => {
      removeSearchParam(key);
      // const value = resetTo[key];
      // if (value) setSearchParams(key, value);
      // else setSearchParams(key, "");
    });
    // setSearchParams("page", "1");
  }, [initialDefaults, allowedKeys, removeSearchParam]);

  return {
    filters,
    setFilters,
    updateFilters,
    resetFilters,
  };
}
