 "use client";

 import { useChat } from "@ai-sdk/react";
 import { useState } from "react";
 import { motion ,AnimatePresence} from "framer-motion";
 import { cn, sanitizeText } from "@/lib/utils"; // optional
 import { Markdown } from "@/components/markdown"; // optional

 // Lightweight message preview for parent Chat
 function PreviewMessage({
   message,
 }: {
   message: { id: string; role: string; parts: any[] };
 }) {
   return (
     <AnimatePresence>
       <motion.div
         key={message.id}
         className="w-full mx-auto max-w-3xl px-4 py-2"
         initial={{ y: 5, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         data-role={message.role}
       >
         <div
           className={cn("flex gap-4 w-full", {
             "ml-auto max-w-2xl": message.role === "user",
           })}
         >
           {/* Role indicator (optional) */}
           {message.role === "assistant" && (
             <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
               ✨
             </div>
           )}

           {/* Message content */}
           <div
             className={cn("flex flex-col gap-2 w-full", {
               "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                 message.role === "user",
             })}
           >
             {message.parts.map((part, i) =>
               part.type === "text" ? (
                 <Markdown key={`${message.id}-${i}`}>
                   {sanitizeText(part.text)}
                 </Markdown>
               ) : null
             )}
           </div>
         </div>
       </motion.div>
     </AnimatePresence>
   );
 }

 export default function Chat() {
   const [input, setInput] = useState("");
   const { messages, sendMessage } = useChat();

   return (
     <div className="flex flex-col min-w-0 h-dvh bg-background">
       {/* Messages */}
       <div className="flex-1 overflow-y-auto py-4 space-y-2">
         {messages.map((message) => (
           <PreviewMessage key={message.id} message={message} />
         ))}
       </div>

       {/* Input form */}
       <form
         onSubmit={(e) => {
           e.preventDefault();
           sendMessage({ text: input });
           setInput("");
         }}
         className="p-4"
       >
         <input
           className="w-full max-w-md p-2 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
           value={input}
           placeholder="Say something..."
           onChange={(e) => setInput(e.currentTarget.value)}
         />
       </form>
     </div>
   );
 }
