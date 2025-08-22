"use client";

import { ChatPanel } from "@/components/ats/chart-panel";
import { ResultsTable } from "@/components/ats/results-table";
import { TimelinePanel } from "@/components/ats/timeline-panel";
import { mockCandidates } from "@/lib/types/types";
import type { TimelineStep } from "@/lib/types/types";
export default function Home() {
  return (
    <main className="h-screen bg-background ">
      <div className="container mx-auto h-full flex  py-4 ">
        <ChatPanel
          onQuery={() => {}}
          isProcessing={false}
          streamingMessage={undefined}
        />
        <ResultsTable
          candidates={mockCandidates}
          onSelectCandidate={() => {}}
        />

        <TimelinePanel steps={timeLine} />
      </div>
    </main>
  );
}

export const timeLine: TimelineStep[] = [
  {
    id: "think",
    type: "thinking",
    title: "Analyzing query",
    timestamp: new Date("2025-08-22T19:14:36.407Z"),
    status: "complete",
    data: {
      filter: {
        include: {
          skills: [
            "full-stack",
            "backend",
            "frontend",
            "javascript",
            "html",
            "css",
          ],
        },
      },
      rank: {
        primary: "availability",
        order: "asc",
      },
    },
  },
  {
    id: "filter",
    type: "filtering",
    title: "Filtering candidates",
    timestamp: new Date("2025-08-22T19:14:36.407Z"),
    status: "complete",
    data: {
      count: 12,
      filter_plan: {
        include: {
          skills: [
            "full-stack",
            "backend",
            "frontend",
            "javascript",
            "html",
            "css",
          ],
        },
      },
    },
  },
  {
    id: "rank",
    type: "ranking",
    title: "Ranking candidates",
    timestamp: new Date("2025-08-22T19:14:36.407Z"),
    status: "complete",
    data: {
      ranked_ids: ["11", "23", "15", "12", "31"],
      ranking_plan: {
        primary: "availability",
        order: "asc",
      },
      stats: {
        count: 12,
        avg_experience: 10.1,
        top_skills: ["JavaScript", "Spring", "Rust", "FastAPI", "Go"],
      },
    },
  },
  {
    id: "speak",
    type: "speaking",
    title: "Generating response",
    timestamp: new Date("2025-08-22T19:14:36.407Z"),
    status: "active",
  },
];
