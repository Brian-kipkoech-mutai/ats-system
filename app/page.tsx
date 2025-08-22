"use client";

import { ChatPanel } from "@/components/ats/chart-panel";
import { ResultsTable } from "@/components/ats/results-table";
import { mockCandidates } from "@/lib/types/types";

export default function Home() {
  return (
    <main className="h-screen bg-background">
      <div className="container mx-auto h-full flex  py-4 space-y-4">
        <ChatPanel
          onQuery={() => {}}
          isProcessing={false}
          streamingMessage={undefined}
        />
        <ResultsTable
          candidates={mockCandidates}
          onSelectCandidate={() => {}}
        />
      </div>
    </main>
  );
}
