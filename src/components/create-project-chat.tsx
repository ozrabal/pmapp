"use client";

import { PaperclipIcon, MicIcon } from "lucide-react";
import { useEffect, useState, type FormEventHandler } from "react";
import { useStartPlanning } from "@/lib/queries/planning";
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

  const [text, setText] = useState<string>("");
  const [status, setStatus] = useState<PromptInputSubmitProps["status"]>("idle");
  const [planningData, setPlanningData] = useState<ChatResponse | null>(null);

  const { mutateAsync: startPlanning } = useStartPlanning({ userId });

  useEffect(() => {
    async function initializePlanning() {
      if (userId) {
        const chatResponse = await startPlanning({ userId });
        setPlanningData(chatResponse);
      }
    }
    initializePlanning();
  }, [userId, startPlanning]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (!text) {
      return;
    }
    setStatus("submitted");
    setTimeout(() => {
      setStatus("streaming");
    }, 200);
    setTimeout(() => {
      setStatus("idle");
      setText("");
    }, 2000);
  };
  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">
      {planningData && (
        <div className="flex flex-col gap-2">
          <Muted>
            {planningData.progress.currentStep}/{planningData.progress.totalSteps}
          </Muted>
          <Lead>{planningData.message}</Lead>
          <H3>{planningData.nextActions}</H3>
        </div>
      )}

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
