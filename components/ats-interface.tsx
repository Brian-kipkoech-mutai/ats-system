"use client";
import { useChat } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import { ChatPanel } from "./ats/chart-panel";
import { TimelinePanel } from "./ats/timeline-panel";
import { ResultsTable } from "./ats/results-table";
import { CandidateDetails } from "./ats/candidate-details";
import { MCPWorkflow } from "@/lib/mcp-workflows";
import { loadCandidatesData } from "@/lib/data";
import type { Candidate, TimelineStep } from "@/lib/types/types";
import { DefaultChatTransport } from "ai";
import { AnimatePresence, motion } from "framer-motion";

export function AtsInterface() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [open, setOpen] = useState<boolean>(false);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [sortCriteria, setSortCriteria] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const onClose: () => void = () => setOpen((prev) => !prev);

  useEffect(() => {
    loadCandidatesData().catch(console.error);
  }, []);

  const handleStepUpdate = (step: TimelineStep) => {
    setTimelineSteps((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === step.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = step;
        return updated;
      } else {
        return [...prev, step];
      }
    });

    if (step.type === "speaking" && step.data?.message) {
      setStreamingMessage(step.data.message);
    }

    if (step.type === "ranking" && step.data?.ranking_plan) {
      setSortCriteria(step.data.ranking_plan.primary);
      setSortOrder(step.data.ranking_plan.order);
    }
  };

  const { messages, sendMessage } = useChat({
    onFinish: (message) => {
      handleStepUpdate({
        id: "speak",
        type: "speaking",
        title: "Generating response",
        timestamp: new Date(),
        status: "complete",
        data: { message },
      });
    },
    transport: new DefaultChatTransport({ api: "/api/mcp/speak" }),
  });

  useEffect(() => {
    if (messages.length === 0) return;

    const last = messages[messages.length - 1];
    if (last.role === "assistant") {
      const textContent = last.parts
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("");

      setStreamingMessage(textContent);

      setTimelineSteps((prev) => {
        const step: TimelineStep = {
          id: "speak",
          type: "speaking",
          title: "Generating response",
          timestamp: new Date(),
          status: "complete",
          data: { message: textContent },
        };
        const existingIndex = prev.findIndex((s) => s.id === step.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = step;
          return updated;
        } else {
          return [...prev, step];
        }
      });
    }
  }, [messages]);

  const handleQuery = async (query: string) => {
    setIsProcessing(true);
    setTimelineSteps([]);
    setStreamingMessage("");
    setFilteredCandidates([]);
    setSortCriteria("");

    try {
      const workflow = new MCPWorkflow(query, handleStepUpdate);
      const result = await workflow.execute();

      if (result.rankedCandidates) {
        setFilteredCandidates(result.rankedCandidates);
      }
      if (result.speakPayload) {
        await sendMessage({
          text: JSON.stringify(result.speakPayload),
        });
      }
    } catch (error) {
      console.error("Workflow error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const hasMessages = Array.isArray(messages) && messages.length > 0;

  const baseVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.995 },
    show: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.995 },
  };

  // --- INITIAL: chat-only (full width) ---
  if (!hasMessages) {
    return (
      <div className="container mx-auto h-full ">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key="chat-only"
            layout
            initial="hidden"
            animate="show"
            exit="exit"
            variants={baseVariants}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="h-full grid grid-cols-1 lg:grid-cols-10"
          >
            <motion.div
              layout
              className="lg:col-span-10 h-full overflow-y-auto p-4"
            >
              <ChatPanel
                onQuery={handleQuery}
                isProcessing={isProcessing}
                messages={messages}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // --- AFTER we have messages: show full layout (chat + results + timeline) ---
  return (
    <div className=" mx-auto h-full ">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key="full-layout"
          layout
          initial="hidden"
          animate="show"
          exit="exit"
          variants={baseVariants}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="h-full grid grid-cols-1 lg:grid-cols-10 gap-4"
        >
          {/* CHAT (left) */}
          <motion.div
            layout
            className="lg:col-span-5 h-full overflow-y-auto p-4"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.28 }}
          >
            <ChatPanel
              onQuery={handleQuery}
              isProcessing={isProcessing}
              messages={messages}
            />
          </motion.div>

          {/* RESULTS (middle) */}
          <motion.div
            layout
            className="lg:col-span-3 overflow-hidden h-full p-2"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.28, delay: 0.03 }}
          >
            <ResultsTable
              candidates={filteredCandidates}
              onSelectCandidate={setSelectedCandidate}
              isLoading={isProcessing}
              sortCriteria={sortCriteria}
              sortOrder={sortOrder}
              onClose={onClose}
            />
          </motion.div>

          {/* TIMELINE / DETAILS (right) */}
          <motion.div
            layout
            className="lg:col-span-2 overflow-hidden h-full p-2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.32, delay: 0.06 }}
          >
            <TimelinePanel steps={timelineSteps} />
          </motion.div>

          {/* CandidateDetails overlays when selected (keeps same DOM parent) */}
          {selectedCandidate && (
            <CandidateDetails
              onClose={onClose}
              open={open}
              candidate={selectedCandidate}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
