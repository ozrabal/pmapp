import { useQuery } from "@tanstack/react-query";
import { type InferSelectModel } from "drizzle-orm";
import apiClient from "@/api/utils/client";
import { type projects } from "@/db/schema";
import { type PaginatedQuery } from "@/api/utils/pagination";

export type UseProjectParams =
  | {
      page?: number;
      limit?: number;
    }
  | undefined;

type Project = InferSelectModel<typeof projects>;

export function useProjects({ page = 1, limit = 10 }: UseProjectParams = {}) {
  const getProjects = async () => {
    const response = await apiClient.get<PaginatedQuery<Project>>("/project", {
      params: { page, limit },
    });
    return response.data;
  };

  return useQuery({
    queryKey: ["projects", [page, limit]],
    queryFn: getProjects,
  });
}
