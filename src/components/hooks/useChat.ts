import { queryClient } from "@/services/queryClient";
import { useQuery } from "@tanstack/react-query";

export type ChatStep = "start" | "continue" | "end";

export interface UseChatParams {
  step: ChatStep;
  payload?: Record<string, unknown>;
}

const endpointMap: Record<ChatStep, string> = {
  start: "/api/chat/start",
  continue: "/api/chat/message",
  end: "/api/chat/complete",
};

export function useChat({ step, payload = {} }: UseChatParams) {
  const getChat = async () => {
    const endpoint = endpointMap[step];
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

  return useQuery(
    {
      queryKey: ["chat", [step, payload]],
      queryFn: getChat,
    },
    queryClient
  );
}
