import { PaperclipIcon, MicIcon } from "lucide-react";
import { useState, type FormEventHandler } from "react";
import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
  type PromptInputSubmitProps,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "./ui/prompt-input";

export default function CreateProjectChat() {
  const [text, setText] = useState<string>("");
  const [status, setStatus] = useState<PromptInputSubmitProps["status"]>("idle");
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
    <div className="p-8 w-full">
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
