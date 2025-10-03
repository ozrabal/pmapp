import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import apiClient from "@/api/utils/client";
import { type ChatResponse } from "@/api/types/chat";

export type StartPlanningParams = {
  userId?: string | null;
};

const startPlanning = async ({ userId }: StartPlanningParams): Promise<ChatResponse> => {
  const response = await apiClient.post("/planning/start", { userId });
  return response.data;
};

export function useStartPlanning({ userId }: StartPlanningParams): UseMutationResult<ChatResponse> {
  return useMutation({
    mutationKey: ["planning", userId],
    mutationFn: () => startPlanning({ userId }),
  });
}
