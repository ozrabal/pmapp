import { queryClient } from "@/services/queryClient";
import { useQuery } from "@tanstack/react-query";
import type { ProjectFilters } from "../dashboard/hooks/useProjectsFilters";

export type UseProjectParams =
  | {
      page?: number;
      limit?: number;
      filters?: ProjectFilters;
    }
  | undefined;

export function useProjects({ filters, page = 1, limit = 10 }: UseProjectParams = {}) {
  const getProjects = async () => {
    const response = await fetch(`/api/projects?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

  return useQuery(
    {
      queryKey: ["projects", [page, limit, filters]],
      queryFn: getProjects,
    },
    queryClient
  );
}
