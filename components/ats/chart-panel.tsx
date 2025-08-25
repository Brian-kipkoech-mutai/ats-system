"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { cn, sanitizeText } from "@/lib/utils"; // optional
import { Markdown } from "@/components/markdown"; // optional
import { SparklesIcon } from "../icons";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { on } from "events";
import { SendHorizonal, SendHorizonalIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Greeting } from "../greeting";
import { SuggestedActions } from "../suggestedAction";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
// Lightweight message preview for parent Chat
function PreviewMessage({
  message,
}: {
  message: { id: string; role: string; parts: any[] };
}) {
  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        key={message.id}
        className="w-full mx-auto max-w-3xl px-4 py-2 group/message "
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "group-data-[role=user]/message:w-fit": true,
            }
          )}
        >
          {/* Role indicator (optional) */}
          {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          {/* Message content */}
          <div
            className={cn("flex flex-col gap-4 text-sm", {
              "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                message.role === "user",
            })}
          >
            {message.role === "user" ? (
              <div>{JSON.parse(message.parts[0].text).query}</div>
            ) : (
              message.parts.map((part, i) =>
                part.type === "text" ? (
                  <Markdown key={`${message.id}-${i}`}>
                    {sanitizeText(part.text)}
                  </Markdown>
                ) : null
              )
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ChatPanel({
  messages,
  onQuery,
  isProcessing,
}: {
  messages: { id: string; role: string; parts: any[] }[];
  onQuery: (query: string) => void;
  isProcessing: boolean;
}) {
  const [input, setInput] = useState("");
  const { containerRef, endRef, scrollToBottom } = useScrollToBottom();

  // ======== Smooth scroll logic for streaming chunks ========
  const debouncedScroll = useDebouncedCallback(() => {
    scrollToBottom();
  }, 100); // wait 100ms after last chunk

  useEffect(() => {
    if (messages.length > 0) {
      debouncedScroll();
    }
  }, [messages, isProcessing, debouncedScroll]);
  // =======

  const { scrollYProgress } = useScroll({ container: containerRef });

  // Smooth the progress value
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <div className="flex flex-col    h-screen lg:h-full bg-background border-r  ">
      <motion.div
        className="w-full h-2 pb-2 origin-left bg-gradient-to-r from-gray-200 via-gray-400 to-gray-800  rounded-full"
        style={{ scaleX: smoothProgress }}
      />
      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto py-4 space-y-2 "
        ref={containerRef}
      >
        {messages.length === 0 && !isProcessing && (
          <div className="max-w-3xl mx-auto  px-8 size-full flex flex-col justify-center gap-4 ">
            <Greeting />
            <SuggestedActions onQuery={onQuery} />
          </div>
        )}
        {messages.map((message) => (
          <PreviewMessage key={message.id} message={message} />
        ))}

        {isProcessing && (
          <div className="px-4 text-muted-foreground">Thinking...</div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          onQuery(input);
          setInput("");
        }}
        className="flex flex-row gap-2 relative items-end w-full px-4   "
      >
        <div className="  bg-inherit w-full max-w-screen-md  mx-auto">
          <div className="flex items-end gap-2 rounded-4xl  border  bg-gray-50 px-3 py-2 shadow-lg focus-within:ring-1 focus-within:ring-amber-gray-300 ">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  onQuery(input);
                  setInput("");
                }
              }}
              placeholder="Ask me to find candidates... (Enter to send)"
              className="min-h-[40px] max-h-[120px] flex-1 resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:outline-none shadow-none w-full "
              disabled={isProcessing}
            />
            <Button
              onClick={() => {
                if (!input.trim()) return;
                onQuery(input);
                setInput("");
              }}
              disabled={!input.trim() || isProcessing}
              size="icon"
              className="rounded-full  text-white hover:bg-gray-700 h-10 w-10 flex items-center justify-center"
            >
              <SendHorizonalIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
