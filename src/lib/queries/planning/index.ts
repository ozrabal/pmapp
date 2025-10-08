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
    mutationKey: ["planning", "start", userId],
    mutationFn: () => startPlanning({ userId }),
  });
}

export type SendMessageParams = {
  sessionId?: string | null;
  message: string;
};

const sendMessage = async ({ sessionId, message }: SendMessageParams): Promise<ChatResponse> => {
  const response = await apiClient.post("/planning/message", { sessionId, message });
  return response.data;
};

export function useSendMessage({
  sessionId,
}: {
  sessionId?: string | null;
}): UseMutationResult<ChatResponse, unknown, { message: string }> {
  return useMutation({
    mutationKey: ["planning", "message", sessionId],
    mutationFn: ({ message }) => sendMessage({ sessionId, message }),
  });
}
