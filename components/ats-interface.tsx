"use client";

import { useState, useEffect } from "react";

import { ChatPanel } from "./ats/chart-panel";
import { TimelinePanel } from "./ats/timeline-panel";
import { ResultsTable } from "./ats/results-table";
import { CandidateDetails } from "./ats/candidate-details";
import { MCPWorkflow } from "@/lib/mcp-workflows";
import { loadCandidatesData } from "@/lib/data";
import type { Candidate, TimelineStep } from "@/lib/types/types";

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
    } catch (error) {
      console.error("Workflow error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto h-full flex  py-4 ">
      <ChatPanel
        onQuery={handleQuery}
        isProcessing={isProcessing}
        streamingMessage={streamingMessage}
      />
      <ResultsTable
        candidates={filteredCandidates}
        onSelectCandidate={setSelectedCandidate}
        isLoading={isProcessing}
        sortCriteria={sortCriteria}
        sortOrder={sortOrder}
      />

      <TimelinePanel steps={timelineSteps} />

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
