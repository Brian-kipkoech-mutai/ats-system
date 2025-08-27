import { motion } from "framer-motion";
import { cn, sanitizeText } from "@/lib/utils";

import { Markdown } from "@/components/markdown";
import { SparklesIcon } from "./icons";
function PreviewMessage({
  message,
}: {
  message: { id: string; role: string; parts: any[] };
}) {
  return (
    <motion.div
      //   layout
      data-testid={`message-${message.role}`}
      key={message.id}
      className="w-full mx-auto max-w-3xl px-4 py-2 group/message"
      initial={{ y: 6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -6, opacity: 0 }}
      transition={{ duration: 0.22 }}
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
        {message.role === "assistant" && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
            <div className="translate-y-px">
              <SparklesIcon size={14} />
            </div>
          </div>
        )}

        <div
          className={cn("flex flex-col gap-4 text-sm", {
            "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
              message.role === "user",
          })}
        >
          {message.role === "user" ? (
            <div>{JSON.parse(message.parts[0].text).query}</div>
          ) : (
            message.parts.map((part: any, i: number) =>
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
  );
}

export default PreviewMessage;
