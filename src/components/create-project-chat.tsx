"use client";

import { PaperclipIcon, MicIcon } from "lucide-react";
import { useEffect, useState, type FormEventHandler } from "react";
import { useSendMessage, useStartPlanning } from "@/lib/queries/planning";
import { useUser } from "@/hooks/useUser";
import { type ChatResponse } from "@/api/types/chat";
import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
  type PromptInputSubmitProps,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "./ui/prompt-input";
import { Lead } from "./ui/lead";
import { H3 } from "./ui/h3";
import { Muted } from "./ui/muted";

export default function CreateProjectChat() {
  const { user } = useUser();
  const userId = user?.id;

  const [sessionId, setSessionId] = useState<string | null>(null);

  const [conversation, setConversation] = useState<ChatResponse[]>([]);

  const [text, setText] = useState<string>("");
  const [status, setStatus] = useState<PromptInputSubmitProps["status"]>("idle");
  // const [planningData, setPlanningData] = useState<ChatResponse | null>(null);

  const { mutateAsync: startPlanning } = useStartPlanning({ userId });
  const { mutateAsync: sendMessage } = useSendMessage({ sessionId });

  useEffect(() => {
    async function initializePlanning() {
      if (userId) {
        const chatResponse = await startPlanning({ userId });
        setConversation((prev) => [...prev, chatResponse]);
        setSessionId(chatResponse.sessionId);
      }
    }
    initializePlanning();
  }, [userId, startPlanning]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!text) {
      return;
    }
    setStatus("submitted");

    const chatResponse = await sendMessage({ message: text });
    setConversation((prev) => [...prev, chatResponse]);
    setSessionId(chatResponse.sessionId);
    setText("");
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">
      {conversation.map((chatResponse, index) => (
        <div key={`${chatResponse.sessionId}-${index}`} className="flex flex-col gap-2">
          <Muted>
            {chatResponse.progress.currentStep}/{chatResponse.progress.totalSteps}
          </Muted>
          <Lead>{chatResponse.message}</Lead>
          <H3>{chatResponse.nextActions}</H3>
        </div>
      ))}

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputButton>
              <PaperclipIcon size={16} />
            </PromptInputButton>
            <PromptInputButton>
              <MicIcon size={16} />
              <span>Voice</span>
            </PromptInputButton>
          </PromptInputTools>
          <PromptInputSubmit disabled={!text} status={status} />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}
