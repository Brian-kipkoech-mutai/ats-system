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

  useEffect(() => {
    loadCandidatesData().catch(console.error);
  }, []);

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

  // react to new messages
  useEffect(() => {
    if (messages.length === 0) return;

    const last = messages[messages.length - 1];

    // Only handle assistant messages
    if (last.role === "assistant") {
      // Extract text from content parts
      const textContent = last.parts
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("");

      setStreamingMessage(textContent);

      // also push into timeline
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

  return (
    <div className="container mx-auto h-full grid grid-cols-1 lg:grid-cols-10 ">
      {/* chatpanel */}
      <div className="lg:col-span-5 h-full overflow-hidden">
        {" "}
        <ChatPanel
          onQuery={handleQuery}
          isProcessing={isProcessing}
          messages={messages}
        />
      </div>

      {/* results table */}
      <div className="lg:col-span-3 overflow-hidden">
        {" "}
        <ResultsTable
          candidates={filteredCandidates}
          onSelectCandidate={setSelectedCandidate}
          isLoading={isProcessing}
          sortCriteria={sortCriteria}
          sortOrder={sortOrder}
          onClose={onClose}
        />
      </div>

      {/* timeline panel */}
      <div className="lg:col-span-2   overflow-hidden">
        <TimelinePanel steps={timelineSteps} />
      </div>
      {/* candidate details */}
      {selectedCandidate && (
        <CandidateDetails
          onClose={onClose}
          open={open}
          candidate={selectedCandidate}
        />
      )}
    </div>
  );
}
