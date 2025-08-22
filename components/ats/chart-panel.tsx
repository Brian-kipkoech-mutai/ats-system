"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Sparkles } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

interface ChatPanelProps {
  onQuery: (query: string) => void;
  isProcessing: boolean;
  streamingMessage?: string;
}

const EXAMPLE_QUERIES = [
  "Backend engineers in Germany, most experience first",
  "Frontend developers willing to relocate, sorted by salary",
  "Remote React developers with 5+ years experience",
  "Full-stack engineers available within 2 weeks",
];

export function ChatPanel({
  onQuery = () => {},
  isProcessing = false,
  streamingMessage = undefined,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        'Hello! I\'m ATS-Lite. Ask me to find candidates using natural language. For example: "Backend engineers in Germany, most experience first" or "Frontend developers willing to relocate, sorted by salary".',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (streamingMessage) {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.streaming) {
          // Update existing streaming message
          return prev.map((msg, index) =>
            index === prev.length - 1
              ? { ...msg, content: streamingMessage }
              : msg
          );
        } else {
          // Add new streaming message
          return [
            ...prev,
            {
              id: `streaming-${Date.now()}`,
              type: "assistant",
              content: streamingMessage,
              timestamp: new Date(),
              streaming: true,
            },
          ];
        }
      });
    }
  }, [streamingMessage]);

  useEffect(() => {
    if (!isProcessing) {
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          streaming: false,
        }))
      );
    }
  }, [isProcessing]);

  const handleSubmit = () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    onQuery(input.trim());
    setInput("");
  };

  const handleExampleClick = (example: string) => {
    if (isProcessing) return;
    setInput(example);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full  flex-1">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Chat with ATS-Lite</h2>
        </div>
        <p className="text-sm text-muted-foreground">Use ⌘+Enter to send</p>
      </div>

      <ScrollArea
        className="flex-1 p-4 overflow-y-scroll scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-muted/50"
        ref={scrollAreaRef}
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                  {message.streaming && (
                    <Loader2 className="h-3 w-3 animate-spin ml-2" />
                  )}
                </div>
              </div>
            </div>
          ))}
          {isProcessing && !streamingMessage && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}

          {/* Example queries */}
          {messages.length === 1 && !isProcessing && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Try these examples:
              </p>
              <div className="grid gap-2">
                {EXAMPLE_QUERIES.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="text-left text-xs p-2 rounded border border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 hover:bg-muted/50 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-inherit   ">
        <div className="flex items-end gap-2 rounded-4xl border bg-gray-50 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-amber-gray-300">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to find candidates... (⌘+Enter to send)"
            className="min-h-[40px] max-h-[120px] flex-1 resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:outline-none shadow-none"
            disabled={isProcessing}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isProcessing}
            size="icon"
            className="rounded-full  text-white hover:bg-blue-700 h-10 w-10 flex items-center justify-center"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
