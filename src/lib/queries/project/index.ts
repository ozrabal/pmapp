import { useQuery } from "@tanstack/react-query";
import { type InferSelectModel } from "drizzle-orm";
import apiClient from "@/api/utils/client";
import { type projects } from "@/db/schema";
import { type PaginatedQuery } from "@/api/utils/pagination";

export type GetProjectParams = {
  page?: number;
  limit?: number;
};

export type UseProjectParams = GetProjectParams | undefined;

type Project = InferSelectModel<typeof projects>;

const getProjects = async ({ page, limit }: GetProjectParams): Promise<PaginatedQuery<Project>> => {
  const response = await apiClient.get<PaginatedQuery<Project>>("/project", {
    params: { page, limit },
  });
  return response.data;
};

export function useProjects({ page = 1, limit = 10 }: UseProjectParams = {}) {
  return useQuery({
    queryKey: ["projects", [page, limit]],
    queryFn: () => getProjects({ page, limit }),
  });
}
