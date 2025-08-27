"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { SendHorizonalIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Greeting } from "../greeting";
import { SuggestedActions } from "../suggestedAction";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import PreviewMessage from "../preview-message";

// default messages param to [] to avoid undefined
export function ChatPanel({
  messages = [],
  onQuery,
  isProcessing,
}: {
  messages?: { id: string; role: string; parts: any[] }[];
  onQuery: (query: string) => void;
  isProcessing: boolean;
}) {
  const [input, setInput] = useState("");
  const { containerRef, endRef, scrollToBottom } = useScrollToBottom();

  // debug: confirm messages length on each render
  // eslint-disable-next-line no-console
  console.log("ChatPanel render, messages.length:", messages?.length);

  const debouncedScroll = useDebouncedCallback(() => {
    scrollToBottom();
  }, 100);

  useEffect(() => {
    if ((messages || []).length > 0) {
      debouncedScroll();
    }
  }, [messages, isProcessing, debouncedScroll]);

  const { scrollYProgress } = useScroll({ container: containerRef as any });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      className={cn("flex flex-col h-full bg-background", {
        "border-r": (messages || []).length > 0 && !!isProcessing,
      })}
    >
      <motion.div
        className="w-full h-2 pb-2 origin-left bg-gradient-to-r from-gray-200 via-gray-400 to-gray-800 rounded-full"
        style={{ scaleX: smoothProgress }}
      />

      <div className="flex-1 overflow-y-auto py-4 space-y-2" ref={containerRef}>
        {/* EMPTY STATE: Greeting + SuggestedActions */}
        <AnimatePresence mode="wait">
          {(messages || []).length === 0 && !isProcessing && (
            <motion.div
              key="empty-state"
              className="max-w-3xl mx-auto px-8 h-full w-full flex flex-col justify-center gap-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32 }}
            >
              <Greeting />
              <SuggestedActions onQuery={onQuery} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* MESSAGE LIST */}
        <div>
          <div >
            {messages?.map((message) => (
              <PreviewMessage key={message.id} message={message} />
            ))}
          </div>
        </div>

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
        className="flex flex-row gap-2 relative items-end w-full px-4"
      >
        <div className="bg-inherit w-full max-w-screen-md mx-auto">
          <div className="flex items-end gap-2 rounded-full border bg-gray-50 px-3 py-2 shadow-lg focus-within:ring-1 focus-within:ring-gray-600">
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
              className="min-h-[40px] max-h-[120px] flex-1 resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:outline-none shadow-none w-full"
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
              className="rounded-full text-white hover:bg-gray-700 h-10 w-10 flex items-center justify-center"
            >
              <SendHorizonalIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
